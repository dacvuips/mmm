import { useEffect } from "react";
import { Card } from "../../../shared/utilities/misc";
import { useDashboardContext } from "../provider/dashboard-provider";

export function BusinessOverview() {
  const {
    loadReportShopCustomer,
    shopCustomerReport,
    shopOrderReportToday,
    shopOrderReport,
  } = useDashboardContext();
  useEffect(() => {
    loadReportShopCustomer();
  }, []);
  return (
    <>
      <div className="grid gap-4 grid-cols-5">
        <div className="bg-white rounded shadow min-w-max">
          <div className="flex justify-between items-center font-semibold border-b border-gray-300 p-3">
            <span className="text-gray-700 text-base">Tổng số khách hàng</span>
          </div>
          <div className="flex items-end p-4">
            <div className="text-6xl">{shopCustomerReport}</div>
            <div className="ml-2 text-sm pb-1">Khách hàng</div>
          </div>
        </div>

        <div className="bg-white rounded shadow min-w-max flex-1 col-span-4">
          <div className="flex justify-between items-center font-semibold border-b border-gray-300 p-3">
            <span className="text-gray-700 text-base">Tổng số đơn hàng trong hôm nay</span>
          </div>
          <div className="grid grid-cols-2 divide-x p-4">
            <div className="flex items-end pr-4">
              <div className="text-6xl">{shopOrderReportToday.completed}</div>
              <div className="ml-2 text-sm pb-1">đơn hàng hoàn tất hôm nay</div>
            </div>
            <div className="flex items-end pl-4">
              <div className="text-6xl">{shopOrderReportToday.pending}</div>
              <div className="ml-2 text-sm pb-1">đơn hàng chưa hoàn tất</div>
            </div>
          </div>
        </div>
        <Card className="col-span-1">
          <div className="text-sm">Đơn hàng đặt thành công</div>
          <div className="font-bold text-xl">{shopOrderReport?.pending} </div>
        </Card>
        <Card className="col-span-1">
          <div className="text-sm">Đơn hàng đang xử lí</div>
          <div className="font-bold text-xl">{shopOrderReport?.confirmed} </div>
        </Card>
        <Card className="col-span-1">
          <div className="text-sm">Đơn hàng đang giao</div>
          <div className="font-bold text-xl">{shopOrderReport?.delivering} </div>
        </Card>
        <Card className="col-span-1">
          <div className="text-sm">Đơn hàng thành công</div>
          <div className="font-bold text-xl">{shopOrderReport?.completed} </div>
        </Card>
        <Card className="col-span-1">
          <div className="text-sm">Đơn hàng thất bại</div>
          <div className="font-bold text-xl">{shopOrderReport?.failure} </div>
        </Card>
      </div>
    </>
  );
}
