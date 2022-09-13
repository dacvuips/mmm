import { GetServerSidePropsContext } from "next";
import { LandingLayout } from "../../layouts/landing-layout/landing-layout";
import { HomePage } from "../../components/landing/home/home-page";
import { useSEO } from "../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <HomePage />
    </>
  );
}
Page.Layout = LandingLayout;
Page.LayoutProps = { backgroundFooterColor: "rgb(236, 245, 254)" };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const seo = await useSEO("3M Marketing - Dịch vụ đặt món trực tuyến và giao hàng tận nơi", {
    description: "Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
  });
  return {
    props: JSON.parse(
      JSON.stringify({
        seo,
      })
    ),
  };
}
