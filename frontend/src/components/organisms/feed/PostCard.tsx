"use client";

import { formatTimeAgo } from "@/lib/formatTimeAgo";
import type { FeedPost } from "@/types/post";
import {
  PostAuthorHeader,
  PostCommentPlaceholder,
  PostImage,
  PostReactionBar,
} from "@/components/molecules";
import { PostMenu } from "./PostMenu";

interface PostCardProps {
  post: FeedPost;
  currentUserId: string;
  onDeleted: () => void;
}

export function PostCard({ post, currentUserId, onDeleted }: PostCardProps) {
  const authorName = `${post.author.firstName} ${post.author.lastName}`;
  const visibilityLabel = post.visibility === "public" ? "Public" : "Private";
  const likeLabel = post.likeCount > 0 ? `${post.likeCount}+` : "0";

  return (
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
            canDelete={post.author.id === currentUserId}
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
          <p className="_feed_inner_timeline_total_reacts_para">{likeLabel}</p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <a href="#0">
              <span>{post.commentCount}</span> Comment
            </a>
          </p>
        </div>
      </div>

      <PostReactionBar isLiked={post.isLikedByMe} />
      <PostCommentPlaceholder />
    </div>
  );
}
