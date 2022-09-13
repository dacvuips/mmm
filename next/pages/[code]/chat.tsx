import { GetServerSidePropsContext } from "next";
import React from "react";
import { DefaultLayout } from "../../layouts/default-layout/default-layout";
import { Redirect } from "../../lib/helpers/redirect";
import { MemberModel } from "../../../dist/graphql/modules/member/member.model";
import { ChatPage } from "../../components/index/chat/chat-page";
import { useSEO } from "../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <ChatPage />
    </>
  );
}

Page.Layout = DefaultLayout;
Page.LayoutProps = { name: "Chat với chúng tôi" };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code } = context.params;
  const shop = await MemberModel.findOne({ code }, "shopName shopLogo shopCover");
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const seo = await useSEO("Chat", {
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
