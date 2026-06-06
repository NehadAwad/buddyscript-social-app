import Link from "next/link";
import type { AuthVariant } from "@/lib/authTheme";
import { getAuthClasses } from "@/lib/authTheme";

interface AuthFormFooterProps {
  variant: AuthVariant;
}

export function AuthFormFooter({ variant }: AuthFormFooterProps) {
  const classes = getAuthClasses(variant);

  if (variant === "login") {
    return (
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className={classes.bottomTxt}>
            <p className={classes.bottomTxtPara}>
              Dont have an account?{" "}
              <Link href="/register">Create New Account</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
        <div className={classes.bottomTxt}>
          <p className={classes.bottomTxtPara}>
            Already have an account? <Link href="/login">Login now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
