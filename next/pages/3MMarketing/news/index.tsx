import { GetServerSidePropsContext } from "next";
import { LandingLayout } from "../../../layouts/landing-layout/landing-layout";
import { NewsPage } from "../../../components/landing/news/news-page";
import { useSEO } from "../../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <NewsPage />
    </>
  );
}
Page.Layout = LandingLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const seo = await useSEO(
    "Tin tức, sự kiện | 3M Marketing" + " - " + "Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
    {
      description: "Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
    }
  );
  return {
    props: JSON.parse(
      JSON.stringify({
        seo,
      })
    ),
  };
}
