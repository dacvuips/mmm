import { GetServerSidePropsContext } from "next";
import { SettingModel } from "../../../dist/graphql/modules/setting/setting.model";
import { ShopConfigModel } from "../../../dist/graphql/modules/shop/shopConfig/shopConfig.model";
import { ShopDetailsPage } from "../../components/index/shop-details/shop-details-page";
import { DefaultLayout } from "../../layouts/default-layout/default-layout";
import { Redirect } from "../../lib/helpers/redirect";
import { useSEO } from "../../lib/hooks/useSEO";
import { MemberModel } from "./../../../dist/graphql/modules/member/member.model";
import { ProductModel } from "./../../../dist/graphql/modules/product/product.model";

export default function Page(props) {
  // useEffect(() => {
  //   if (props.analyticConfig) {
  //     sessionStorage.setItem("analyticConfig", JSON.stringify(props.analyticConfig));
  //   } else {
  //     sessionStorage.removeItem("analyticConfig");
  //   }
  // }, [props.analyticConfig]);

  return (
    <>
      <ShopDetailsPage />
    </>
  );
}
Page.Layout = DefaultLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { product: productCode } = context.query;
  const { code } = context.params;
  const descSetting = await SettingModel.findOne({ key: "SEO_DESCRIPTION" }, "value");
  const shop = await MemberModel.findOne(
    // { code: { $regex: `^${code}$`, $options: "i" } },
    { code },
    "_id shopName shopLogo shopCover"
  );
  if (!shop) {
    Redirect(context.res, `/not-found-shop`);
  }
  const shopConfig = await ShopConfigModel.findOne({ memberId: shop._id }, "analyticConfig");
  let product;
  if (productCode) {
    product = await ProductModel.findOne(
      { code: productCode, memberId: shop._id },
      "cover image subtitle"
    );
  }
  const seo = await useSEO(`${shop.shopName} | Cửa hàng`, {
    image: product?.cover || product?.image || shop.shopCover || shop.shopLogo,
    description:
      product?.name || descSetting?.value || "Dịch vụ đặt món trực tuyến và giao hàng tận nơi",
  });
  return {
    props: JSON.parse(
      JSON.stringify({
        code,
        shop,
        seo,
        analyticConfig: shopConfig?.analyticConfig,
      })
    ),
  };
}
