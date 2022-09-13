import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";
import React from "react";
import { PostModel } from "../../../../dist/graphql/modules/post/post.model";
import RecruitDetailPage from "../../../components/landing/recruit-detail/recruit-detail-page";
import { LandingLayout } from "../../../layouts/landing-layout/landing-layout";
import { Redirect } from "../../../lib/helpers/redirect";

export default function Page(props) {
  return (
    <>
      <NextSeo title={props.title} />
      <RecruitDetailPage id={props.id} />
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
