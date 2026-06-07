"use client";

const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

export function PostCardSkeleton() {
  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
          <div className="_feed_inner_timeline_post_top">
            <div className="_feed_inner_timeline_post_box">
              <div className="_feed_inner_timeline_post_box_image">
                <div
                  style={{
                    ...shimmerStyle,
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                  }}
                />
              </div>
              <div className="_feed_inner_timeline_post_box_txt">
                <div
                  style={{
                    ...shimmerStyle,
                    width: 120,
                    height: 16,
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    ...shimmerStyle,
                    width: 80,
                    height: 12,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                ...shimmerStyle,
                width: "100%",
                height: 14,
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                ...shimmerStyle,
                width: "75%",
                height: 14,
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                ...shimmerStyle,
                width: "50%",
                height: 14,
                borderRadius: 4,
              }}
            />
          </div>

          <div
            style={{
              ...shimmerStyle,
              width: "100%",
              height: 200,
              borderRadius: 6,
              marginTop: 16,
            }}
          />
        </div>

        <div
          className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26"
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                ...shimmerStyle,
                width: 24,
                height: 24,
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                ...shimmerStyle,
                width: 24,
                height: 24,
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                ...shimmerStyle,
                width: 40,
                height: 20,
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        <div className="_feed_inner_timeline_reaction _padd_r24 _padd_l24">
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                ...shimmerStyle,
                width: 60,
                height: 32,
                borderRadius: 4,
              }}
            />
            <div
              style={{
                ...shimmerStyle,
                width: 80,
                height: 32,
                borderRadius: 4,
              }}
            />
            <div
              style={{
                ...shimmerStyle,
                width: 60,
                height: 32,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
