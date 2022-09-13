import { GetServerSidePropsContext } from "next";
import { PartnerPage } from "../../components/landing/partner/partner-page";
import { LandingLayout } from "../../layouts/landing-layout/landing-layout";
import { useSEO } from "../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <PartnerPage />
    </>
  );
}
Page.Layout = LandingLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const seo = await useSEO(
    "Đối tác | 3M Marketing - Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
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
