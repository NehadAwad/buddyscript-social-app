"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { register } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      await register({ firstName, lastName, email, password });
      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to register. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="_social_registration_content_btn _mar_b40">
        <img src="/images/google.svg" alt="Image" className="_google_img" />{" "}
        <span>Register with google</span>
      </button>
      <div className="_social_registration_content_bottom_txt _mar_b40">
        <span>Or</span>
      </div>
      <form className="_social_registration_form" onSubmit={handleSubmit}>
        {error ? (
          <div className="_social_registration_form_input _mar_b14">
            <p
              className="_social_registration_content_para"
              style={{ color: "#e53e3e" }}
            >
              {error}
            </p>
          </div>
        ) : null}
        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_registration_form_input _mar_b14">
              <label
                className="_social_registration_label _mar_b8"
                htmlFor="register-first-name"
              >
                First Name
              </label>
              <input
                id="register-first-name"
                type="text"
                className="form-control _social_registration_input"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                autoComplete="given-name"
              />
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_registration_form_input _mar_b14">
              <label
                className="_social_registration_label _mar_b8"
                htmlFor="register-last-name"
              >
                Last Name
              </label>
              <input
                id="register-last-name"
                type="text"
                className="form-control _social_registration_input"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_registration_form_input _mar_b14">
              <label
                className="_social_registration_label _mar_b8"
                htmlFor="register-email"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="form-control _social_registration_input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_registration_form_input _mar_b14">
              <label
                className="_social_registration_label _mar_b8"
                htmlFor="register-password"
              >
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="form-control _social_registration_input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_registration_form_input _mar_b14">
              <label
                className="_social_registration_label _mar_b8"
                htmlFor="register-confirm-password"
              >
                Repeat Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                className="form-control _social_registration_input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
            <div className="form-check _social_registration_form_check">
              <input
                className="form-check-input _social_registration_form_check_input"
                type="checkbox"
                id="register-terms"
                checked={agreeTerms}
                onChange={(event) => setAgreeTerms(event.target.checked)}
              />
              <label
                className="form-check-label _social_registration_form_check_label"
                htmlFor="register-terms"
              >
                I agree to terms &amp; conditions
              </label>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
            <div className="_social_registration_form_btn _mar_t40 _mar_b60">
              <button
                type="submit"
                className="_social_registration_form_btn_link _btn1"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </div>
        </div>
      </form>
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_bottom_txt">
            <p className="_social_registration_bottom_txt_para">
              Already have an account? <Link href="/login">Login now</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
