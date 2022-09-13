import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ChatProvider } from "../../components/shared/chat/chat-provider";
import { ChatWidget } from "../../components/shared/shop-layout/chat-widget";

import { ErrorCatcher, Spinner } from "../../components/shared/utilities/misc";
import { SetCustomerToken } from "../../lib/graphql/auth.link";
import { pageview } from "../../lib/helpers/ga";
import { useDevice } from "../../lib/hooks/useDevice";
import { useScreen } from "../../lib/hooks/useScreen";
import { CartProvider } from "../../lib/providers/cart-provider";
import { LocationProvider } from "../../lib/providers/location-provider";
import { ShopProvider, useShopContext } from "../../lib/providers/shop-provider";
import { DefaultFooterDesktop } from "../defalut-footer-desktop";
import { DefaultHead } from "../default-head";
import { Header } from "./components/header";
import { HeaderDesktop } from "./components/header-desktop";
import { DefaulLayoutProvider } from "./provider/default-layout-provider";

export function DefaultLayout({ ...props }) {
  const router = useRouter();
  const [shopCode, setShopCode] = useState<string>();

  useEffect(() => {
    let code = router.query.code as string;
    if (code) {
      sessionStorage.setItem("shopCode", code);
      if (router.query["x-token"]) {
        SetCustomerToken(router.query["x-token"] as string, code);
      }
      if (router.query["colCode"]) {
        sessionStorage.setItem(code + "colCode", router.query["colCode"] as string);
      }
      if (router.query["psid"]) {
        sessionStorage.setItem(code + "psid", router.query["psid"] as string);
      }
      if (router.query["followerId"]) {
        sessionStorage.setItem(code + "followerId", router.query["followerId"] as string);
      }
      setShopCode(code);
    }
    return () => setShopCode("");
  }, [router.query.code]);

  //google analytics
  useEffect(() => {
    const handleRouteChange = (url) => {
      pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  if (!shopCode) return <Spinner />;
  return (
    <>
      <DefaulLayoutProvider>
        <LocationProvider>
          <ShopProvider code={shopCode}>
            <DefaultLayoutContent {...props}>{props.children}</DefaultLayoutContent>
          </ShopProvider>
        </LocationProvider>
      </DefaulLayoutProvider>
    </>
  );
}

function DefaultLayoutContent({ ...props }) {
  const screenLg = useScreen("lg");
  const { shop, shopCode, customer } = useShopContext();

  if (!shop) return <Spinner />;
  return (
    <div className={`${screenLg ? "" : "bg-gray-200"} relative flex flex-col`}>
      <>
        <DefaultHead shopCode={shopCode} shopLogo={shop.shopLogo} />
        <CartProvider>
          <ChatProvider senderRole="CUSTOMER" threadId={customer?.threadId} senderId={customer?.id}>
            {screenLg ? (
              // when ui is desktop
              <>
                <div className="flex flex-col">
                  <HeaderDesktop />
                  <div className="min-h-screen mt-14">
                    <ErrorCatcher>{props.children}</ErrorCatcher>
                  </div>
                  <DefaultFooterDesktop />
                </div>
                {/* <ChatWidget
                  // memberId={customer?.id}
                  // threadId={customer?.threadId || customer?.thread?.id}
                  
                /> */}
                {customer && (
                  <ChatWidget
                    threadId={customer?.threadId || customer?.thread?.id}
                    senderId={customer?.id}
                    senderRole="CUSTOMER"
                    receiverRole="MEMBER"
                  />
                )}
              </>
            ) : (
              // when ui is mobile
              <div className="w-full min-h-screen mx-auto bg-gray-100 shadow-lg">
                <Header {...props} />
                <ErrorCatcher>{props.children}</ErrorCatcher>
              </div>
            )}
          </ChatProvider>
        </CartProvider>
      </>
    </div>
  );
}
