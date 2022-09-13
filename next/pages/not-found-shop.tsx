import { NextSeo } from "next-seo";
import { NotFoundShop } from "../components/index/not-found-shop/not-found-shop";
import { NoneLayout } from "../layouts/none-layout/none-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Không tìm thấy cửa hàng" />
      <NotFoundShop />
    </>
  );
}
Page.Layout = NoneLayout;
