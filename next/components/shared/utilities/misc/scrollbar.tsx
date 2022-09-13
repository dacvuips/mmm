import Scrollbars, { ScrollbarProps } from "react-custom-scrollbars";

interface Props extends ScrollbarProps {
  height?: string | number;
}
export function Scrollbar({
  height = "auto",
  className = "",
  style = {},
  children,
  ...props
}: Props) {
  return (
    <div className="w-full" style={{ height }}>
      <Scrollbars {...props} style={style}>
        <div className={className}>{children}</div>
      </Scrollbars>
    </div>
  );
}
