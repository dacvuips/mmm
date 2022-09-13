import { NextSeo } from "next-seo";
import { PaymentHistoryPage } from "../../components/shop/payment-history/payment-history-page";
import { StaffsPage } from "../../components/shop/staffs/staffs-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Lịch sử thanh toán" />
      <PaymentHistoryPage />
    </>
  );
}

Page.Layout = ShopLayout;
