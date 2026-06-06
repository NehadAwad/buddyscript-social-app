import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function PrimaryButton({
  children,
  className = "_btn1",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button type={type} className={className} {...props}>
      {children}
    </button>
  );
}
