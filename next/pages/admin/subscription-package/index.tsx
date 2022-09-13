import { SubscriptionPackagePage } from "../../../components/admin/makerting/subcription-package/subscription-package-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <SubscriptionPackagePage />
    </>
  );
}
Page.Layout = AdminLayout;
