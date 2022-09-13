import { HiMinus, HiMinusSm, HiPlus } from "react-icons/hi";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useToast } from "../../../lib/providers/toast-provider";

interface Props extends ReactProps {
  value: number;
  onChange: (number) => any;
  disabled?: boolean;
  maxValue?: number;
}
export function ProductDetailsQuantityButtons({
  value,
  onChange,
  disabled,
  maxValue,
  className = "",
}: Props) {
  const toast = useToast();
  const screenLg = useScreen("lg");
  const handleClick = (offset) => {
    if (value + offset >= 1) {
      if (maxValue && value + offset > maxValue) {
        toast.info(`Sản phẩm này được chọn tối đa ${maxValue} sản phẩm`);
      } else {
        onChange(value + offset);
      }
    }
  };

  return (
    <div
      className={`${screenLg && "border border-gray-200 rounded-full px-3 py-1"
        } flex items-center justify-center font-semibold ${className}`}
    >
      <i
        className={`${screenLg ? "text-[24px]" : "text-3xl bg-gray-100 rounded-md"
          }  text-gray-500 cursor-pointer font-semibold  ${value == 1 ? "opacity-50 pointer-events-none" : ""
          } ${disabled ? "pointer-events-none opacity-40" : ""}`}
        onClick={() => handleClick(-1)}
      >
        <HiMinusSm />
      </i>
      <div className={`${screenLg ? "text-xl" : "text-2xl"}  font-semibold px-3 text-gray-700`}>
        {value}
      </div>
      <i
        className={`${screenLg ? "text-[24px]" : "text-3xl bg-gray-100 rounded-md"
          } cursor-pointer font-semibold  ${disabled ? "pointer-events-none opacity-40 text-gray-500" : "text-primary"
          }`}
        onClick={() => handleClick(1)}
      >
        <HiPlus />
      </i>
    </div>
  );
}
