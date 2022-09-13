import { NextSeo } from "next-seo";
import { BranchesPage } from "../../components/shop/branches/branches-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Điểm kinh doanh" />
      <BranchesPage />
    </>
  );
}

Page.Layout = ShopLayout;
