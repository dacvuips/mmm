import { NextSeo } from "next-seo";
import { PaymentCallbackMoMoPage } from "../../../components/shop/payment-callback/payment-callback-momo-page";
import { NoneLayout } from "../../../layouts/none-layout/none-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Thanh toán" />
      <PaymentCallbackMoMoPage />
    </>
  );
}

Page.Layout = NoneLayout;
