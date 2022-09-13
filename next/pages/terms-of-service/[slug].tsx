import React from "react";
import { TemsOfServicePage } from "../../components/index/terms-of-service/terms-of-service-page";
import { NoneLayout } from "../../layouts/none-layout/none-layout";
import { Redirect } from "../../lib/helpers/redirect";
import { PostModel } from "../../../dist/graphql/modules/post/post.model";
import { NextSeo } from "next-seo";
import { GetServerSidePropsContext } from "next";

export default function Page(props) {
  return (
    <>
      <NextSeo title={props.title} />
      <TemsOfServicePage id={props.id} />
    </>
  );
}
Page.Layout = NoneLayout;
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { slug = "" } = context.params;

  const post = await PostModel.findOne({ slug }, "_id title excerpt featureImage");

  if (!post) Redirect(context.res, "/404");
  return {
    props: JSON.parse(
      JSON.stringify({
        id: post.id,
        title: post.title,
      })
    ),
  };
}
