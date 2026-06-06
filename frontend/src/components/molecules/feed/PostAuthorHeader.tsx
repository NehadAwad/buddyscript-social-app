import { Avatar } from "@/components/atoms/Avatar";

interface PostAuthorHeaderProps {
  authorName: string;
  avatarUrl?: string | null;
  meta: string;
  visibilityLabel: string;
}

export function PostAuthorHeader({
  authorName,
  avatarUrl,
  meta,
  visibilityLabel,
}: PostAuthorHeaderProps) {
  return (
    <div className="_feed_inner_timeline_post_box">
      <div className="_feed_inner_timeline_post_box_image">
        <Avatar src={avatarUrl} className="_post_img" />
      </div>
      <div className="_feed_inner_timeline_post_box_txt">
        <h4 className="_feed_inner_timeline_post_box_title">{authorName}</h4>
        <p className="_feed_inner_timeline_post_box_para">
          {meta} . <a href="#0">{visibilityLabel}</a>
        </p>
      </div>
    </div>
  );
}
