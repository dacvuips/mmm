import { useMemo, useState } from "react";
import { formatDate, parseNumber } from "../../../lib/helpers/parser";
import { useDevice } from "../../../lib/hooks/useDevice";
import { ShopVoucher } from "../../../lib/repo/shop-voucher.repo";
import { Img } from "../utilities/misc";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import vi from "date-fns/locale/vi";

interface Props extends ReactProps {
  voucher: ShopVoucher;
}
export function VoucherDetails({ voucher, ...props }: Props) {
  const details = [
    {
      label: "Nội dung ưu đãi",
      content: voucher.description,
    },
    {
      label: "Ngày hiệu lực",
      content: voucher.startDate
        ? `${formatDate(voucher.startDate, "dd-MM-yyyy HH:mm")} - ${formatDate(
          voucher.endDate,
          "dd-MM-yyyy HH:mm"
        )} `
        : "",
    },
    {
      label: "Phương thức thanh toán",
      content: voucher.applyPaymentMethods.map((item) => item).join(", "),
    },
    {
      label: "Giảm tối đa",
      content: voucher.maxDiscount,
    },
    {
      label: "Đơn hàng tối thiểu",
      content: voucher.minSubtotal && parseNumber(voucher.minSubtotal, true),
    },
    {
      label: "Sảm phẩm tối thiểu",
      content: voucher.minItemQty + " món",
    },
  ];
  const fromNow = useMemo(
    () =>
      formatDistanceToNow(new Date(voucher.endDate), {
        locale: vi,
      }),
    [voucher]
  );

  if (!voucher) return <></>;
  return (
    <div className={`p-4 text-gray-700`}>
      <div className="flex">
        <Img lazyload={false} className="w-24 border rounded" src={voucher.image} />
        <div className="flex flex-col flex-1 pt-1 pl-3">
          <div className="text-xl font-medium text-ellipsis-1 text-primary">{voucher.code}</div>
          <div className="text-base text-gray-500">HSD: còn {fromNow}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3 py-3 border-t border-b mt-4 px-1">
        {details
          .filter((x) => x.content)
          .map((item, index) => (
            <div key={index}>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="font-normal text-base">{item.content}</div>
            </div>
          ))}
      </div>
      <div className="ck-content px-1" dangerouslySetInnerHTML={{ __html: voucher.content }}></div>
    </div>
  );
}
