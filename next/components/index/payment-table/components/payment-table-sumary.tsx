import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { RiCouponFill } from "react-icons/ri";
import { useCart } from "../../../../lib/providers/cart-provider";
import { Button } from "../../../shared/utilities/form";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";
import { VoucherListDialog } from "../../../shared/voucher/voucher-list-dialog";
import { AmountRow } from "../../payment/components/payment-summary";
import { usePaymentContext } from "../../payment/providers/payment-provider";

export function PaymentTableSummary() {
  const { draftOrder, orderInput, discountItems, isSubmittingDraft } = usePaymentContext();
  const { totalQty, totalAmount } = useCart();
  const { selectedVoucher, setSelectedVoucher } = usePaymentContext();
  const [openVoucherList, setOpenVoucherList] = useState(false);
  const [openVoucherDetails, setOpenVoucherDetails] = useState(null);

  const finalTotalQty = useMemo(
    () =>
      discountItems?.filter((x) => x.selected).reduce((total, item) => total + item.qty, 0) || 0,
    [discountItems, totalQty]
  );
  if (!draftOrder?.order)
    return (
      <div className="py-4 font-medium text-primary flex-center loading-ellipsis animate-emerge">
        Đang tính
      </div>
    );
  return (
    <>
      <div className="px-4 py-4 mt-3 mb-8 bg-white">
        <div className="flex flex-row items-center justify-between mb-2">
          <div className="font-semibold">Khuyến mãi</div>
          <div className="flex items-start justify-end">
            <Button
              icon={<RiCouponFill />}
              iconPosition="start"
              iconClassName="text-primary text-xl"
              className="rounded-md text-primary bg-primary-light"
              text={`${selectedVoucher?.code || " Mã khuyến mãi"}`}
              onClick={() =>
                selectedVoucher ? setOpenVoucherDetails(selectedVoucher) : setOpenVoucherList(true)
              }
            />
            {selectedVoucher ? (
              <i
                className="px-2 text-sm text-gray-500text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVoucher(null);
                }}
              >
                <FaTimes />
              </i>
            ) : null}
          </div>
        </div>
        <AmountRow
          label="Tạm tính"
          subtext={`${draftOrder?.order?.itemCount || finalTotalQty} sản phẩm`}
          value={draftOrder?.order?.subtotal}
        />
        <AmountRow
          label="Phí giao hàng"
          subtext={draftOrder?.order?.shipDistance ? `${draftOrder?.order?.shipDistance} km` : ""}
          value={draftOrder?.order?.shipfee}
        />
        {draftOrder?.order?.rewardPoint > 0 && (
          <AmountRow
            label="Điểm thưởng"
            value={draftOrder?.order?.rewardPoint || 0}
            className="text-success"
          />
        )}

        <AmountRow
          className="font-semibold text-primary"
          label="Tổng tiền"
          value={draftOrder?.order?.amount || totalAmount}
        />
      </div>
      <VoucherListDialog
        isOpen={openVoucherList}
        onClose={() => setOpenVoucherList(false)}
        onApply={(voucher) => {
          setSelectedVoucher(voucher);
        }}
      />
      <VoucherDetailsDialog
        voucher={openVoucherDetails}
        isOpen={openVoucherDetails ? true : false}
        onClose={() => {
          setOpenVoucherDetails(null);
        }}
      />
    </>
  );
}
