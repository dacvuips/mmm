import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { DefaultFooterDesktop } from "../../../layouts/defalut-footer-desktop";
import { SetCustomerToken } from "../../../lib/graphql/auth.link";
import { CartProvider } from "../../../lib/providers/cart-provider";
import { LocationProvider } from "../../../lib/providers/location-provider";
import { ShopProvider, useShopContext } from "../../../lib/providers/shop-provider";
import { Spinner } from "../../shared/utilities/misc";
import { PaymentContext, PaymentProvider } from "../../index/payment/providers/payment-provider";
import { ShopDetailsProvider } from "../../index/shop-details/providers/shop-details-provider";
import { BilledBody } from "./components/pos-body";
import { BilledHeader } from "./components/pos-header";
import { useAuth } from "../../../lib/providers/auth-provider";

type Props = {};

export function PosPage({ }: Props) {
  const { member } = useAuth();
  // const router = useRouter();
  // const [shopCode, setShopCode] = useState<string>();
  // useEffect(() => {
  //   let code = router.query.code as string;
  //   if (code) {
  //     sessionStorage.setItem("shopCode", code);
  //     if (router.query["x-token"]) {
  //       SetCustomerToken(router.query["x-token"] as string, code);
  //     }
  //     setShopCode(code);
  //   }
  //   return () => setShopCode("");
  // }, [router.query.code]);
  if (!member) return <Spinner />;

  return (
    <LocationProvider>
      <ShopProvider code={member?.code}>
        <BilledComponent />
      </ShopProvider>
    </LocationProvider>
  );
}
function BilledComponent({ ...props }) {
  const { member } = useAuth();
  if (!member) return <Spinner />;
  return (
    <CartProvider>
      <ShopDetailsProvider>
        <PaymentProvider>
          <PaymentContext.Consumer>
            {({ isSubmitting }) => (
              <>
                <BilledHeader />
                <div className="min-h-screen py-8 mt-14 main-container">
                  <BilledBody />
                </div>
                <DefaultFooterDesktop />
              </>
            )}
          </PaymentContext.Consumer>
        </PaymentProvider>
      </ShopDetailsProvider>
    </CartProvider>
  );
}
