import { ShopVideosPage } from "../../components/shop/videos/videos-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <ShopVideosPage />
    </>
  );
}
Page.Layout = ShopLayout;
