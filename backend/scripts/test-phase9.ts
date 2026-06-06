#!/usr/bin/env tsx
/**
 * Integration tests for Phase 9 — Comments & Likes API.
 * Run: npm run test:phase9 (from backend/, API must be running)
 */
const API = process.env.API_BASE_URL ?? "http://localhost:4000/api";

let passed = 0;
let failed = 0;
let cookieHeader = "";

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

async function api(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: Record<string, unknown> }> {
  const headers = new Headers(options.headers);
  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    cookieHeader = setCookie
      .split(",")
      .map((part) => part.split(";")[0].trim())
      .join("; ");
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, data };
}

async function run(): Promise<void> {
  console.log("\n--- Phase 9: Comments & Likes API ---\n");

  const suffix = Date.now();
  const email = `phase9-${suffix}@example.com`;

  const register = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      firstName: "Phase",
      lastName: "Nine",
      email,
      password: "TestPass123!",
    }),
  });
  check("register test user", register.status === 201, `status ${register.status}`);

  const postRes = await api("/posts", {
    method: "POST",
    body: JSON.stringify({ content: "Phase 9 test post", visibility: "public" }),
  });
  const post = postRes.data.post as { id: string; commentCount: number; likeCount: number };
  check("create post", postRes.status === 201 && Boolean(post?.id), JSON.stringify(postRes.data));

  const commentRes = await api(`/posts/${post.id}/comments`, {
    method: "POST",
    body: JSON.stringify({ content: "Top-level comment" }),
  });
  const comment = commentRes.data.comment as {
    id: string;
    parentId: string | null;
    likeCount: number;
  };
  check(
    "create top-level comment",
    commentRes.status === 201 && comment?.parentId === null,
    JSON.stringify(commentRes.data)
  );

  const replyRes = await api(`/posts/${post.id}/comments`, {
    method: "POST",
    body: JSON.stringify({ content: "Reply comment", parentId: comment.id }),
  });
  const reply = replyRes.data.reply as { id: string; parentId: string };
  const replyPayload = replyRes.data.comment as { id: string; parentId: string } | undefined;
  const savedReply = replyPayload ?? reply;
  check(
    "create reply",
    replyRes.status === 201 && savedReply?.parentId === comment.id,
    JSON.stringify(replyRes.data)
  );

  const nestedReply = await api(`/posts/${post.id}/comments`, {
    method: "POST",
    body: JSON.stringify({
      content: "Nested reply",
      parentId: savedReply.id,
    }),
  });
  check(
    "reject reply to reply",
    nestedReply.status === 400,
    `expected 400, got ${nestedReply.status}`
  );

  const listRes = await api(`/posts/${post.id}/comments`);
  const comments = listRes.data.comments as Array<{
    id: string;
    replies?: Array<{ id: string }>;
  }>;
  check(
    "list comments with nested replies",
    listRes.status === 200 &&
      Array.isArray(comments) &&
      comments.length >= 1 &&
      (comments[0].replies?.length ?? 0) >= 1,
    JSON.stringify(listRes.data)
  );

  const postAfterComments = await api(`/posts/${post.id}`);
  const updatedPost = postAfterComments.data.post as { commentCount: number };
  check(
    "post commentCount increments for top-level only",
    updatedPost.commentCount === post.commentCount + 1,
    `expected ${post.commentCount + 1}, got ${updatedPost.commentCount}`
  );

  const likePost = await api("/likes", {
    method: "POST",
    body: JSON.stringify({ targetId: post.id, targetType: "post" }),
  });
  check(
    "like post",
    likePost.status === 200 &&
      (likePost.data.isLikedByMe as boolean) === true &&
      (likePost.data.likeCount as number) === post.likeCount + 1,
    JSON.stringify(likePost.data)
  );

  const duplicateLike = await api("/likes", {
    method: "POST",
    body: JSON.stringify({ targetId: post.id, targetType: "post" }),
  });
  check(
    "duplicate like is idempotent",
    duplicateLike.status === 200 &&
      (duplicateLike.data.likeCount as number) === post.likeCount + 1,
    JSON.stringify(duplicateLike.data)
  );

  const likers = await api(`/likes/${post.id}/users?type=post`);
  const users = likers.data.users as unknown[];
  check(
    "list post likers",
    likers.status === 200 && Array.isArray(users) && users.length === 1,
    JSON.stringify(likers.data)
  );

  const likeComment = await api("/likes", {
    method: "POST",
    body: JSON.stringify({ targetId: comment.id, targetType: "comment" }),
  });
  check(
    "like comment",
    likeComment.status === 200 && (likeComment.data.isLikedByMe as boolean) === true,
    JSON.stringify(likeComment.data)
  );

  const unlikePost = await api(
    `/likes?targetId=${post.id}&targetType=post`,
    { method: "DELETE" }
  );
  check(
    "unlike post",
    unlikePost.status === 200 && (unlikePost.data.isLikedByMe as boolean) === false,
    JSON.stringify(unlikePost.data)
  );

  const deleteReply = await api(`/comments/${savedReply.id}`, { method: "DELETE" });
  check("delete reply", deleteReply.status === 200, `status ${deleteReply.status}`);

  const parentAfterReplyDelete = await api(`/posts/${post.id}/comments`);
  const commentsAfter = parentAfterReplyDelete.data.comments as Array<{
    id: string;
    replyCount: number;
    replies?: unknown[];
  }>;
  const parentComment = commentsAfter.find((item) => item.id === comment.id);
  check(
    "parent replyCount decrements",
    (parentComment?.replyCount ?? -1) === 0 && (parentComment?.replies?.length ?? 0) === 0,
    JSON.stringify(parentComment)
  );

  const deleteComment = await api(`/comments/${comment.id}`, { method: "DELETE" });
  check("delete top-level comment", deleteComment.status === 200, `status ${deleteComment.status}`);

  const postAfterDelete = await api(`/posts/${post.id}`);
  const finalPost = postAfterDelete.data.post as { commentCount: number };
  check(
    "post commentCount decrements",
    finalPost.commentCount === post.commentCount,
    `expected ${post.commentCount}, got ${finalPost.commentCount}`
  );

  const unauth = await fetch(`${API}/posts/${post.id}/comments`);
  check("comments require auth", unauth.status === 401, `status ${unauth.status}`);

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
