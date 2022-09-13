import { NextSeo } from "next-seo";
import { CustomersPage } from "../../components/shop/customers/customers-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Khách hàng" />
      <CustomersPage />
    </>
  );
}

Page.Layout = ShopLayout;
