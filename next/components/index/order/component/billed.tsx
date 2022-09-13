import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";
import { Order, OrderInput, OrderItem, OrderService } from "../../../../lib/repo/order.repo";
import { Button } from "../../../shared/utilities/form/button";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { formatDate, parseNumber } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";

interface PropsType extends ReactProps {
  status: Option;
  order?: Order;
  reOrder?: (items: OrderItem[], infoPay: OrderInput) => any;
}
export function Billed({ order, status, reOrder, ...props }: PropsType) {
  const { shopCode } = useShopContext();
  const toast = useToast();
  function reOrderClick(order: Order) {
    OrderService.getOne({ id: order.id })
      .then((res) => {
        const {
          promotionCode,
          buyerName,
          buyerPhone,
          pickupMethod,
          shopBranchId,
          pickupTime,
          buyerAddress,
          buyerProvinceId,
          buyerDistrictId,
          buyerWardId,
          buyerFullAddress,
          buyerAddressNote,
          latitude,
          longitude,
          paymentMethod,
          note,
        } = res;
        reOrder(res.items, {
          promotionCode,
          buyerName,
          buyerPhone,
          pickupMethod,
          shopBranchId,
          pickupTime,
          buyerAddress,
          buyerProvinceId,
          buyerDistrictId,
          buyerWardId,
          buyerFullAddress,
          buyerAddressNote,
          latitude,
          longitude,
          paymentMethod,
          note,
        });
      })
      .catch((err) => toast.error("Đã xảy ra lỗi. Vui lòng chọn đơn hàng khác"));
  }
  return (
    <div
      className={`w-full mb-3 bg-white text-sm border-b shadow-sm border-t ${
        props.className || ""
      }`}
    >
      <Link href={`/${shopCode}/order/${order.code}`}>
        <div className="flex items-center justify-between px-2 transition-all duration-200 border-b-2 cursor-pointer hover:bg-primary-light">
          <div className="flex flex-col w-full p-2">
            <div className="flex flex-wrap items-center justify-start gap-2">
              <span
                className={`bg-${
                  status.value === "PENDING" || status.value === "CONFIRMED"
                    ? "success"
                    : status.color
                } font-bold text-sm text-white rounded-full px-2`}
              >
                {status.value === "PENDING" || status.value === "CONFIRMED"
                  ? "Đã đặt"
                  : order.statusText}
              </span>
              <span className="">-</span>
              <span className="font-semibold">#{order.code}</span>
              <span className="">{formatDate(order.createdAt, "dd-MM-yyyy HH:mm")}</span>
            </div>
            <div className="flex flex-col pt-1">
              <div className="font-bold text-ellipsis-2">
                {order.seller.shopName} - {order.shopBranch.name}
                {/* <span className="">{order.seller.shopName}</span>
                <span className="px-2">-</span>
                <span className="">{order.shopBranch.name}</span> */}
              </div>
              <div className="flex flex-wrap justify-between pt-1">
                <div className="flex flex-1 pt-1 whitespace-nowrap">
                  <span className="font-bold">{parseNumber(order.subtotal)}đ</span>
                  <span className="ml-1">({order.paymentMethod})</span>
                  <span className="px-2">-</span>
                  <span className="">{order.itemCount} món</span>
                </div>
              </div>
            </div>
          </div>
          <i className="mr-2 text-2xl text-primary">
            <HiChevronRight />
          </i>
        </div>
      </Link>
      {
        {
          PENDING: (
            <Button
              text="Gọi nhà hàng"
              className="w-full whitespace-nowrap"
              textPrimary
              hoverSuccess
              href={`tel:${order.shopBranch.phone}`}
            />
          ),
          CONFIRMED: (
            <Button
              text="Gọi nhà hàng"
              className="w-full whitespace-nowrap"
              textPrimary
              hoverSuccess
              href={`tel:${order.shopBranch.phone}`}
            />
          ),
          CANCELED: (
            <Button
              text="Đặt lại"
              textPrimary
              hoverSuccess
              className="w-full whitespace-nowrap"
              asyncLoading
              onClick={async () => await reOrderClick(order)}
            />
          ),
          RETURNED: (
            <Button
              text="Đặt lại"
              textPrimary
              hoverSuccess
              className="w-full whitespace-nowrap"
              onClick={async () => await reOrderClick(order)}
            />
          ),
          FAILURE: (
            <Button
              text="Đặt lại"
              textPrimary
              hoverSuccess
              className="w-full whitespace-nowrap"
              onClick={async () => await reOrderClick(order)}
            />
          ),
          COMPLETED: (
            <Button
              text="Đặt lại"
              textPrimary
              hoverSuccess
              className="w-full whitespace-nowrap"
              onClick={async () => await reOrderClick(order)}
            />
          ),
          DELIVERING: (
            <>
              {order.shipMethod === "AHAMOVE" && (
                <Button
                  text="Xem trên Ahamove"
                  textPrimary
                  hoverSuccess
                  className="w-full whitespace-nowrap"
                  href={order.ahamoveTrackingLink}
                />
              )}
            </>
          ),
        }[order.status]
      }
    </div>
  );
}
