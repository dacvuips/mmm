import { GetServerSidePropsContext } from "next";
import React from "react";
import { CustomerPage } from "../../components/index/customer/customer-page";
import { DefaultLayout } from "../../layouts/default-layout/default-layout";
import { Redirect } from "../../lib/helpers/redirect";
import { useSEO } from "../../lib/hooks/useSEO";
import { MemberModel } from "./../../../dist/graphql/modules/member/member.model";

export default function Page(props) {
  return (
    <>
      <CustomerPage />
    </>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Thông tin tài khoản" };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Tài khoản", {
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
