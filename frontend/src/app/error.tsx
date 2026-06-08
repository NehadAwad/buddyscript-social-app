"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        event: "next_route_error",
        message: error.message,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      })
    );
  }, [error]);

  return (
    <div className="_login_area">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="_login_form_content _b_radious6 _padd_t48 _padd_b48 _padd_l24 _padd_r24 text-center">
              <h1 className="_title3 _mar_b16">Something went wrong</h1>
              <p className="_mar_b24">
                We could not load this page. Please try again.
              </p>
              <button type="button" className="_btn1 _dis_inline_block" onClick={reset}>
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
