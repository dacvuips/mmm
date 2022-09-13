import { DisbursePayoutsPage } from "../../../components/admin/management/disburse-payouts/disburse-payouts-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <DisbursePayoutsPage />
    </>
  );
}
Page.Layout = AdminLayout;
