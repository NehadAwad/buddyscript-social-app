import type { AuthVariant } from "@/lib/authTheme";
import { getAuthClasses } from "@/lib/authTheme";
import { OrDivider } from "@/components/atoms/OrDivider";

interface AuthOrDividerProps {
  variant: AuthVariant;
}

export function AuthOrDivider({ variant }: AuthOrDividerProps) {
  const classes = getAuthClasses(variant);
  return <OrDivider className={`${classes.contentBottomTxt} _mar_b40`} />;
}
