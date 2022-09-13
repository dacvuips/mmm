import { NextSeo } from "next-seo";
import { SupportTicketPage } from "../../../components/admin/management/support-ticket/support-ticket-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Yêu cầu hỗ trợ" />
      <SupportTicketPage />
    </>
  );
}

Page.Layout = AdminLayout;
