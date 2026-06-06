interface SectionHeaderProps {
  title: string;
  seeAllHref?: string;
  titleClassName?: string;
  wrapperClassName?: string;
}

export function SectionHeader({
  title,
  seeAllHref = "#0",
  titleClassName = "_title5",
  wrapperClassName = "_mar_b24",
}: SectionHeaderProps) {
  return (
    <div className={`_left_inner_area_suggest_content ${wrapperClassName}`}>
      <h4 className={`_left_inner_area_suggest_content_title ${titleClassName}`}>
        {title}
      </h4>
      <span className="_left_inner_area_suggest_content_txt">
        <a className="_left_inner_area_suggest_content_txt_link" href={seeAllHref}>
          See All
        </a>
      </span>
    </div>
  );
}
