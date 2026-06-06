interface LogoProps {
  variant?: "left" | "right";
  className?: string;
  alt?: string;
}

export function Logo({
  variant = "left",
  className,
  alt = "Buddy Script",
}: LogoProps) {
  const logoClass = className ?? (variant === "left" ? "_left_logo" : "_right_logo");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo.svg" alt={alt} className={logoClass} />
  );
}
