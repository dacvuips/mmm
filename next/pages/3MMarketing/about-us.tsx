import { GetServerSidePropsContext } from "next";
import { LandingLayout } from "../../layouts/landing-layout/landing-layout";
import { AboutUsPage } from "../../components/landing/about-us/about-us-page";
import { useSEO } from "../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <AboutUsPage />
    </>
  );
}
Page.Layout = LandingLayout;
Page.LayoutProps = {
  isHeaderTransparent: true,
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const seo = await useSEO(
    "Giới thiệu | 3M Marketing - Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
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
