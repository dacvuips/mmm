import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { SettingModel } from "../../dist/graphql/modules/setting/setting.model";
import { ShopsPage } from "../components/index/shops/shops-page";
import { Spinner } from "../components/shared/utilities/misc";
import { NoneLayout } from "../layouts/none-layout/none-layout";
import { useSEO } from "../lib/hooks/useSEO";

export default function Page(props) {
  const router = useRouter();
  const { code, ...rest } = router.query;

  useEffect(() => {
    if (code) {
      router.replace({ pathname: `/${code}`, query: { ...rest } });
    }
  }, [code]);
  if (code) return <Spinner />;
  return (
    <>
      <ShopsPage />
    </>
  );
}
Page.Layout = NoneLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const titleSetting = await SettingModel.findOne({ key: "SEO_TITLE" }, "value");
  const descSetting = await SettingModel.findOne({ key: "SEO_DESCRIPTION" }, "value");
  const imageSetting = await SettingModel.findOne({ key: "SEO_IMAGE" }, "value");
  const seo = await useSEO(
    (titleSetting?.value || "3M Good Food") +
      " - " +
      (descSetting?.value || "Dịch vụ đặt món trực tuyến và giao hàng tận nơi"),
    {
      image: imageSetting?.value,
      description: descSetting?.value || "Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
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
