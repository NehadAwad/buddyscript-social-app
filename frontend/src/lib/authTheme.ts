export type AuthVariant = "login" | "register";

export function getAuthClasses(variant: AuthVariant) {
  const prefix =
    variant === "login" ? "_social_login" : "_social_registration";

  return {
    contentBtn: `${prefix}_content_btn`,
    contentBottomTxt: `${prefix}_content_bottom_txt`,
    form: `${prefix}_form`,
    formInput: `${prefix}_form_input`,
    label: `${prefix}_label`,
    input: `form-control ${prefix}_input`,
    contentPara: `${prefix}_content_para`,
    formCheck: `${prefix}_form_check`,
    formCheckInput: `${prefix}_form_check_input`,
    formCheckLabel: `${prefix}_form_check_label`,
    formBtn: `${prefix}_form_btn`,
    formBtnLink: `${prefix}_form_btn_link`,
    bottomTxt: `${prefix}_bottom_txt`,
    bottomTxtPara: `${prefix}_bottom_txt_para`,
  };
}
