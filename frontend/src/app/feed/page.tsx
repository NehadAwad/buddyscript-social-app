"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { PublicUser } from "@/types/auth";

export default function FeedPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="_social_login_wrap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_content _mar_t60 _mar_b60">
                <h4 className="_social_login_content_title _titl4 _mar_b24">
                  Welcome, {user.firstName}
                </h4>
                <p className="_social_login_content_para">
                  Feed layout coming in the next phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
