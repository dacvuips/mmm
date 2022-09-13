import { NextSeo } from "next-seo";
import { WithdrawRequestsPage } from "../../../components/admin/management/withdraw-requests/withdraw-requests-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Yêu cầu rút tiền" />
      <WithdrawRequestsPage />
    </>
  );
}

Page.Layout = AdminLayout;
