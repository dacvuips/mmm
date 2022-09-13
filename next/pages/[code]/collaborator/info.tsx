import { GetServerSidePropsContext } from "next";
import { MemberModel } from "../../../../dist/graphql/modules/member/member.model";
import { InfoPage } from "../../../components/index/collaborator/info/info-page";
import { DefaultLayout } from "../../../layouts/default-layout/default-layout";
import { Redirect } from "../../../lib/helpers/redirect";
import { useSEO } from "../../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <InfoPage />
    </>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Thông tin CTV" };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Thống kê CTV", {
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
