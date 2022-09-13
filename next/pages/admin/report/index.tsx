import { useRouter } from "next/router";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  const router = useRouter();
  router.push("/admin/report/shops");
  return <></>;
}

Page.Layout = AdminLayout;
