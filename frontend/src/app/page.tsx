import Link from "next/link";

export default function HomePage() {
  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      <div className="_social_login_wrap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_content _mar_t60 _mar_b60">
                <div className="_social_login_left_logo _mar_b28">
                  <img src="/images/logo.svg" alt="Buddy Script" className="_left_logo" />
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
                <div className="_social_login_bottom_txt">
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
