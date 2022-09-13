import { BannersPage } from "../../../components/admin/management/banners/banners-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <BannersPage />
    </>
  );
}
Page.Layout = AdminLayout;
