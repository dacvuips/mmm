import { NextSeo } from "next-seo";
import { DefaultLayout } from "../../../layouts/default-layout/default-layout";
import { Redirect } from "../../../lib/helpers/redirect";
import { MemberModel } from "./../../../../dist/graphql/modules/member/member.model";
import { GetServerSidePropsContext } from "next";
import { WheelsPage } from "../../../components/index/wheels/wheels-page";
import { useSEO } from "../../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <NextSeo {...props.seo} />
      <WheelsPage />
    </>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Vòng quay may mắn " };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Danh sách VQMM", {
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
