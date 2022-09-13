import { GetServerSidePropsContext } from "next";
import { OrderPage } from "../../../components/index/order/order-page-ver2";
import { DefaultLayout } from "../../../layouts/default-layout/default-layout";
import { Redirect } from "../../../lib/helpers/redirect";
import { useSEO } from "../../../lib/hooks/useSEO";
import { MemberModel } from "./../../../../dist/graphql/modules/member/member.model";

export default function Page(props) {
  return (
    <>
      <OrderPage />
    </>
    // <OrderProvider>

    // </OrderProvider>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Lịch sử đặt hàng " };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Lịch sử đơn hàng", {
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
