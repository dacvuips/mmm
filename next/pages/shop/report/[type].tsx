import { ReportPage } from "../../../components/shop/report/report-page";
import { ShopLayout } from "../../../layouts/shop-layout/shop-layout";
import { NextSeo } from "next-seo";

export default function Page() {
  return (
    <>
      <NextSeo title="Báo cáo" />
      <ReportPage />
    </>
  );
}

Page.Layout = ShopLayout;
