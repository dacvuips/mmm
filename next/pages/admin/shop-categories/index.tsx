import { ShopCategoriesPage } from "../../../components/admin/management/shop-categories/shop-categories-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <ShopCategoriesPage />
    </>
  );
}
Page.Layout = AdminLayout;
