import { ShopVoucher } from "../../../lib/repo/shop-voucher.repo";
import { Button } from "../utilities/form";
import { Img } from "../utilities/misc";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import vi from "date-fns/locale/vi";
import { useMemo } from "react";

export function VoucherItem({
  voucher,
  onShowDetails,
  onApply,
  className = "",
}: { voucher: ShopVoucher; onShowDetails?: () => any; onApply?: () => any } & ReactProps) {
  const fromNow = useMemo(
    () =>
      formatDistanceToNow(new Date(voucher.endDate), {
        locale: vi,
      }),
    [voucher]
  );

  return (
    <div
      className={`flex items-center   w-full h-20 border border-blue-100 rounded-xl  relative ${className}`}
    >
      <div
        className="flex flex-1 h-full border-l-8 rounded-l-xl border-primary"
        onClick={() => {
          if (onShowDetails) onShowDetails();
        }}
      >
        <Img lazyload={false} className="w-20 pb-2 rounded-l-md" src={voucher.image} />
        <div className="flex flex-col flex-1 py-2 pl-2">
          <div className="text-base font-medium text-ellipsis-1">{voucher.code}</div>
          <div className="text-xs text-gray-500">HSD: còn {fromNow}</div>
          {onShowDetails && (
            <Button
              text="Xem chi tiết"
              textPrimary
              className="justify-start h-3 p-0 mt-auto text-xs underline sm:pb-2"
            />
          )}
        </div>
      </div>
      {onApply && (
        <Button
          text="Chọn"
          className="z-10 h-full pl-4 pr-6 border-l border-gray-300 border-dashed rounded-none"
          textPrimary
          onClick={() => {
            onApply();
          }}
        />
      )}
      {/* <div
        className="absolute right-0 flex origin-center pointer-events-none w-7 bg-gradient-to-r from-gray-300"
        style={{ transform: `scaleY(0.96) translateX(5px)` }}
      >
        <div className="h-20 shadow-2xl hollow-circles"></div>
      </div> */}
    </div>
  );
}
