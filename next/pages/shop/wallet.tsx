import { NextSeo } from "next-seo";
import { WalletPage } from "../../components/shop/wallet/wallet-page";
import { ShopLayout } from "../../layouts/shop-layout/shop-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Ví tiền" />
      <WalletPage />
    </>
  );
}

Page.Layout = ShopLayout;
