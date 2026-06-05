"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { login } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to login. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="_social_login_content_btn _mar_b40">
        <img src="/images/google.svg" alt="Image" className="_google_img" />{" "}
        <span>Or sign-in with google</span>
      </button>
      <div className="_social_login_content_bottom_txt _mar_b40">
        <span>Or</span>
      </div>
      <form className="_social_login_form" onSubmit={handleSubmit}>
        {error ? (
          <div className="_social_login_form_input _mar_b14">
            <p className="_social_login_content_para" style={{ color: "#e53e3e" }}>
              {error}
            </p>
          </div>
        ) : null}
        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_login_form_input _mar_b14">
              <label className="_social_login_label _mar_b8" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control _social_login_input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_login_form_input _mar_b14">
              <label
                className="_social_login_label _mar_b8"
                htmlFor="login-password"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control _social_login_input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
            <div className="form-check _social_login_form_check">
              <input
                className="form-check-input _social_login_form_check_input"
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault2"
                defaultChecked
                readOnly
              />
              <label
                className="form-check-label _social_login_form_check_label"
                htmlFor="flexRadioDefault2"
              >
                Remember me
              </label>
            </div>
          </div>
          <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
            <div className="_social_login_form_left">
              <p className="_social_login_form_left_para">Forgot password?</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
            <div className="_social_login_form_btn _mar_t40 _mar_b60">
              <button
                type="submit"
                className="_social_login_form_btn_link _btn1"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login now"}
              </button>
            </div>
          </div>
        </div>
      </form>
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_login_bottom_txt">
            <p className="_social_login_bottom_txt_para">
              Dont have an account?{" "}
              <Link href="/register">Create New Account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
