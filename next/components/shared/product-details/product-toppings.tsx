import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import { parseNumber } from "../../../lib/helpers/parser";
import { useScreen } from "../../../lib/hooks/useScreen";
import { ProductTopping, ToppingOption } from "../../../lib/repo/product-topping.repo";
import { Button, Checkbox } from "../utilities/form";
import { useProductDetailsContext } from "./product-details-provider";

export function ProductToppings({ className = "", ...props }: ReactProps) {
  const { product } = useProductDetailsContext();

  return (
    <div className={`${className}`}>
      {product?.toppings.map(
        (topping, index) =>
          topping.options.length > 0 && <ProductToppingItem topping={topping} key={topping.id} />
      )}
    </div>
  );
}

interface Props extends ReactProps {
  topping: ProductTopping;
}
function ProductToppingItem({ topping }: Props) {
  const { onToppingOptionClick } = useProductDetailsContext();
  const screenLg = useScreen("lg");

  return (
    <>
      <div className={`${screenLg && "border-dashed"} py-2 border-t `}>
        <div className="font-medium">{topping.name}</div>
        {topping.max == 0 && <div className="text-xs text-accent">Có thể chọn nhiều lựa chọn</div>}
        {topping.max > 1 && (
          <div className="text-xs text-accent">Có thể chọn tối đa {topping.max} lựa chọn</div>
        )}
      </div>
      <div
        className={`${screenLg && "flex flex-row flex-wrap items-center justify-start gap-3 pb-5"}`}
      >
        {topping.options.map((option, index) => {
          return (
            <ProductToppingOption
              option={option}
              multiple={topping.max == 0 || topping.max > 1}
              className={index < topping.options.length - 1 ? "border-b" : ""}
              key={index}
              onClick={() => {
                onToppingOptionClick(option, topping);
              }}
            />
          );
        })}
      </div>
    </>
  );
}

interface ToppingOptionProps {
  option: ToppingOption;
  multiple: boolean;
  onClick?: () => void;
}
function ProductToppingOption({
  className = "",
  multiple,
  option,
  onClick,
}: ToppingOptionProps & ReactProps) {
  const screenLg = useScreen("lg");

  return screenLg ? (
    <>
      {!multiple && (
        <div className="">
          <Button
            key={option.name}
            className={`${
              option.selected ? "border-primary-dark text-primary" : ""
            } text-gray-500 border rounded-lg `}
            onClick={onClick}
          >
            {option.name} + {parseNumber(option.price)}
          </Button>
        </div>
      )}
      {multiple && (
        <div
          key={option.name}
          className={`pr-2 flex items-center justify-between border-gray-100 cursor-pointer  rounded ${className}`}
          onClick={onClick}
        >
          <Checkbox
            value={option.selected}
            className="text-sm pointer-events-none transform translate-y-0.5"
            checkedIcon={<MdCheckBox />}
            uncheckedIcon={<MdCheckBoxOutlineBlank />}
            placeholder={option.name}
          />
          <div className="text-sm font-medium text-gray-700 min-w-max text-accent">
            {parseNumber(option.price)}đ
          </div>
        </div>
      )}
    </>
  ) : (
    <div
      key={option.name}
      className={`pr-2 flex items-center justify-between border-gray-100 cursor-pointer hover:bg-gray-100 rounded ${className}`}
      onClick={onClick}
    >
      <Checkbox
        value={option.selected}
        className="text-sm pointer-events-none transform translate-y-0.5"
        checkedIcon={multiple ? <MdCheckBox /> : <MdRadioButtonChecked />}
        uncheckedIcon={multiple ? <MdCheckBoxOutlineBlank /> : <MdRadioButtonUnchecked />}
        placeholder={option.name}
      />
      <div className="text-sm font-medium text-gray-700 min-w-max text-accent">
        {parseNumber(option.price)}đ
      </div>
    </div>
  );
}
