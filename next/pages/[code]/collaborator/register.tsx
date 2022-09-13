import { GetServerSidePropsContext } from "next";
import { MemberModel } from "../../../../dist/graphql/modules/member/member.model";
import { RegisterPage } from "../../../components/index/collaborator/register/register-page";
import { DefaultLayout } from "../../../layouts/default-layout/default-layout";
import { Redirect } from "../../../lib/helpers/redirect";
import { useSEO } from "../../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <RegisterPage />
    </>
  );
}

Page.Layout = DefaultLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Đăng ký CTV", {
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
