import { MarketPlacesPage } from "../../../components/admin/management/market-places/market-places-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <MarketPlacesPage />
    </>
  );
}
Page.Layout = AdminLayout;
