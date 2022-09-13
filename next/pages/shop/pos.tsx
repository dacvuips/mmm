import { NextSeo } from "next-seo";
import { PosPage } from "../../components/shop/pos/pos-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Tạo đơn tại quầy" />
      <PosPage />
    </>
  );
}

Page.Layout = ShopLayout;
Page.LayoutProps = { fullPage: true }
