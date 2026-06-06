import type { AuthVariant } from "@/lib/authTheme";
import { getAuthClasses } from "@/lib/authTheme";

interface FormErrorProps {
  message: string;
  variant?: "auth" | "inline";
  authVariant?: AuthVariant;
  className?: string;
}

export function FormError({
  message,
  variant = "inline",
  authVariant = "login",
  className,
}: FormErrorProps) {
  if (variant === "auth") {
    const classes = getAuthClasses(authVariant);
    return (
      <div className={`${classes.formInput} _mar_b14`}>
        <p className={classes.contentPara} style={{ color: "#e53e3e" }}>
          {message}
        </p>
      </div>
    );
  }

  return <p className={className ?? "text-danger"}>{message}</p>;
}
