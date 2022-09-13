import { NotFound } from "../../../components/shared/utilities/misc";
import { ResetMemberPwd } from "../../../components/shop/reset-member-pwd/reset-member-pwd";
import { NoneLayout } from "../../../layouts/none-layout/none-layout";

export default function Page(props) {



  return (
    <>
      <ResetMemberPwd />
    </>
  );
}
Page.Layout = NoneLayout;