import { GetServerSidePropsContext } from "next";
import AppPage from "../../components/landing/app/app-page";
import { LandingLayout } from "../../layouts/landing-layout/landing-layout";
import { useSEO } from "../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <AppPage />
    </>
  );
}
Page.Layout = LandingLayout;
Page.LayoutProps = { backgroundFooterColor: "rgb(236, 245, 254)" };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const seo = await useSEO(
    "Liên hệ | 3M Marketing - Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
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
