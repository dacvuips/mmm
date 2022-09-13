import router from "next/router";
import { FaPencilAlt } from "react-icons/fa";
import { parseNumber } from "../../../lib/helpers/parser";
import { useScreen } from "../../../lib/hooks/useScreen";
import { CartProduct, useCart } from "../../../lib/providers/cart-provider";
import { usePaymentContext } from "../../index/payment/providers/payment-provider";
import { ProductQuantity } from "./product-quantity";

interface Props extends ReactProps {
  cartProduct: CartProduct;
  index: number;
  editable?: boolean;
  quantityEditable?: boolean;
  isDiscountProduct?: boolean;
}
export function CardProductItem({
  cartProduct,
  index,
  editable = false,
  quantityEditable = true,
  isDiscountProduct = false,
  ...props
}: Props) {
  const { changeProductQuantity } = useCart();
  const { changeDiscountItemQuantity } = usePaymentContext();
  const screenLg = useScreen("lg");

  return (
    <div className={`lg:py-1.5 py-3 border-b border-dashed`}>
      <div className="flex items-center justify-between w-full">
        <div
          className={`flex-1 pr-2 text-gray-700 ${editable ? "cursor-pointer group hover:text-primary" : ""
            }`}
          onClick={() => {
            if (editable) {
              const url = new URL(location.href);
              url.searchParams.set(
                isDiscountProduct ? "editDiscountProduct" : "editProduct",
                index.toString()
              );
              router.replace(url.toString(), null, { shallow: true });
            }
          }}
        >
          <div className="font-medium">{cartProduct.product.name}</div>

          {!!cartProduct.product.selectedToppings?.length && (
            <div
              className={`inline-flex text-sm font-light text-gray-600 ${editable ? "group-hover:text-primary" : ""
                }`}
            >
              {cartProduct.product.selectedToppings.map((topping) => topping.optionName).join(", ")}
              {editable && (
                <i className="mt-1 ml-1 text-xs">
                  <FaPencilAlt />
                </i>
              )}
            </div>
          )}
          <div className={`${screenLg ? "text-gray-800" : "text-primary"} text-sm font-medium `}>
            {parseNumber(cartProduct.amount, true)}
          </div>
        </div>
        <div className="flex flex-col">
          <ProductQuantity
            className="justify-end"
            quantity={cartProduct.qty}
            setQuantity={(qty) => {
              if (isDiscountProduct) {
                changeDiscountItemQuantity(index, qty);
              } else {
                changeProductQuantity(index, qty);
              }
            }}
            disabled={!quantityEditable}
          />

          {isDiscountProduct && (
            <div className="text-xs text-right text-gray-600 line-through">
              {parseNumber(cartProduct.product.basePrice * cartProduct.qty, true)}
            </div>
          )}
        </div>
      </div>
      {cartProduct.note && (
        <div className="text-sm text-gray-500 text-ellipsis-1 mt-0.5">
          <span className="font-medium underline">Ghi chú: </span>
          {cartProduct.note}
        </div>
      )}
    </div>
  );
}
