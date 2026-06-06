import type { InputHTMLAttributes } from "react";
import type { AuthVariant } from "@/lib/authTheme";
import { getAuthClasses } from "@/lib/authTheme";
import { TextInput } from "@/components/atoms/TextInput";

interface AuthFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  variant: AuthVariant;
}

export function AuthFormField({
  label,
  id,
  variant,
  ...inputProps
}: AuthFormFieldProps) {
  const classes = getAuthClasses(variant);

  return (
    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
      <div className={`${classes.formInput} _mar_b14`}>
        <label className={`${classes.label} _mar_b8`} htmlFor={id}>
          {label}
        </label>
        <TextInput
          id={id}
          className={classes.input}
          {...inputProps}
        />
      </div>
    </div>
  );
}
