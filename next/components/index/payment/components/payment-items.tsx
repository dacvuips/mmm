import React, { useState } from "react";
import { FaReceipt } from "react-icons/fa";
import { useCart } from "../../../../lib/providers/cart-provider";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { CardProductItem } from "../../../shared/product/cart-product-item";
import { Button } from "../../../shared/utilities/form/button";
import { NotFound, Spinner } from "../../../shared/utilities/misc";

export function PaymentItems(props) {
  const { cartProducts } = useCart();
  const { shopCode } = useShopContext();

  if (cartProducts === undefined) return <Spinner />;
  if (!cartProducts.length)
    return (
      <NotFound text="Chưa có sản phẩm trong giỏ hàng">
        <Button text="Về trang chủ" primary className="mt-4 rounded-full" href={`/${shopCode}`} />
      </NotFound>
    );
  return (
    <div className="lg:pt-4 pt-2">
      <div className="flex items-center font-semibold uppercase  px-4 lg:px-0 pb-2 lg:pb-0">
        <i className="pr-2 mb-0.5 text-primary">
          <FaReceipt />
        </i>
        Đơn hàng của bạn
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
      </div>
    </div>
  );
}
