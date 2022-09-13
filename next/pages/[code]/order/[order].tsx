import { GetServerSidePropsContext } from "next";
import { OrderModel } from "../../../../dist/graphql/modules/order/order.model";
import { OrderDetailPage } from "../../../components/index/order-detail/order-detail-page";
import { OrderDetailProvider } from "../../../components/index/order-detail/providers/order-detail-provider";
import { DefaultLayout } from "../../../layouts/default-layout/default-layout";
import { Redirect } from "../../../lib/helpers/redirect";
import { useSEO } from "../../../lib/hooks/useSEO";
import { MemberModel } from "./../../../../dist/graphql/modules/member/member.model";

export default function Page(props) {
  return (
    <OrderDetailProvider id={props.id}>
      <OrderDetailPage />
    </OrderDetailProvider>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Chi tiết đơn hàng", isCheckBackOrder: true };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { order, code = "3MSHOP" } = context.params;
  const orderDetail = await OrderModel.findOne({ code: order }, "_id");
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  if (!orderDetail) Redirect(context.res, "/404");
  const { id } = orderDetail;
  const seo = await useSEO("Chi tiết đơn hàng", {
    image: shop.shopCover || shop.shopLogo,
    description: shop.shopName,
    template: shop.shopName,
  });
  return {
    props: JSON.parse(
      JSON.stringify({
        id,
        seo,
      })
    ),
  };
}
