import { ShopSaleFeedsPage } from "../../components/shop/sale-feeds/sale-feeds-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <ShopSaleFeedsPage />
    </>
  );
}
Page.Layout = ShopLayout;
