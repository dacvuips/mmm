import { AdminNotificationsPage } from "../../../components/admin/makerting/notification/notification-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <AdminNotificationsPage />
    </>
  );
}
Page.Layout = AdminLayout;
