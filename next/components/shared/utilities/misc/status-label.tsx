interface Props extends ReactProps {
  options: Option[];
  value: any;
  type?: StatusLabelType;
  extraClassName?: string;
}
export type StatusLabelType = "label" | "text" | "light";
export function StatusLabel({
  value,
  options,
  type = "label",
  className = "text-xs font-semibold uppercase px-2 py-1 rounded whitespace-nowrap",
  extraClassName = "",
  style = {},
  ...props
}: Props) {
  const option = options?.find((x) => x.value == value);
  const color = option?.color || "slate";
  const label = option?.label || "Không có";

  return (
    <span
      className={`${className} ${extraClassName} ${type == "label" ? `text-white` : `text-${color}`
        } ${type == "label" ? `bg-${color}` : type == "light" ? `bg-${color}-light` : "bg-transparent"
        }`}
      style={style}
    >
      {label}
    </span>
  );
}
