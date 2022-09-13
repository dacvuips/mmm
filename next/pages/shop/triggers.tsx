import { NextSeo } from "next-seo";
import { TriggersPage } from "../../components/shop/triggers/triggers-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Chiến dịch" />
      <TriggersPage />
    </>
  );
}

Page.Layout = ShopLayout;
