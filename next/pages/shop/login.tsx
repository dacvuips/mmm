import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";
import { SettingModel } from "../../../dist/graphql/modules/setting/setting.model";
import ShopLoginPage from "../../components/shop/login/login-page";
import { NoneLayout } from "../../layouts/none-layout/none-layout";

export default function Page({ ...props }) {
  return (
    <>
      <NextSeo title="Đăng nhập cửa hàng" />
      <ShopLoginPage regisEnabled={props.regisEnabled} />
    </>
  );
}

Page.Layout = NoneLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const setting = await SettingModel.findOne({ key: "REGIS_ENABLE" }, "value");
  return {
    props: JSON.parse(
      JSON.stringify({
        regisEnabled: setting?.value || false,
      })
    ),
  };
}
