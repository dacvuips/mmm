interface Props extends ReactProps {
  options: Option[];
  value: any;
  onChange: (val: any) => any;
  flex?: boolean;
  tabClassName?: string;
}
export function TabButtons({
  options,
  value,
  onChange,
  flex = true,
  className = "",
  tabClassName = "",
  ...props
}: Props) {
  return (
    <div className={`flex rounded border-group  ${className}`}>
      {options.map((option) => (
        <div
          key={option.value}
          className={`${
            flex ? "flex-1" : ""
          } py-2 font-semibold text-sm border   flex-center cursor-pointer border-gray-300 whitespace-nowrap ${
            value == option.value
              ? "bg-primary text-white hover:bg-primary-dark "
              : "bg-white text-gray-600 hover:text-primary"
          } ${tabClassName}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}

export function TabButtonsRounded({
  options,
  value,
  onChange,
  flex = true,
  className = "",
  tabClassName = "",
  ...props
}: Props) {
  return (
    <div className={`flex bg-blue-50 rounded-full ${className}`}>
      {options.map((option) => (
        <div
          className={`${
            flex ? "flex-1" : ""
          } py-3 font-semibold text-sm    flex-center cursor-pointer border-gray-300 whitespace-nowrap 
            ${
              value == option.value
                ? "bg-primary-dark text-white font-semibold rounded-full  "
                : "text-gray-500 "
            }
          `}
          key={option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}
