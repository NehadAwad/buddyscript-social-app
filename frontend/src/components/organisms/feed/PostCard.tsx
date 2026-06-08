"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import type { PublicUser } from "@/types/auth";
import type { FeedPost } from "@/types/post";
import type { LikeTargetType } from "@/types/like";
import {
  PostAuthorHeader,
  PostImage,
  PostReactionBar,
} from "@/components/molecules";
import { CommentInput } from "./CommentInput";
import { CommentThread } from "./CommentThread";
import { PostMenu } from "./PostMenu";

const LikersModal = dynamic(
  () => import("./LikersModal").then((mod) => ({ default: mod.LikersModal })),
  { ssr: false }
);

interface PostCardProps {
  post: FeedPost;
  currentUser: PublicUser;
  onDeleted: () => void;
}

interface LikersTarget {
  targetId: string;
  targetType: LikeTargetType;
  title: string;
}

export function PostCard({ post, currentUser, onDeleted }: PostCardProps) {
  const commentInputRef = useRef<HTMLDivElement>(null);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const [likersTarget, setLikersTarget] = useState<LikersTarget | null>(null);

  useEffect(() => {
    setLikeCount(post.likeCount);
    setIsLiked(post.isLikedByMe);
    setCommentCount(post.commentCount);
  }, [post.id, post.likeCount, post.isLikedByMe, post.commentCount]);

  const authorName = `${post.author.firstName} ${post.author.lastName}`;
  const visibilityLabel = post.visibility === "public" ? "Public" : "Private";
  const likeLabel = likeCount > 0 ? `${likeCount}+` : "0";

  function focusCommentInput() {
    commentInputRef.current?.querySelector("textarea")?.focus();
  }

  function openPostLikers() {
    if (likeCount === 0) {
      return;
    }
    setLikersTarget({
      targetId: post.id,
      targetType: "post",
      title: "People who liked this post",
    });
  }

  return (
    <>
      <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
          <div className="_feed_inner_timeline_post_top">
            <PostAuthorHeader
              authorName={authorName}
              avatarUrl={post.author.avatarUrl}
              meta={formatTimeAgo(post.createdAt)}
              visibilityLabel={visibilityLabel}
            />
            <PostMenu
              postId={post.id}
              canDelete={post.author.id === currentUser.id}
              onDeleted={onDeleted}
            />
          </div>

          {post.content && (
            <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
          )}

          {post.imageUrl && (
            <div className="_feed_inner_timeline_image">
              <PostImage imageUrl={post.imageUrl} alt="" />
            </div>
          )}
        </div>

        <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
          <div className="_feed_inner_timeline_total_reacts_image">
            <img src="/images/react_img1.png" alt="" className="_react_img1" />
            <img src="/images/react_img2.png" alt="" className="_react_img" />
            <img src="/images/react_img3.png" alt="" className="_react_img _rect_img_mbl_none" />
            <button
              type="button"
              className="border-0 bg-transparent p-0"
              onClick={openPostLikers}
              disabled={likeCount === 0}
            >
              <p className="_feed_inner_timeline_total_reacts_para">{likeLabel}</p>
            </button>
          </div>
          <div className="_feed_inner_timeline_total_reacts_txt">
            <p className="_feed_inner_timeline_total_reacts_para1">
              <span>{commentCount}</span> Comment
            </p>
          </div>
        </div>

        <PostReactionBar
          postId={post.id}
          isLiked={isLiked}
          likeCount={likeCount}
          onLikeChange={({ isLiked: liked, likeCount: count }) => {
            setIsLiked(liked);
            setLikeCount(count);
          }}
          onCommentClick={focusCommentInput}
        />

        <div ref={commentInputRef}>
          <CommentInput
            postId={post.id}
            userAvatar={currentUser.avatarUrl}
            onSuccess={() => {
              setCommentCount((count) => count + 1);
              setCommentRefresh((value) => value + 1);
            }}
          />
        </div>

        <CommentThread
          postId={post.id}
          currentUserId={currentUser.id}
          userAvatar={currentUser.avatarUrl}
          refreshKey={commentRefresh}
          onTopLevelRemoved={() => setCommentCount((count) => Math.max(0, count - 1))}
          onOpenLikers={(targetId, targetType) =>
            setLikersTarget({
              targetId,
              targetType,
              title: "People who liked this comment",
            })
          }
        />
      </div>

      {likersTarget ? (
        <LikersModal
          targetId={likersTarget.targetId}
          targetType={likersTarget.targetType}
          title={likersTarget.title}
          onClose={() => setLikersTarget(null)}
        />
      ) : null}
    </>
  );
}
