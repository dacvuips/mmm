import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useUUID } from "../../../lib/hooks/useUUID";
import Link from "next/link";
import { Fragment } from "react";

interface PropsType extends ReactProps {
  options: Option[];
  value: any;
  href?: string;
  onChange?: (val) => any;
}
export function VerticalPageTabs({
  options,
  value,
  onChange,
  className = "",
  href = "",
  ...props
}: PropsType) {
  const id = useUUID();
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const Wrapper: any = href ? Link : Fragment;

  return (
    <>
      {options?.length && (
        <div
          id={id}
          className={`relative border border-gray-300 rounded bg-white overflow-hidden self-start flex flex-col mt-2 ${className}`}
        >
          {options.map((option, index) => (
            <Wrapper href={`${href}/${option.value}`} key={option.value}>
              <a
                key={index}
                id={id + "-" + index}
                className={`text-sm relative cursor-pointer flex py-2 px-4 font-semibold ${
                  index !== 0 ? "border-t border-gray-300" : ""
                } ${
                  selected == option.value
                    ? " text-primary-dark"
                    : "text-gray-600 hover:text-primary"
                }`}
                onClick={async () => {
                  if (onChange) {
                    let res = await onChange(option.value);
                    if (res !== false) setSelected(option.value);
                  }
                }}
              >
                {selected == option.value && (
                  <div className="absolute left-0 w-1 transform -translate-y-1/2 top-1/2 bg-primary-dark h-3/4"></div>
                )}
                {option.label}
              </a>
            </Wrapper>
          ))}
        </div>
      )}
    </>
  );
}
