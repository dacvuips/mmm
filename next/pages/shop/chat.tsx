import { NextSeo } from "next-seo";
import { ChatPage } from "../../components/shop/chat/chat";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Chat với khách hàng" />
      <ChatPage />
    </>
  );
}

Page.Layout = ShopLayout;
