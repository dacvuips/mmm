import { ShopPostPage } from "../../components/shop/post/post-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <ShopPostPage />
    </>
  );
}
Page.Layout = ShopLayout;
