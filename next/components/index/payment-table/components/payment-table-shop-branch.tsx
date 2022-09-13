import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { usePaymentContext } from "../../payment/providers/payment-provider";
import { ShopDetailsBranchesDialog } from "../../shop-details/components/shop-details-branches-dialog";

export function PaymentTableShopBranch() {
  const { orderInput, setOrderInput } = usePaymentContext();
  const { selectedBranch } = useShopContext();
  const [openShopBranches, setOpenShopBranches] = useState(false);
  const toast = useToast();

  return (
    <>
      <div
        className="flex items-center py-4 px-4 mt-2 bg-white  cursor-pointer whitespace-nowrap"
        onClick={() => {
          if (orderInput.tableCode) {
            toast.info("Không thể đổi chi nhánh cửa hàng");
            return;
          }
          setOpenShopBranches(true);
        }}
      >

        <span className="font-medium text-ellipsis-1">
          {(!selectedBranch && "Chọn cửa hàng") || selectedBranch.name}
        </span>
        <i className="pl-2 ml-auto mr-0 text-base text-gray-500">
          <FaChevronRight />
        </i>
      </div>
      <ShopDetailsBranchesDialog
        isOpen={openShopBranches}
        onClose={() => setOpenShopBranches(false)}
      />
    </>


  )
}
