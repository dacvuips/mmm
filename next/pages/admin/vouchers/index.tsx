import { VouchersPage } from "../../../components/admin/management/vouchers/vouchers-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <VouchersPage />
    </>
  );
}
Page.Layout = AdminLayout;
