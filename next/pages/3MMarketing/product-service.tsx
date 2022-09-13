import { GetServerSidePropsContext } from "next";
import { ProductServicePage } from "../../components/landing/product-service/product-service-page";
import { LandingLayout } from "../../layouts/landing-layout/landing-layout";
import { useSEO } from "../../lib/hooks/useSEO";

export default function Page(props) {
  return (
    <>
      <ProductServicePage />
    </>
  );
}
Page.Layout = LandingLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const seo = await useSEO(
    "Sản phẩm, dịch vụ | 3M - Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
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
