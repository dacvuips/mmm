import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaRegCircle, FaRegDotCircle } from "react-icons/fa";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { CollaboratorService } from "../../../../lib/repo/collaborator.repo";
import { Button } from "../../../shared/utilities/form/button";
import { Checkbox } from "../../../shared/utilities/form/checkbox";
import { BreadCrumbs, NotFound, Spinner } from "../../../shared/utilities/misc";

export function RegisterPage() {
  const { shopCode, shop, customer, getCustomer } = useShopContext();
  const [confirm, setConfirm] = useState(true);
  const router = useRouter();
  const toast = useToast();
  async function regisCollab() {
    let err = null;
    try {
      await CollaboratorService.regisCollaborator();
      toast.success("Đăng ký thành công");
    } catch (error) {
      toast.warn("Bạn chưa thỏa điều kiện để trở thành Cộng tác viên: " + error);
      err = error;
    } finally {
      if (!err) {
        await getCustomer();
        router.replace(`/${shopCode}/collaborator/info`);
      }
    }
  }
  useEffect(() => {
    if (!shop.config.collaborator) {
      router.replace(`/${shopCode}`);
    }
    if (customer && customer.isCollaborator) {
      router.replace(`/${shopCode}/collaborator/info`);
    }
  }, [customer, shop]);
  if (!customer) return <Spinner />;
  return (
    <div className="relative w-full min-h-screen bg-white rounded-md shadow">
      <BreadCrumbs
        breadcrumbs={[{ label: "Trang chủ", href: `/${shopCode}` }, { label: "Đăng ký CTV" }]}
        className="pt-4"
      />
      <div className="min-h-screen px-4">
        <h2 className="py-2 pt-4 text-lg font-bold uppercase text-center text-gray-700 border-b">
          Điều khoản dịch vụ
        </h2>
        {shop.config.colTerm ? (
          <div
            className="ck-content"
            dangerouslySetInnerHTML={{
              __html: shop.config.colTerm,
            }}
          ></div>
        ) : (
          <NotFound text="Điều khoản đang được soạn thảo" />
        )}
      </div>
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between w-full p-4 bg-white border-t">
        <Checkbox
          className="text-sm sm:text-base"
          placeholder="Tôi đồng ý với điều khoản"
          defaultValue={confirm}
          onChange={(val) => setConfirm(val)}
        />
        <Button
          text="Đăng ký"
          primary
          className="w-full mt-auto mr-0 text-sm rounded-full sm:w-28 sm:text-base"
          disabled={!confirm}
          onClick={async () => await regisCollab()}
        />
      </div>
    </div>
  );
}
