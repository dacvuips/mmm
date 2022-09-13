import { NextSeo } from "next-seo";
import { SupportTicketPage } from "../../components/shop/support-ticket/support-ticket-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Yêu cầu hỗ trợ" />
      <SupportTicketPage />
    </>
  );
}

Page.Layout = ShopLayout;
