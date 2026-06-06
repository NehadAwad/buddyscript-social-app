import { Textarea } from "@/components/atoms/Textarea";

export function PostCommentPlaceholder() {
  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={(event) => event.preventDefault()}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <img src="/images/comment_img.png" alt="" className="_comment_img" />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <Textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment"
                readOnly
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
