interface OrDividerProps {
  className?: string;
}

export function OrDivider({ className }: OrDividerProps) {
  return (
    <div className={className ?? "_social_login_content_bottom_txt _mar_b40"}>
      <span>Or</span>
    </div>
  );
}
