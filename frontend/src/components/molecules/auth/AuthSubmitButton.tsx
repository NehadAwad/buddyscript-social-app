import type { AuthVariant } from "@/lib/authTheme";
import { getAuthClasses } from "@/lib/authTheme";
import { PrimaryButton } from "@/components/atoms/PrimaryButton";

interface AuthSubmitButtonProps {
  variant: AuthVariant;
  loading: boolean;
  loadingLabel: string;
  label: string;
}

export function AuthSubmitButton({
  variant,
  loading,
  loadingLabel,
  label,
}: AuthSubmitButtonProps) {
  const classes = getAuthClasses(variant);

  return (
    <div className="row">
      <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
        <div className={`${classes.formBtn} _mar_t40 _mar_b60`}>
          <PrimaryButton
            type="submit"
            className={`${classes.formBtnLink} _btn1`}
            disabled={loading}
          >
            {loading ? loadingLabel : label}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
