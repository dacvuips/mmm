import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

import { parseNumber } from "../../../../lib/helpers/parser";
import { useCart } from "../../../../lib/providers/cart-provider";
import { Button } from "../../../shared/utilities/form";
import { NotFound } from "../../../shared/utilities/misc";
import { usePaymentContext } from "../../../index/payment/providers/payment-provider";

export function BilledProductsTable() {
  const { cartProducts, clearCartProducts } = useCart();

  return (
    <>
      <table className="w-full text-sm text-left text-gray-500 border rounded-xl">
        <thead className="uppercase border-b text-md rounded-xl ">
          <tr>
            <th scope="col" className="p-4 text-right">
              <span className="">
                <Button
                  className="px-0 text-xl text-danger "
                  tooltip="Xóa hết"
                  onClick={() => {
                    clearCartProducts();
                  }}
                >
                  <RiDeleteBin5Line />
                </Button>
              </span>
            </th>
            <th scope="col" className="p-4 font-medium whitespace-nowrap text-primary ">
              STT
            </th>
            {/* <th scope="col" className="p-4 font-medium whitespace-nowrap text-primary ">
              Mã SKU
            </th> */}
            <th scope="col" className="w-56 p-4 font-medium whitespace-nowrap text-primary">
              Sản phẩm
            </th>
            <th scope="col" className="p-4 font-medium whitespace-nowrap text-primary ">
              Giá bán
            </th>
            <th scope="col" className="p-4 font-medium text-center whitespace-nowrap text-primary ">
              Số lượng
            </th>
            <th scope="col" className="p-4 font-medium text-right whitespace-nowrap text-primary ">
              Tổng tiền
            </th>
          </tr>
        </thead>
        <tbody>
          {cartProducts?.length > 0 ? (
            cartProducts?.map((item, index) => (
              <RowTable key={index} index={index} product={item} editable />
            ))
          ) : (
            <tr>
              <td className="" colSpan={8}>
                <NotFound text="Không có sản phẩm nào" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
function RowTable({
  product,
  index,
  editable = false,
  quantityEditable = true,
  isDiscountProduct = false,
  ...props
}) {
  const { changeProductQuantity, removeProductFromCart } = useCart();
  const { changeDiscountItemQuantity } = usePaymentContext();
  const router = useRouter();

  return (
    <tr className="bg-white border-b cursor-pointer hover:bg-gray-50">
      <td className="p-4 text-right">
        <Button
          className="px-0 text-xl"
          onClick={() => {
            removeProductFromCart(index);
          }}
        >
          <RiDeleteBin5Line />
        </Button>
      </td>
      <td scope="row" className="p-4 font-medium text-primary">
        {index + 1}
      </td>
      {/* <td className="p-4 font-medium text-primary ">
        {product?.SKU ? product?.SKU : "[Chưa có mã SKU]"}
      </td> */}
      <td
        className="p-4 "
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
        <p className="text-sm font-medium text-primary text-ellipsis-2">
          {product?.product.name}
        </p>
        {!!product.product.selectedToppings?.length && (
          <p className="text-sm text-gray-400 text-ellipsis-1">
            {product?.product.selectedToppings.map((topping) => topping.optionName).join(", ")}
          </p>
        )}
      </td>
      <td className="p-4 font-medium text-primary ">
        <span className="pb-2 border-b border-primary-dark ">{parseNumber(product?.price)}</span>
      </td>
      <td className="p-4">
        <ProductQuantityTable
          className="justify-end"
          quantity={product?.qty}
          setQuantity={(qty) => {
            if (isDiscountProduct) {
              changeDiscountItemQuantity(index, qty);
            } else {
              changeProductQuantity(index, qty);
            }
          }}
          disabled={!quantityEditable}
        />
      </td>
      <td className="p-4 font-medium text-right text-primary">{parseNumber(product?.amount)}</td>
    </tr>
  );
}

interface PropsType extends ReactProps {
  inputClassName?: string;
  buttonClassName?: string;
  quantity: number;
  setQuantity: Function;
  disabled?: boolean;
}
export function ProductQuantityTable(props: PropsType) {
  const handleSetQuantity = (value) => {
    if (value < 0) props.setQuantity(0);
    else props.setQuantity(value);
  };
  let buttonStyle = ` text-gray-400 focus:outline-none flex items-center p-2`;
  return (
    <>
      <div
        className={`flex flex-row items-center justify-between border border-primary  rounded-full ${props.className || ""
          }`}
      >
        {!props.disabled && (
          <button
            className={`${buttonStyle} ${props.buttonClassName || ""}`}
            onClick={() => handleSetQuantity(props.quantity - 1)}
          >
            <i className="w-full text-gray ">
              <FaMinus />
            </i>
          </button>
        )}
        <div
          className={`${props.disabled ? "w-auto" : "w-8"
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
    </>
  );
}
