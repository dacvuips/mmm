import { DisbursePage } from "../../components/admin/management/disburse/disburse-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <DisbursePage />
    </>
  );
}
Page.Layout = ShopLayout;
