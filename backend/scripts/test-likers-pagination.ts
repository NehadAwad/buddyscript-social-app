#!/usr/bin/env tsx
/**
 * Integration test: likers list cursor pagination.
 * Run: npm run test:likers-pagination (from backend/, API must be running)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const API = process.env.API_BASE_URL ?? "http://localhost:4000/api";
const ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const COOKIE_FILE = path.join(process.cwd(), ".test-likers-pagination-cookies.txt");

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

interface CurlResult {
  ok: boolean;
  status: number;
  stdout: string;
  detail: string;
}

function runCurl(args: string[]): CurlResult {
  const result = spawnSync("curl", args, { encoding: "utf8" });
  const stdout = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  if (result.error) {
    return {
      ok: false,
      status: 0,
      stdout: "",
      detail: result.error.message,
    };
  }

  const statusMatch = stdout.match(/HTTP_STATUS:(\d+)/);
  const status = statusMatch ? Number(statusMatch[1]) : 0;
  const body = stdout.replace(/\nHTTP_STATUS:\d+$/, "");
  return {
    ok: status >= 200 && status < 300,
    status,
    stdout: body,
    detail: `status=${status} body=${body.slice(0, 200)}`,
  };
}

async function registerAndLogin(
  email: string,
  password: string,
  cookieFile: string
): Promise<boolean> {
  const register = runCurl([
    "-s",
    "-w",
    "\nHTTP_STATUS:%{http_code}",
    "-X",
    "POST",
    `${API}/auth/register`,
    "-H",
    "Content-Type: application/json",
    "-H",
    `Origin: ${ORIGIN}`,
    "-d",
    JSON.stringify({
      firstName: "Test",
      lastName: "User",
      email,
      password,
    }),
  ]);

  if (register.status !== 201 && register.status !== 409) {
    return false;
  }

  const login = runCurl([
    "-s",
    "-c",
    cookieFile,
    "-w",
    "\nHTTP_STATUS:%{http_code}",
    "-X",
    "POST",
    `${API}/auth/login`,
    "-H",
    "Content-Type: application/json",
    "-H",
    `Origin: ${ORIGIN}`,
    "-d",
    JSON.stringify({ email, password }),
  ]);

  return login.status === 200;
}

async function main(): Promise<void> {
  console.log("Likers pagination integration test\n");

  try {
    fs.unlinkSync(COOKIE_FILE);
  } catch {
    // ignore
  }

  const health = runCurl(["-s", "-w", "\nHTTP_STATUS:%{http_code}", `${API}/health`]);
  check("API health", health.status === 200, health.detail);
  if (health.status !== 200) {
    console.log("\nStart the API first: npm run dev");
    process.exit(1);
  }

  const runId = Date.now();
  const authorEmail = `likers-author-${runId}@test.local`;
  const password = "TestPass123!";
  // Keep within auth rate limit (20 requests / 15 min): 2 auth calls per user.
  const likerCount = 7;
  const pageSize = 3;

  check(
    "register author",
    await registerAndLogin(authorEmail, password, COOKIE_FILE),
    "author auth failed"
  );

  const createPost = runCurl([
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
    "-H",
    `Origin: ${ORIGIN}`,
    "-H",
    "Content-Type: application/json",
    "-d",
    JSON.stringify({ content: "Likers pagination test post", visibility: "public" }),
  ]);

  let postId = "";
  try {
    const created = JSON.parse(createPost.stdout) as { post?: { id?: string } };
    postId = created.post?.id ?? "";
  } catch {
    // handled below
  }

  check(
    "create post",
    createPost.ok && Boolean(postId),
    createPost.detail
  );

  if (!postId) {
    process.exit(1);
  }

  for (let i = 0; i < likerCount; i += 1) {
    const likerEmail = `likers-user-${runId}-${i}@test.local`;
    const likerCookie = path.join(process.cwd(), `.test-liker-${i}.txt`);

    const ok = await registerAndLogin(likerEmail, password, likerCookie);
    if (!ok) {
      fail(`register liker ${i}`, "auth failed");
      continue;
    }

    const like = runCurl([
      "-s",
      "-b",
      likerCookie,
      "-w",
      "\nHTTP_STATUS:%{http_code}",
      "-X",
      "POST",
      `${API}/likes`,
      "-H",
      `Origin: ${ORIGIN}`,
      "-H",
      "Content-Type: application/json",
      "-d",
      JSON.stringify({ targetId: postId, targetType: "post" }),
    ]);

    if (!like.ok) {
      fail(`like from user ${i}`, like.detail);
    }

    try {
      fs.unlinkSync(likerCookie);
    } catch {
      // ignore
    }
  }

  pass(`seeded ${likerCount} likers`);

  const page1 = runCurl([
    "-s",
    "-b",
    COOKIE_FILE,
    "-w",
    "\nHTTP_STATUS:%{http_code}",
    `${API}/likes/${postId}/users?type=post&limit=${pageSize}`,
  ]);

  let page1Users: { id: string }[] = [];
  let cursor1: string | null = null;
  try {
    const parsed = JSON.parse(page1.stdout) as {
      users?: { id: string }[];
      nextCursor?: string | null;
    };
    page1Users = parsed.users ?? [];
    cursor1 = parsed.nextCursor ?? null;
  } catch {
    // handled below
  }

  check(
    "page 1 returns full page and cursor",
    page1.ok && page1Users.length === pageSize && Boolean(cursor1),
    `count=${page1Users.length} cursor=${cursor1 ?? "null"}`
  );

  const page2 = runCurl([
    "-s",
    "-b",
    COOKIE_FILE,
    "-w",
    "\nHTTP_STATUS:%{http_code}",
    `${API}/likes/${postId}/users?type=post&limit=${pageSize}&cursor=${encodeURIComponent(cursor1 ?? "")}`,
  ]);

  let page2Users: { id: string }[] = [];
  let cursor2: string | null = null;
  try {
    const parsed = JSON.parse(page2.stdout) as {
      users?: { id: string }[];
      nextCursor?: string | null;
    };
    page2Users = parsed.users ?? [];
    cursor2 = parsed.nextCursor ?? null;
  } catch {
    // handled below
  }

  check(
    "page 2 returns full page and cursor",
    page2.ok && page2Users.length === pageSize && Boolean(cursor2),
    `count=${page2Users.length} cursor=${cursor2 ?? "null"}`
  );

  const page3 = runCurl([
    "-s",
    "-b",
    COOKIE_FILE,
    "-w",
    "\nHTTP_STATUS:%{http_code}",
    `${API}/likes/${postId}/users?type=post&limit=${pageSize}&cursor=${encodeURIComponent(cursor2 ?? "")}`,
  ]);

  let page3Users: { id: string }[] = [];
  let cursor3: string | null = "pending";
  try {
    const parsed = JSON.parse(page3.stdout) as {
      users?: { id: string }[];
      nextCursor?: string | null;
    };
    page3Users = parsed.users ?? [];
    cursor3 = parsed.nextCursor ?? null;
  } catch {
    cursor3 = null;
  }

  const expectedLastPage = likerCount - pageSize * 2;
  check(
    "page 3 returns remainder and no cursor",
    page3.ok && page3Users.length === expectedLastPage && cursor3 === null,
    `count=${page3Users.length} expected=${expectedLastPage} cursor=${cursor3 ?? "null"}`
  );

  const allIds = [...page1Users, ...page2Users, ...page3Users].map((u) => u.id);
  const uniqueIds = new Set(allIds);
  check(
    "no duplicate likers across pages",
    uniqueIds.size === allIds.length && allIds.length === likerCount,
    `total=${allIds.length} unique=${uniqueIds.size}`
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  try {
    fs.unlinkSync(COOKIE_FILE);
  } catch {
    // ignore
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
