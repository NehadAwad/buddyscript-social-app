import type { ReactNode } from "react";
import type { AuthVariant } from "@/lib/authTheme";
import { Logo } from "@/components/atoms";

interface AuthPageTemplateProps {
  variant: AuthVariant;
  subtitle: string;
  title: string;
  children: ReactNode;
}

const config = {
  login: {
    wrapper: "_social_login_wrapper",
    wrap: "_social_login_wrap",
    heroCol: "col-xl-8 col-lg-8 col-md-12 col-sm-12",
    formCol: "col-xl-4 col-lg-4 col-md-12 col-sm-12",
    hero: (
      <div className="_social_login_left">
        <div className="_social_login_left_image">
          <img src="/images/login.png" alt="" className="_left_img" />
        </div>
      </div>
    ),
    content: "_social_login_content",
    logoWrap: "_social_login_left_logo _mar_b28",
    logoVariant: "left" as const,
    subtitleClass: "_social_login_content_para _mar_b8",
    titleClass: "_social_login_content_title _titl4 _mar_b50",
  },
  register: {
    wrapper: "_social_registration_wrapper",
    wrap: "_social_registration_wrap",
    heroCol: "col-xl-8 col-lg-8 col-md-12 col-sm-12",
    formCol: "col-xl-4 col-lg-4 col-md-12 col-sm-12",
    hero: (
      <div className="_social_registration_right">
        <div className="_social_registration_right_image">
          <img src="/images/registration.png" alt="" />
        </div>
        <div className="_social_registration_right_image_dark">
          <img src="/images/registration1.png" alt="" />
        </div>
      </div>
    ),
    content: "_social_registration_content",
    logoWrap: "_social_registration_right_logo _mar_b28",
    logoVariant: "right" as const,
    subtitleClass: "_social_registration_content_para _mar_b8",
    titleClass: "_social_registration_content_title _titl4 _mar_b50",
  },
};

function AuthShapes() {
  return (
    <>
      <div className="_shape_one">
        <img src="/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/images/shape2.svg" alt="" className="_shape_img" />
        <img
          src="/images/dark_shape1.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <img src="/images/shape3.svg" alt="" className="_shape_img" />
        <img
          src="/images/dark_shape2.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
    </>
  );
}

export function AuthPageTemplate({
  variant,
  subtitle,
  title,
  children,
}: AuthPageTemplateProps) {
  const page = config[variant];

  return (
    <section className={`${page.wrapper} _layout_main_wrapper`}>
      <AuthShapes />
      <div className={page.wrap}>
        <div className="container">
          <div className="row align-items-center">
            <div className={page.heroCol}>{page.hero}</div>
            <div className={page.formCol}>
              <div className={page.content}>
                <div className={page.logoWrap}>
                  <Logo variant={page.logoVariant} />
                </div>
                <p className={page.subtitleClass}>{subtitle}</p>
                <h4 className={page.titleClass}>{title}</h4>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
