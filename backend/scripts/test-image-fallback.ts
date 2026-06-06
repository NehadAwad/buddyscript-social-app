#!/usr/bin/env tsx
/**
 * Unit + integration tests for ephemeral upload fallback behavior.
 * Run: npm run test:image-fallback (from backend/)
 */
import fs from "node:fs";
import path from "node:path";
import {
  FALLBACK_IMAGE_PATH,
  FALLBACK_IMAGE_URL,
  ephemeralUploadExists,
  isEphemeralUploadUrl,
  resolvePostImageUrl,
} from "../src/utils/postImage";
import { uploadsDir } from "../src/middleware/upload.middleware";

const API = process.env.API_BASE_URL ?? "http://localhost:4000/api";
const ORIGIN = API.replace(/\/api\/?$/, "");
const COOKIE_FILE = path.join(process.cwd(), ".test-image-fallback-cookies.txt");
const TEST_IMAGE = path.resolve(process.cwd(), "assets/static/post-fallback.png");

let passed = 0;
let failed = 0;

function pass(name: string): void {
  console.log(`✓ ${name}`);
  passed += 1;
}

function fail(name: string, detail: string): void {
  console.log(`✗ ${name}`);
  console.log(`  ${detail}`);
  failed += 1;
}

function check(name: string, condition: boolean, detail: string): void {
  if (condition) {
    pass(name);
  } else {
    fail(name, detail);
  }
}

function runUnitTests(): void {
  console.log("\n--- Unit tests ---\n");

  check(
    "isEphemeralUploadUrl detects /uploads paths",
    isEphemeralUploadUrl("/uploads/abc.png") &&
      !isEphemeralUploadUrl("/static/post-fallback.png"),
    "upload prefix not detected correctly"
  );

  check(
    "committed fallback asset exists",
    fs.existsSync(FALLBACK_IMAGE_PATH),
    `missing ${FALLBACK_IMAGE_PATH}`
  );

  check(
    "FALLBACK_IMAGE_URL default",
    FALLBACK_IMAGE_URL === "/static/post-fallback.png",
    `unexpected default: ${FALLBACK_IMAGE_URL}`
  );

  const missingUrl = "/uploads/00000000-0000-4000-8000-000000000099.png";
  check(
    "resolvePostImageUrl maps missing upload to fallback",
    resolvePostImageUrl(missingUrl) === FALLBACK_IMAGE_URL,
    `got ${resolvePostImageUrl(missingUrl)}`
  );

  check(
    "resolvePostImageUrl passes through static paths",
    resolvePostImageUrl("/static/post-fallback.png") === "/static/post-fallback.png",
    "static path altered"
  );

  check(
    "resolvePostImageUrl passes through null",
    resolvePostImageUrl(null) === null,
    "null not preserved"
  );

  if (!fs.existsSync(TEST_IMAGE)) {
    fail("unit test setup", `test image missing: ${TEST_IMAGE}`);
    return;
  }

  const tempName = `test-fallback-${Date.now()}.png`;
  const tempPath = path.join(uploadsDir, tempName);
  fs.copyFileSync(TEST_IMAGE, tempPath);

  try {
    const tempUrl = `/uploads/${tempName}`;
    check(
      "ephemeralUploadExists true when file present",
      ephemeralUploadExists(tempUrl),
      "expected file to exist"
    );
    check(
      "resolvePostImageUrl keeps existing upload path",
      resolvePostImageUrl(tempUrl) === tempUrl,
      `got ${resolvePostImageUrl(tempUrl)}`
    );
  } finally {
    fs.unlinkSync(tempPath);
  }

  check(
    "resolvePostImageUrl maps deleted upload to fallback",
    resolvePostImageUrl(`/uploads/${tempName}`) === FALLBACK_IMAGE_URL,
    "fallback not applied after delete"
  );
}

