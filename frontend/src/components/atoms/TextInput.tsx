import type { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string;
}

export function TextInput({ inputClassName, className, ...props }: TextInputProps) {
  return <input className={className ?? inputClassName} {...props} />;
}
