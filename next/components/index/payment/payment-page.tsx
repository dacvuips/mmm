import router from "next/router";
import React, { useEffect, useState } from "react";
import { useCart } from "../../../lib/providers/cart-provider";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { PageHeader } from "../../shared/default-layout/page-header";
import { ProductDetailsDialog } from "../../shared/product-details/product-details-dialog";
import { ProductDetailsProvider } from "../../shared/product-details/product-details-provider";
import { Button } from "../../shared/utilities/form";
import { Spinner } from "../../shared/utilities/misc";
import { INFO_POLICY } from "../shop-details/shop-details-page";
import { PaymentDeliveryInfo } from "./components/payment-delivery-info";
import { PaymentDiscountItems } from "./components/payment-discount-items";
import { PaymentFooter } from "./components/payment-footer";
import { PaymentItems } from "./components/payment-items";
import { PaymentNote } from "./components/payment-note";
import { PaymentSummary } from "./components/payment-summary";
import { PaymentVoucherItemsDialog } from "./components/payment-voucher-items-dialog";
import { PaymentVouchers } from "./components/payment-vouchers";
import { PaymentContext, PaymentProvider } from "./providers/payment-provider";

export function PaymentPage() {
  const { cartProducts } = useCart();
  const { customer, shop, shopCode } = useShopContext();

  useEffect(() => {
    if (customer === null) {
      router.push(`/${shopCode}`);
    }
  }, [customer]);

  if (!customer || !shop || !cartProducts) return <Spinner />;
  return (
    <PaymentProvider>
      <PaymentContext.Consumer>
        {({ isSubmitting }) => (
          <>
            <div
              className={`relative min-h-screen bg-gray-100 ${shop.config.rewardPointConfig.active ? "pb-44" : "pb-32"
                } ${isSubmitting ? "pointer-events-none opacity-70" : ""}`}
            >
              {/* <PageHeader title="Thanh toán" /> */}
              <div className="py-2 text-gray-700 ">
                <PaymentDeliveryInfo />
                <PaymentItems />
                <PaymentDiscountItems />
                <PaymentNote />
                <PaymentSummary />
                <PaymentPolicyInfo />
              </div>
              <PaymentVouchers />
              <PaymentFooter />
              <PaymentVoucherItemsDialog />
              <ProductDetailsProvider isDiscountItems>
                <ProductDetailsDialog />
              </ProductDetailsProvider>
            </div>
          </>
        )}
      </PaymentContext.Consumer>
    </PaymentProvider>
  );
}

function PaymentPolicyInfo() {
  const [openMoreInfo, setOpenMoreInfo] = useState(false);
  return (
    <div className="px-4 py-2 mt-2 bg-white">
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-semibold">Thông tin về tiện ích và dịch vụ hỗ trợ</div>
        <Button
          text={`${openMoreInfo ? "Thu gọn" : "Xem chi tiết"}`}
          className="text-sm"
          onClick={() => {
            setOpenMoreInfo(!openMoreInfo);
          }}
        />
      </div>
      {openMoreInfo &&
        INFO_POLICY.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className="text-sm font-semibold">{item.title}</div>
            <div
              className="text-sm ck-content"
              dangerouslySetInnerHTML={{
                __html: item.content,
              }}
            ></div>
          </div>
        ))}
    </div>
  );
}
