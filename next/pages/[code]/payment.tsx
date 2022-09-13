import { GetServerSidePropsContext } from "next";
import { PaymentPage } from "../../components/index/payment/payment-page";
import { DefaultLayout } from "../../layouts/default-layout/default-layout";
import { Redirect } from "../../lib/helpers/redirect";
import { useSEO } from "../../lib/hooks/useSEO";
import { MemberModel } from "./../../../dist/graphql/modules/member/member.model";

export default function Page(props) {
  return (
    <>
      <PaymentPage />
    </>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Thanh toán" };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Thanh toán", {
    image: shop.shopCover || shop.shopLogo,
    description: shop.shopName,
    template: shop.shopName,
  });
  return {
    props: JSON.parse(
      JSON.stringify({
        seo,
      })
    ),
  };
}
