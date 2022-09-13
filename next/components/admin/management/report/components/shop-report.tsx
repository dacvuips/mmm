import { useEffect } from "react";
import { parseNumber } from "../../../../../lib/helpers/parser";
import { Card, Img, Spinner } from "../../../../shared/utilities/misc";
import { useReportContext } from "../providers/report-providers";
import { ReportTitle } from "./report-title";
import { ReportWidget } from "./report-widget";

export function ShopReport() {
  const { loadReportShop, shopReport } = useReportContext();

  useEffect(() => {
    loadReportShop();
  }, []);

  if (!shopReport) return <Spinner />;
  return (
    <div className="flex flex-col gap-6">
      <Card className="self-start p-6">
        <ReportTitle text="Thống kê số lượng cửa hàng" />
        <ReportWidget image="/assets/img/store.svg">
          <div className="font-semibold text-primary">
            Tổng số cửa hàng:{" "}
            <span className="text-xl font-bold">{parseNumber(shopReport.summary.totalShop)}</span>
          </div>
          <div>
            Tổng cửa hàng miễn phí:{" "}
            <span className="text-xl font-bold">{parseNumber(shopReport.summary.freePlan)}</span>
          </div>
          <div>
            Tổng cửa hàng trả phí:{" "}
            <span className="text-xl font-bold">{parseNumber(shopReport.summary.payPlan)}</span>
          </div>
        </ReportWidget>
      </Card>
      <Card className="self-start p-6">
        <ReportTitle text="Số lượng cửa hàng ở từng danh mục" />
        <div className="flex flex-wrap gap-3 mt-4">
          {shopReport.categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center justify-center w-40 text-center"
            >
              <Img
                rounded
                className="w-full mb-2 max-w-20"
                src={category.image || "/assets/img/fastfood.svg"}
              />
              <div className="font-semibold">{category.name}</div>
              <div>{category.totalShop} cửa hàng</div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="self-start w-full max-w-3xl p-6">
        <ReportTitle text="Top 10 cửa hàng có doanh thu cao nhất" />
        <table className="simple-table">
          <thead>
            <tr>
              <th className="text-left">#</th>
              <th className="text-left">Cửa hàng</th>
              <th className="text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {shopReport.topRevenue.map((shop, index) => (
              <tr key={shop.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="flex items-center justify-start min-w-lg">
                    <Img rounded className="w-8 mr-1" src={shop.shopLogo} />
                    <div className="font-semibold">{shop.shopName}</div>
                  </div>
                </td>
                <td className="text-right">{parseNumber(shop.revenue, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="self-start w-full max-w-3xl p-6">
        <ReportTitle text="Top 10 cửa hàng có số lượng đơn nhiều nhất" />
        <table className="simple-table">
          <thead>
            <tr>
              <th className="text-left">#</th>
              <th className="text-left">Cửa hàng</th>
              <th className="text-right">Đơn hàng</th>
            </tr>
          </thead>
          <tbody>
            {shopReport.topOrder.map((shop, index) => (
              <tr key={shop.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="flex items-center justify-start min-w-lg">
                    <Img rounded className="w-8 mr-1" src={shop.shopLogo} />
                    <div className="font-semibold">{shop.shopName}</div>
                  </div>
                </td>
                <td className="text-right">{parseNumber(shop.order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="self-start w-full max-w-3xl p-6">
        <ReportTitle text="Top 10 cửa hàng có khuyến mãi nhiều nhất" />
        <table className="simple-table">
          <thead>
            <tr>
              <th className="text-left">#</th>
              <th className="text-left">Cửa hàng</th>
              <th className="text-right">Khuyến mãi</th>
            </tr>
          </thead>
          <tbody>
            {shopReport.topDiscount.map((shop, index) => (
              <tr key={shop.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="flex items-center justify-start min-w-lg">
                    <Img rounded className="w-8 mr-1" src={shop.shopLogo} />
                    <div className="font-semibold">{shop.shopName}</div>
                  </div>
                </td>
                <td className="text-right">{parseNumber(shop.discount, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="self-start w-full max-w-3xl p-6">
        <ReportTitle text="Top 10 cửa hàng có số cộng tác viên nhiều nhất" />
        <table className="simple-table">
          <thead>
            <tr>
              <th className="text-left">#</th>
              <th className="text-left">Cửa hàng</th>
              <th className="text-right">Cộng tác viên</th>
            </tr>
          </thead>
          <tbody>
            {shopReport.topCollaborator.map((shop, index) => (
              <tr key={shop.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="flex items-center justify-start min-w-lg">
                    <Img rounded className="w-8 mr-1" src={shop.shopLogo} />
                    <div className="font-semibold">{shop.shopName}</div>
                  </div>
                </td>
                <td className="text-right">{parseNumber(shop.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="self-start w-full max-w-3xl p-6">
        <ReportTitle text="Top 10 cửa hàng có hoa hồng nhiều nhất" />
        <table className="simple-table">
          <thead>
            <tr>
              <th className="text-left">#</th>
              <th className="text-left">Cửa hàng</th>
              <th className="text-right">Hoa hồng</th>
            </tr>
          </thead>
          <tbody>
            {shopReport.topCommission.map((shop, index) => (
              <tr key={shop.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="flex items-center justify-start min-w-lg">
                    <Img rounded className="w-8 mr-1" src={shop.shopLogo} />
                    <div className="font-semibold">{shop.shopName}</div>
                  </div>
                </td>
                <td className="text-right">{parseNumber(shop.commission, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
