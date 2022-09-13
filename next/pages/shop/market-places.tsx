import { NextSeo } from "next-seo";
import { MarketPlacesPage } from "../../components/shop/market-places/market-places-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Market Places" />
      <MarketPlacesPage />
    </>
  );
}
Page.Layout = ShopLayout;
