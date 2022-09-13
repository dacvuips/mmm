import { MarketPlaceDetailPage } from "../../components/index/market-place-detail/market-place-detail-page";
import { MarketPlacePage } from "../../components/index/market-place/market-place-page";
import { NoneLayout } from "../../layouts/none-layout/none-layout";

export default function Page(props) {
  return (
    <>
      <MarketPlaceDetailPage />
    </>
  );
}
Page.Layout = NoneLayout;
