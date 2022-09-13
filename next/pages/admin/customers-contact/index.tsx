import { CustomerContactPage } from "../../../components/admin/makerting/customers-contact/customers-contact-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <CustomerContactPage />
    </>
  );
}
Page.Layout = AdminLayout;
