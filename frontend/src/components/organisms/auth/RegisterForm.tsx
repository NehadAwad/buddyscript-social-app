"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { register } from "@/lib/auth";
import { getAuthClasses } from "@/lib/authTheme";
import {
  AuthFormField,
  AuthFormFooter,
  AuthOrDivider,
  AuthSubmitButton,
  GoogleAuthButton,
} from "@/components/molecules";
import { FormError } from "@/components/atoms";

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
  const classes = getAuthClasses("register");

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
      <GoogleAuthButton variant="register" label="Register with google" />
      <AuthOrDivider variant="register" />
      <form className={classes.form} onSubmit={handleSubmit}>
        {error ? (
          <FormError message={error} variant="auth" authVariant="register" />
        ) : null}
        <div className="row">
          <AuthFormField
            variant="register"
            id="register-first-name"
            label="First Name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            autoComplete="given-name"
          />
          <AuthFormField
            variant="register"
            id="register-last-name"
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
            autoComplete="family-name"
          />
          <AuthFormField
            variant="register"
            id="register-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
          <AuthFormField
            variant="register"
            id="register-password"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <AuthFormField
            variant="register"
            id="register-confirm-password"
            label="Repeat Password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="row">
          <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
            <div className={`form-check ${classes.formCheck}`}>
              <input
                className={`form-check-input ${classes.formCheckInput}`}
                type="checkbox"
                id="register-terms"
                checked={agreeTerms}
                onChange={(event) => setAgreeTerms(event.target.checked)}
              />
              <label
                className={`form-check-label ${classes.formCheckLabel}`}
                htmlFor="register-terms"
              >
                I agree to terms &amp; conditions
              </label>
            </div>
          </div>
        </div>
        <AuthSubmitButton
          variant="register"
          loading={loading}
          loadingLabel="Registering..."
          label="Register"
        />
      </form>
      <AuthFormFooter variant="register" />
    </>
  );
}
