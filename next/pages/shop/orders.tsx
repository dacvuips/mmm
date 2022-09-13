import { NextSeo } from "next-seo";
import { OrdersPage } from "../../components/shop/orders/orders-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Đơn hàng" />
      <OrdersPage />
    </>
  );
}

Page.Layout = ShopLayout;
