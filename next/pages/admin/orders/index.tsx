import { OrdersPage } from "../../../components/admin/management/orders/orders-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <OrdersPage />
    </>
  );
}
Page.Layout = AdminLayout;
