import { MarketPlacePage } from "../../components/index/market-place/market-place-page";
import { NoneLayout } from "../../layouts/none-layout/none-layout";

export default function Page(props) {
  return (
    <>
      <MarketPlacePage />
    </>
  );
}
Page.Layout = NoneLayout;
