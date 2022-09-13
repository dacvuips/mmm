import { useEffect, useState } from "react";
import { Select } from "../../../shared/utilities/form/select";
import { NotFound, Spinner } from "../../../shared/utilities/misc";
import { useDashboardContext } from "../provider/dashboard-provider";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import { Card } from "../../../shared/utilities/misc";
import { parseNumber } from "../../../../lib/helpers/parser";

export function ReportProductOrder(props) {
  const { loadReportShopOrder, shopOrderReport } = useDashboardContext();
  // useEffect(() => {
  //   let date = getDate(filterReportProduct);
  //   loadReportProduct(date.fromDate, date.toDate);
  // }, [filterReportProduct]);
  useEffect(() => {
    loadReportShopOrder(startOfMonth(new Date()), endOfMonth(new Date()));
  }, []);
  return (
    <div className="mt-4">
      <div className="grid items-center grid-cols-5 gap-4">
        <Card>
          <div className="text-sm">Tổng đơn hàng</div>
          <div className="text-2xl font-bold">{shopOrderReport?.completed}</div>
        </Card>
        <Card>
          <div className="text-sm">Doanh thu bán hàng</div>
          <div className="text-2xl font-bold">{parseNumber(shopOrderReport?.revenue)}đ</div>
        </Card>
        <Card>
          <div className="text-sm">Trung bình mỗi đơn</div>
          <div className="text-2xl font-bold">
            {parseNumber(Math.floor(shopOrderReport?.revenue / shopOrderReport?.completed))}đ
          </div>
        </Card>
        <Card>
          <div className="text-sm">Tổng giảm giá</div>
          <div className="text-2xl font-bold">{parseNumber(shopOrderReport?.discount)}đ</div>
        </Card>
        <Card>
          <div className="text-sm">Doanh số ship</div>
          <div className="text-2xl font-bold">{parseNumber(shopOrderReport?.partnerShipfee)}đ</div>
        </Card>
      </div>
      <div className="flex w-full mt-4 gap-x-4">
        <TableProduct />
        <TableVoucher />
      </div>
    </div>
  );
}

function TableProduct(props) {
  const { top10Products, loadReportProduct } = useDashboardContext();
  const [timeRange, setTimeRange] = useState<string>("currentMonth");

  useEffect(() => {
    let date = new Date();

    switch (timeRange) {
      case "currentMonth": {
        break;
      }
      case "lastMonth": {
        date.setMonth(date.getMonth() - 1);
        break;
      }
      case "lastMonth": {
        date.setMonth(date.getMonth() - 2);
        break;
      }
    }
    loadReportProduct(
      startOfMonth(date),
      endOfMonth(timeRange == "last3Month" ? new Date() : date)
    );
  }, [timeRange]);

  return (
    <div className="flex-1 bg-white rounded shadow">
      <div className="flex items-center justify-between h-16 px-4 font-semibold border-b border-gray-300">
        <span className="text-base text-gray-700">Sản phẩm bán chạy</span>
        <div>
          <Select className="w-56" options={TIMERANGES} value={timeRange} onChange={setTimeRange} />
        </div>
      </div>
      <div className="sticky top-0 grid grid-cols-2 p-4 font-semibold text-white border border-b-2 border-gray-200 bg-primary-light text-primary">
        <div className="text-left">Tên sản phẩm</div>
        <div className="text-center">Số lượng</div>
      </div>
      <div
        className="overflow-auto "
        style={{
          height: "372px",
        }}
      >
        {!top10Products ? (
          <Spinner />
        ) : top10Products.length == 0 ? (
          <NotFound text="Không có sản phẩm nào" />
        ) : (
          top10Products.map((item, index) => {
            return (
              <div
                key={index}
                className={`grid grid-cols-2 p-4 ${index % 2 == 1 ? "bg-gray-50" : ""}`}
              >
                <div className="text-left">{item.productName}</div>
                <div className="text-center">{item.qty}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TableVoucher(props) {
  const { top10Vouchers, loadReportVoucher } = useDashboardContext();

  useEffect(() => {
    loadReportVoucher(startOfMonth(new Date()), endOfMonth(new Date()));
  }, []);

  return (
    <div className="flex-1 bg-white rounded shadow">
      <div className="flex items-center justify-between h-16 px-4 font-semibold border-b border-gray-300">
        <span className="text-base text-gray-700">Top 10 voucher được sử dụng nhiều nhất</span>
      </div>
      <div className="sticky top-0 grid grid-cols-3 p-4 font-semibold text-white border border-b-2 border-gray-200 bg-primary-light text-primary">
        <div className="text-left">Mã Voucher</div>
        <div className="text-left">Mô tả</div>
        <div className="text-center">Số lượng sử dụng</div>
      </div>
      <div
        className="overflow-auto "
        style={{
          height: "372px",
        }}
      >
        {!top10Vouchers ? (
          <Spinner />
        ) : top10Vouchers.length == 0 ? (
          <NotFound text="Không có voucher nào" />
        ) : (
          top10Vouchers.map((item, index) => {
            return (
              <div
                key={index}
                className={`grid grid-cols-3 p-4 ${index % 2 == 1 ? "bg-gray-50" : ""}`}
              >
                <div className="text-left">{item.voucher.code}</div>
                <div className="text-left">{item.voucher.description}</div>
                <div className="text-center">{item.qty}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const TIMERANGES: Option[] = [
  { value: "currentMonth", label: "Tháng này" },
  { value: "lastMonth", label: "Tháng trước" },
  { value: "last3Month", label: "3 tháng trước" },
];
