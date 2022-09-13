import { CustomersPage } from "../../../components/admin/management/customers/customers-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <CustomersPage />
    </>
  );
}
Page.Layout = AdminLayout;
