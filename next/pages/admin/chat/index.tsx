import { NextSeo } from "next-seo";
import { ChatPage } from "../../../components/admin/chat/chat";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <NextSeo title="Chat với cửa hàng" />
      <ChatPage />
    </>
  );
}

Page.Layout = AdminLayout;
