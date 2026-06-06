import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  textareaClassName?: string;
}

export function Textarea({
  textareaClassName,
  className,
  ...props
}: TextareaProps) {
  return <textarea className={className ?? textareaClassName} {...props} />;
}
