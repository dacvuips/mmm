import { useEffect, useMemo, useRef } from "react";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useCart } from "../../../../lib/providers/cart-provider";
import { usePaymentContext } from "../providers/payment-provider";

export function AmountRow({
  label,
  subtext,
  value,
  className = "",
}: { label: string; subtext?: string; value: number } & ReactProps) {
  return (
    <div className="flex items-center justify-between text-gray-700">
      <div className="">
        {label} {subtext && <span className="text-sm font-medium">({subtext})</span>}
      </div>
      <div className={`font-medium ${className}`}>{parseNumber(value, true)}</div>
    </div>
  );
}
export function PaymentSummary() {
  const { draftOrder, orderInput, discountItems, isSubmittingDraft } = usePaymentContext();
  const { totalQty, totalAmount } = useCart();
  const ref = useRef<HTMLDivElement>();
  const screenLg = useScreen("lg");

  useEffect(() => {
    if (draftOrder?.invalidReason) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [draftOrder]);

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
    <div className={`px-4 lg:px-0 bg-white py-4 ${isSubmittingDraft ? "opacity-50" : ""}`}>
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
      {draftOrder?.order?.discount > 0 &&
        draftOrder?.order?.discount !== draftOrder?.order?.discountPoint && (
          <AmountRow
            label="Giảm giá khuyến mãi"
            value={
              draftOrder?.order?.discount > 0
                ? -(draftOrder.order.discount - draftOrder.order.discountPoint)
                : 0
            }
          />
        )}

      {draftOrder?.order?.discountPoint > 0 && (
        <AmountRow label="Giảm giá điểm thưởng" value={draftOrder?.order?.discount || 0} />
      )}
      {draftOrder?.order?.rewardPoint > 0 && (
        <AmountRow label="Điểm thưởng từ đơn hàng" value={draftOrder?.order?.rewardPoint || 0} />
      )}
      {screenLg ? (
        <div className="flex flex-row items-center justify-between p-2 mt-3 bg-gray-100 rounded-md">
          <div className="">
            <span className="text-lg font-medium text-primary-dark">Tổng tiền</span>
          </div>
          <div className={`font-semibold  text-primary-dark`}>
            {parseNumber(draftOrder?.order?.amount || totalAmount, true)}
          </div>
        </div>
      ) : (
        <AmountRow
          className="font-bold text-accent"
          label="Tổng tiền"
          value={draftOrder?.order?.amount || totalAmount}
        />
      )}
      {((draftOrder && draftOrder.invalid) ||
        (orderInput && orderInput.pickupMethod == "DELIVERY" && !orderInput.buyerFullAddress)) && (
          <div className="p-2 mt-2 font-medium rounded bg-danger-light text-danger" ref={ref}>
            {draftOrder.invalidReason ? draftOrder.invalidReason : "Vui lòng chọn đia chỉ giao hàng"}
          </div>
        )}
    </div>
  );
}
