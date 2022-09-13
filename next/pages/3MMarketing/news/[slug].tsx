import React from "react";
import { NextSeo } from "next-seo";
import { GetServerSidePropsContext } from "next";
import { LandingLayout } from "../../../layouts/landing-layout/landing-layout";
import { PostModel } from "../../../../dist/graphql/modules/post/post.model";
import { Redirect } from "../../../lib/helpers/redirect";
import { PostPage } from "../../../components/landing/post/post-page";

export default function Page(props) {
  return (
    <>
      <NextSeo title={props.title} />
      <PostPage id={props.id} />
    </>
  );
}
Page.Layout = LandingLayout;

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
