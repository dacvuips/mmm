import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ShopDetailsProvider } from "../components/index/shop-details/providers/shop-details-provider";
import { Spinner } from "../components/shared/utilities/misc";
import { SetCustomerToken } from "../lib/graphql/auth.link";
import { CartProvider } from "../lib/providers/cart-provider";
import { LocationProvider } from "../lib/providers/location-provider";
import { ShopProvider, useShopContext } from "../lib/providers/shop-provider";

import { DefaultHead } from "./default-head";
import { Header } from "./default-layout/components/header";

interface PropsType extends ReactProps { }


export function OrderTableLayout({ ...props }: PropsType) {
  const router = useRouter();
  const [shopCode, setShopCode] = useState<string>();

  useEffect(() => {
    let code = router.query.code as string;
    if (code) {
      sessionStorage.setItem("shopCode", code);
      if (router.query["x-token"]) {
        SetCustomerToken(router.query["x-token"] as string, code);
      }
      setShopCode(code);
    }
    return () => setShopCode("");
  }, [router.query.code]);

  if (!shopCode) return <Spinner />;
  return (
    <>
      <LocationProvider>
        <ShopProvider code={shopCode}>
          <OrderTableLayoutComponent {...props}>{props.children}</OrderTableLayoutComponent>
        </ShopProvider>
      </LocationProvider>
    </>
  );
}
function OrderTableLayoutComponent({ ...props }) {
  const { shop } = useShopContext();
  if (!shop) return <Spinner />
  return (
    <>
      <CartProvider>
        <ShopDetailsProvider>
          <DefaultHead shopCode="" shopLogo="" />
          <div className="flex flex-col w-full min-h-screen">{props.children}</div>
        </ShopDetailsProvider>
      </CartProvider>
    </>
  )
};