import { GoodwillPageDesktop } from "../components/index/goodwill-desktop/goodwill-page-desktop";
import { NoneLayout } from "../layouts/none-layout/none-layout";

export default function Page(props) {
  return (
    <>
      <GoodwillPageDesktop />
    </>
  );
}
Page.Layout = NoneLayout;
