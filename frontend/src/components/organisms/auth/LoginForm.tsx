"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { login } from "@/lib/auth";
import { getAuthClasses } from "@/lib/authTheme";
import {
  AuthFormField,
  AuthFormFooter,
  AuthOrDivider,
  AuthSubmitButton,
  GoogleAuthButton,
} from "@/components/molecules";
import { FormError } from "@/components/atoms";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const classes = getAuthClasses("login");

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
      <GoogleAuthButton variant="login" label="Or sign-in with google" />
      <AuthOrDivider variant="login" />
      <form className={classes.form} onSubmit={handleSubmit}>
        {error ? <FormError message={error} variant="auth" authVariant="login" /> : null}
        <div className="row">
          <AuthFormField
            variant="login"
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
          <AuthFormField
            variant="login"
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div className="row">
          <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
            <div className={`form-check ${classes.formCheck}`}>
              <input
                className={`form-check-input ${classes.formCheckInput}`}
                type="radio"
                name="flexRadioDefault"
                id="flexRadioDefault2"
                defaultChecked
                readOnly
              />
              <label
                className={`form-check-label ${classes.formCheckLabel}`}
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
        <AuthSubmitButton
          variant="login"
          loading={loading}
          loadingLabel="Logging in..."
          label="Login now"
        />
      </form>
      <AuthFormFooter variant="login" />
    </>
  );
}
