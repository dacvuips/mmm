import { useRouter } from 'next/router';
import React from 'react'
import { AiOutlinePlus } from 'react-icons/ai';
import { FaPencilAlt, FaReceipt } from 'react-icons/fa';
import { RiFileListFill } from 'react-icons/ri';
import { parseNumber } from '../../../../lib/helpers/parser';
import { CartProduct, useCart } from '../../../../lib/providers/cart-provider';
import { useShopContext } from '../../../../lib/providers/shop-provider';
import { ProductQuantity } from '../../../shared/product/product-quantity';
import { Button } from '../../../shared/utilities/form';
import { NotFound, Spinner } from '../../../shared/utilities/misc';
import { usePaymentContext } from '../../payment/providers/payment-provider';

type PropsType = {}

export function PaymentTableItems({ }: PropsType) {
  const { cartProducts } = useCart();
  const { shopCode } = useShopContext();

  if (cartProducts === undefined) return <Spinner />;
  if (!cartProducts.length)
    return (
      <NotFound text="Chưa có sản phẩm trong giỏ hàng">
        <Button text="Về menu món" primary className="mt-4 rounded-full" href={`/${shopCode}/menu`} />
      </NotFound>
    );
  return (
    <div className="pt-2">
      <div className="flex items-center font-semibold px-4 py-3">
        <i className="pr-2 mb-0.5 text-lg text-primary">
          <RiFileListFill />
        </i>
        Thông tin đơn hàng
      </div>
      <div className=" bg-white  px-4 lg:px-0">
        {cartProducts.map((cartProduct, index) => (
          <CardProductItem
            editable
            cartProduct={cartProduct}
            index={index}
            key={cartProduct.productId + index}
          />
        ))}
        <Button
          icon={<AiOutlinePlus />}
          iconPosition='start'
          iconClassName='text-primary'
          text="Thêm sản phẩm"
          href={`/${shopCode}/menu`}
          className="text-primary flex items-center justify-center my-2 font-normal"
        />
      </div>
    </div>
  )
}


interface Props extends ReactProps {
  cartProduct: CartProduct;
  index: number;
  editable?: boolean;
  quantityEditable?: boolean;
  isDiscountProduct?: boolean;
}
function CardProductItem({
  cartProduct,
  index,
  editable = false,
  quantityEditable = true,
  isDiscountProduct = false,
  ...props
}: Props) {
  const { changeProductQuantity } = useCart();
  const { changeDiscountItemQuantity } = usePaymentContext();
  const router = useRouter();

  return (
    <div className={`lg:py-1.5 py-3 border-b border-dashed`}>
      <div className="flex w-full">
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
        </div>
      </div>
      {cartProduct.note && (
        <div className="text-sm text-gray-500 text-ellipsis-1 mt-0.5">
          <span className="font-medium underline">Ghi chú: </span>
          {cartProduct.note}
        </div>
      )}
      <div className="flex flex-row items-center justify-between">
        <div className={` text-primary text-sm font-medium `}>
          {parseNumber(cartProduct.amount, true)}
        </div>
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
  );
}
