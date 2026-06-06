import type { ReactNode } from "react";
import { FormError } from "@/components/atoms/FormError";

interface FeedStatusCardProps {
  children: ReactNode;
  error?: boolean;
}

export function FeedStatusCard({ children, error }: FeedStatusCardProps) {
  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 _padd_r24 _padd_l24">
      {error ? (
        <FormError message={String(children)} />
      ) : (
        <p className="_feed_inner_timeline_post_box_para">{children}</p>
      )}
    </div>
  );
}
