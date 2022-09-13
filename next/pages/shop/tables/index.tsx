import { NextSeo } from "next-seo";
import { ShopTablesPage } from "../../../components/shop/tables/shop-tables-page";
import { ShopLayout } from "../../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Bàn" />
      <ShopTablesPage />
    </>
  );
}

Page.Layout = ShopLayout;
