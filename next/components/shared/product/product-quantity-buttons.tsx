import { AiFillMinusCircle, AiFillPlusCircle, AiOutlineMinusCircle } from "react-icons/ai";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Button } from "../utilities/form";

interface PropsType extends ReactProps {
  inputClassName?: string;
  buttonClassName?: string;
  quantity: number;
  hasToppings: boolean;
  onAdd: () => any;
  onMinus: () => any;
}
export function ProductQuantityButtons({
  className = "",
  buttonClassName = "",
  inputClassName = "",
  quantity = 0,
  hasToppings,
  onAdd,
  onMinus,
  ...props
}: PropsType) {
  return (
    <div className={`flex items-center ${className}`}>
      <Button
        unfocusable
        className={`px-2 h-6 transition ${quantity ? "opacity-100" : "opacity-0 pointer-events-none"
          } ${buttonClassName}`}
        icon={<AiOutlineMinusCircle />}
        iconClassName="text-2xl"
        onClick={(e) => {
          e.preventDefault();
          onMinus();
        }}
      />
      <div
        className={`w-6 font-bold h-5 text-lg text-center flex-center text-primary  transition ${quantity ? "opacity-100" : "opacity-0 pointer-events-none"
          } ${inputClassName}`}
      >
        {quantity}
      </div>
      <Button
        unfocusable
        textPrimary
        className={`px-2 h-6 ${buttonClassName}`}
        icon={<AiFillPlusCircle />}
        iconClassName="text-2xl"
        onClick={(e) => {
          if (!hasToppings) {
            e.preventDefault();
            e.stopPropagation();
            onAdd();
          }
        }}
      />
    </div>
  );
}
