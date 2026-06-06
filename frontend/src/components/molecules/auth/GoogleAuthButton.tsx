import type { AuthVariant } from "@/lib/authTheme";
import { getAuthClasses } from "@/lib/authTheme";

interface GoogleAuthButtonProps {
  variant: AuthVariant;
  label: string;
}

export function GoogleAuthButton({ variant, label }: GoogleAuthButtonProps) {
  const classes = getAuthClasses(variant);

  return (
    <button type="button" className={`${classes.contentBtn} _mar_b40`}>
      <img src="/images/google.svg" alt="" className="_google_img" />{" "}
      <span>{label}</span>
    </button>
  );
}
