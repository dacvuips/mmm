import { CollaboratorsPage } from "../../../components/admin/management/collaborators/collaborators-page";
import { AdminLayout } from "../../../layouts/admin-layout/admin-layout";

export default function Page() {
  return (
    <>
      <CollaboratorsPage />
    </>
  );
}
Page.Layout = AdminLayout;
