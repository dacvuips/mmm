import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useCart } from "../../../../lib/providers/cart-provider";
import { CUSTOMER_LOGIN_PATHNAME, useShopContext } from "../../../../lib/providers/shop-provider";
import { CardProductItem } from "../../../shared/product/cart-product-item";
import { Button } from "../../../shared/utilities/form";
import { NotFound } from "../../../shared/utilities/misc";
import { DeliveryInfo, PaymentDeliveryInfo } from "../../payment/components/payment-delivery-info";
import { PaymentDiscountItems } from "../../payment/components/payment-discount-items";
import { PaymentFooter } from "../../payment/components/payment-footer";
import { PaymentItems } from "../../payment/components/payment-items";
import { PaymentNote } from "../../payment/components/payment-note";
import { PaymentSummary } from "../../payment/components/payment-summary";
import { PaymentVoucherItemsDialog } from "../../payment/components/payment-voucher-items-dialog";
import { PaymentContext, PaymentProvider } from "../../payment/providers/payment-provider";
import { UpsaleProducts } from "./shop-details-cart-dialog";

type Props = {};

export function ShopDetailsCartDesktop({ }: Props) {
  const router = useRouter();
  const { customer, shopCode, shop, setOpenLoginDialog } = useShopContext();
  const {
    cartProducts,
    totalAmount,
    changeProductQuantity,
    totalQty,
    clearCartProducts,
  } = useCart();

  if (!cartProducts || !cartProducts.length) return <NotFound text="Mua sắm thôi nào" />;
  return (
    <>
      {cartProducts?.length && (
        <div
          className={`flex flex-col text-sm sm:text-base v-scrollbar overflow-hidden text-gray-600 `}
        >
          <div className="flex flex-row items-start justify-between py-1 ">
            <div>
              <div className="p-2 rounded-lg bg-primary-light text-primary">
                <span className="font-semibold text-primary">{totalQty}</span> sản phẩm -{" "}
                <span className="font-semibold text-primary">1</span> người
              </div>
              <div className="pl-1 mt-2">
                Đơn hàng tạo bởi{" "}
                <span className="font-medium text-primary">
                  {customer?.name ? customer?.name : "[chưa có]"}
                </span>{" "}
              </div>
            </div>
            <Button
              text="Xóa hết"
              medium
              outline
              hoverDanger
              icon={<HiOutlineTrash />}
              className="px-0"
              onClick={() => clearCartProducts()}
            />
          </div>
          {!customer && cartProducts ? (
            <>
              <div className="my-2 border-t border-dashed"></div>
              <div className="">
                {cartProducts?.map((cartProduct, index) => (
                  <CardProductItem
                    editable
                    cartProduct={cartProduct}
                    index={index}
                    key={cartProduct.productId + index}
                  />
                ))}
              </div>
              <Button
                primary
                text={`Xác nhận - ${parseNumber(totalAmount, true)}`}
                className="z-40 w-full h-12 mt-3 mb-2 font-medium text-center border-b-4 rounded-lg border-primary-dark"
                onClick={() => {
                  if (!customer) {
                    // router.push(`${shopCode}?login=true`);
                    setOpenLoginDialog(true);
                  }
                }}
              />
            </>
          ) : (
            <>
              <div className="my-3 border-t border-dashed"></div>
              <PaymentDeliveryInfo />
              {/* <DeliveryInfo /> */}
              <PaymentItems />
              <PaymentDiscountItems />
              <PaymentNote />
              <PaymentSummary />
              <PaymentFooter />
              <PaymentVoucherItemsDialog />
            </>
          )}
        </div>
      )}
    </>
  );
}
