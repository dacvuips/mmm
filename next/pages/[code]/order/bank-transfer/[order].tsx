import { GetServerSidePropsContext } from "next";
import { OrderModel } from "../../../../../dist/graphql/modules/order/order.model";
import { BankTransferPage } from "../../../../components/index/bank-transfer/bank-transfer-page";
import { BankTransferProvider } from "../../../../components/index/bank-transfer/providers/bank-transfer-provider";
import { DefaultLayout } from "../../../../layouts/default-layout/default-layout";
import { Redirect } from "../../../../lib/helpers/redirect";
import { useSEO } from "../../../../lib/hooks/useSEO";
import { MemberModel } from "./../../../../../dist/graphql/modules/member/member.model";

export default function Page(props) {
  return (
    <BankTransferProvider id={props.id}>
      <BankTransferPage />
    </BankTransferProvider>
  );
}

Page.Layout = DefaultLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { order, code = "3MSHOP" } = context.params;
  const orderDetail = await OrderModel.findOne({ code: order }, "_id");
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  if (!orderDetail) Redirect(context.res, "/404");
  const { id } = orderDetail;
  const seo = await useSEO("Thanh toán chuyển khoản", {
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