async function runIntegrationTests(): Promise<void> {
  console.log("\n--- Integration tests ---\n");

  if (!fs.existsSync(TEST_IMAGE)) {
    fail("integration skipped setup", `test image missing: ${TEST_IMAGE}`);
    return;
  }

  try {
    fs.unlinkSync(COOKIE_FILE);
  } catch {
    // ignore
  }

  const loginShell = await runCurl([
    "-s",
    "-c",
    COOKIE_FILE,
    "-w",
    "\nHTTP_STATUS:%{http_code}",
    "-X",
    "POST",
    `${API}/auth/login`,
    "-H",
    "Content-Type: application/json",
    "-d",
    '{"email":"devenehad622@gmail.com","password":"Imbest007"}',
  ]);

  check("login for integration tests", loginShell.status === 200, loginShell.detail);

  if (loginShell.status !== 200) {
    return;
  }

  const createShell = await runCurl([
    "-s",
    "-b",
    COOKIE_FILE,
    "-c",
    COOKIE_FILE,
    "-w",
    "\nHTTP_STATUS:%{http_code}",
    "-X",
    "POST",
    `${API}/posts`,
    "-F",
    "content=Image fallback integration test",
    "-F",
    "visibility=public",
    "-F",
    `image=@${TEST_IMAGE}`,
  ]);

  let postId = "";
  let storedUploadUrl = "";
  let uploadFilename = "";

  try {
    const created = JSON.parse(createShell.stdout) as {
      post?: { id?: string; imageUrl?: string };
    };
    postId = created.post?.id ?? "";
    storedUploadUrl = created.post?.imageUrl ?? "";
    uploadFilename = path.basename(storedUploadUrl);

    check(
      "create image post returns upload URL while file exists",
      createShell.ok &&
        storedUploadUrl.startsWith("/uploads/") &&
        Boolean(uploadFilename),
      `status=${createShell.status} body=${createShell.stdout}`
    );

    const uploadLive = await runCurl([
      "-s",
      "-o",
      "/dev/null",
      "-w",
      "%{http_code}",
      `${ORIGIN}${storedUploadUrl}`,
    ]);
    check(
      "GET /uploads/:file serves uploaded image",
      uploadLive.stdout === "200",
      `status=${uploadLive.stdout}`
    );

    const getPostLive = await runCurl([
      "-s",
      "-b",
      COOKIE_FILE,
      "-w",
      "\nHTTP_STATUS:%{http_code}",
      `${API}/posts/${postId}`,
    ]);
    const livePost = JSON.parse(getPostLive.stdout) as {
      post?: { imageUrl?: string };
    };
    check(
      "GET /posts/:id returns upload URL while file exists",
      getPostLive.ok && livePost.post?.imageUrl === storedUploadUrl,
      getPostLive.stdout
    );

    const uploadPath = path.join(uploadsDir, uploadFilename);
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }

    check(
      "simulated restart: upload file removed from disk",
      !fs.existsSync(uploadPath),
      "file still on disk"
    );

    const uploadMissing = await runCurl([
      "-s",
      "-o",
      "/tmp/fallback-response.bin",
      "-w",
      "%{http_code}",
      `${ORIGIN}/uploads/${uploadFilename}`,
    ]);
    check(
      "GET /uploads/:file serves fallback when upload missing",
      uploadMissing.stdout === "200" &&
        fs.statSync("/tmp/fallback-response.bin").size > 0,
      `status=${uploadMissing.stdout}`
    );

    const staticFallback = await runCurl([
      "-s",
      "-o",
      "/dev/null",
      "-w",
      "%{http_code}",
      `${ORIGIN}${FALLBACK_IMAGE_URL}`,
    ]);
    check(
      "GET /static/post-fallback.png is available",
      staticFallback.stdout === "200",
      `status=${staticFallback.stdout}`
    );

    const getPostAfter = await runCurl([
      "-s",
      "-b",
      COOKIE_FILE,
      "-w",
      "\nHTTP_STATUS:%{http_code}",
      `${API}/posts/${postId}`,
    ]);
    const afterPost = JSON.parse(getPostAfter.stdout) as {
      post?: { imageUrl?: string };
    };
    check(
      "GET /posts/:id returns fallback URL after restart",
      getPostAfter.ok && afterPost.post?.imageUrl === FALLBACK_IMAGE_URL,
      `expected ${FALLBACK_IMAGE_URL}, got ${afterPost.post?.imageUrl}`
    );

    const feedAfter = await runCurl([
      "-s",
      "-b",
      COOKIE_FILE,
      "-w",
      "\nHTTP_STATUS:%{http_code}",
      `${API}/posts?limit=20`,
    ]);
    const feed = JSON.parse(feedAfter.stdout) as {
      posts?: Array<{ id?: string; imageUrl?: string | null }>;
    };
    const feedPost = feed.posts?.find((item) => item.id === postId);
    check(
      "GET /posts feed resolves fallback for missing upload",
      feedAfter.ok && feedPost?.imageUrl === FALLBACK_IMAGE_URL,
      `feed imageUrl=${feedPost?.imageUrl}`
    );
  } finally {
    if (postId) {
      await runCurl([
        "-s",
        "-b",
        COOKIE_FILE,
        "-X",
        "DELETE",
        `${API}/posts/${postId}`,
      ]);
    }
    try {
      fs.unlinkSync(COOKIE_FILE);
    } catch {
      // ignore
    }
  }
}

async function runCurl(args: string[]): Promise<{
  ok: boolean;
  status: number;
  stdout: string;
  detail: string;
}> {
  const { execFileSync } = await import("node:child_process");
  try {
    const raw = execFileSync("curl", args, { encoding: "utf8" }).trim();
    const statusMatch = raw.match(/HTTP_STATUS:(\d+)$/);
    const status = statusMatch ? Number(statusMatch[1]) : 200;
    const stdout = raw.replace(/\nHTTP_STATUS:\d+$/, "");
    return {
      ok: status >= 200 && status < 300,
      status,
      stdout,
      detail: statusMatch ? "" : raw,
    };
  } catch (error) {
    const err = error as { stdout?: string; status?: number; message?: string };
    const raw = err.stdout?.toString().trim() ?? "";
    const statusMatch = raw.match(/HTTP_STATUS:(\d+)$/);
    const status = statusMatch ? Number(statusMatch[1]) : err.status ?? 0;
    const stdout = raw.replace(/\nHTTP_STATUS:\d+$/, "");
    return {
      ok: false,
      status,
      stdout,
      detail: err.message ?? "curl failed",
    };
  }
}

async function main(): Promise<void> {
  console.log("Image fallback test suite");

  runUnitTests();
  await runIntegrationTests();

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
