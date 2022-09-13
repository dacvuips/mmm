import { useScreen } from "../../../lib/hooks/useScreen";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { PageHeader } from "../../shared/default-layout/page-header";
import { NotFound, Spinner } from "../../shared/utilities/misc";
import { VoucherList } from "../../shared/voucher/voucher-list";

export function PromotionsPage() {
  const { customer } = useShopContext();
  const screenLg = useScreen("lg");

  if (customer === undefined) return <Spinner />;
  if (customer === null) return <NotFound text="Vui lòng đăng nhập trước" />;
  return (
    <div className={`${screenLg ? "main-container" : ""} relative min-h-screen bg-white `}>
      {/* <PageHeader title="Khuyến mãi" /> */}
      <div className="px-4 py-2">
        <VoucherList isListMode />
      </div>
    </div>
  );
}
