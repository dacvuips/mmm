import { NextSeo } from "next-seo";
import { LuckyWheelsPage } from "../../components/shop/lucky-wheels/lucky-wheels-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Vòng quay may mắn" />
      <LuckyWheelsPage />
    </>
  );
}

Page.Layout = ShopLayout;
