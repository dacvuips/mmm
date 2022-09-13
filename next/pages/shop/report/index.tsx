import { useRouter } from "next/router";
import { ShopLayout } from "../../../layouts/shop-layout/shop-layout";

export default function Page() {
  const router = useRouter();
  router.push("/shop/report/promotion");
  return <></>;
}

Page.Layout = ShopLayout;
