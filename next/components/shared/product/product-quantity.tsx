import { FaMinus, FaPlus } from "react-icons/fa";
import { useEffect } from "react";
import { useScreen } from "../../../lib/hooks/useScreen";

interface PropsType extends ReactProps {
  inputClassName?: string;
  buttonClassName?: string;
  quantity: number;
  setQuantity: Function;
  disabled?: boolean;
}
export function ProductQuantity(props: PropsType) {
  const screenLg = useScreen("lg");
  const handleSetQuantity = (value) => {
    if (value < 0) props.setQuantity(0);
    else props.setQuantity(value);
  };

  let buttonStyle = ` text-gray-400 focus:outline-none flex items-center bg-gray-100 rounded-md px-2 py-2`;

  return (
    <div className={`flex items-center py-1 md:py-1 ${props.className || ""}`}>
      {!props.disabled && (
        <button
          className={`${buttonStyle} ${props.buttonClassName || ""}`}
          onClick={() => handleSetQuantity(props.quantity - 1)}
        >
          <i className="w-full text-gray">
            <FaMinus />
          </i>
        </button>
      )}
      <div
        className={`${
          props.disabled ? "w-auto" : "w-8"
        } h-5 text-center font-medium text-primary flex-center ${props.inputClassName || ""}`}
      >
        {props.disabled && "x"}
        {props.quantity}
      </div>
      {!props.disabled && (
        <button
          className={`${buttonStyle} ${props.buttonClassName || ""} text-primary `}
          onClick={() => handleSetQuantity(props.quantity + 1)}
        >
          <i className="w-full ml-auto mr-0">
            <FaPlus />
          </i>
        </button>
      )}
    </div>
  );
}
