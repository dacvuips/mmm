import { GetServerSidePropsContext } from "next";
import React from "react";
import { DefaultLayout } from "../../layouts/default-layout/default-layout";
import { Redirect } from "../../lib/helpers/redirect";
import { MemberModel } from "../../../dist/graphql/modules/member/member.model";
import { SupportPage } from "../../components/index/support/support-page";
import { useSEO } from "../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <SupportPage />
    </>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Hỗ trợ " };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Hỗ trợ", {
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
