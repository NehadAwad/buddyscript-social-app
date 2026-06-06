import Link from "next/link";
import { Logo } from "@/components/atoms";

export function HomeLandingTemplate() {
  return (
    <section
      className="_social_login_wrapper _layout_main_wrapper _dis_flex _dis_flex_cntr1"
      style={{ minHeight: "100vh" }}
    >
      <div className="_social_login_wrap" style={{ width: "100%" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-lg-5 col-md-8 col-sm-12">
              <div className="_social_login_content _text_center">
                <div className="_social_login_left_logo _mar_b28">
                  <Logo />
                </div>
                <h4 className="_social_login_content_title _titl4 _mar_b24">
                  Buddy Script
                </h4>
                <p className="_social_login_content_para _mar_b40">
                  Social feed application
                </p>
                <div className="_social_login_form_btn _mar_b16">
                  <Link href="/login" className="_social_login_form_btn_link _btn1">
                    Login
                  </Link>
                </div>
                <div className="_social_login_bottom_txt _text_center">
                  <p className="_social_login_bottom_txt_para">
                    Dont have an account?{" "}
                    <Link href="/register">Create New Account</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
