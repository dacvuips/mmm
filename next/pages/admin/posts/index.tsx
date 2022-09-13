import { PostsPage } from "../../../components/admin/makerting/post/posts-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <PostsPage />
    </>
  );
}
Page.Layout = AdminLayout;
