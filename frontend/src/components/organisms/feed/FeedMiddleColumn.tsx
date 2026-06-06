"use client";

import { useState } from "react";
import type { PublicUser } from "@/types/auth";
import { FeedStoriesStatic } from "./FeedStoriesStatic";
import { PostComposer } from "./PostComposer";
import { PostList } from "./PostList";

interface FeedMiddleColumnProps {
  user: PublicUser;
}

export function FeedMiddleColumn({ user }: FeedMiddleColumnProps) {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
      <div className="_layout_middle_wrap">
        <div className="_layout_middle_inner">
          <FeedStoriesStatic />
          <PostComposer user={user} onPostCreated={() => setRefreshToken((n) => n + 1)} />
          <PostList currentUser={user} refreshToken={refreshToken} />
        </div>
      </div>
    </div>
  );
}
