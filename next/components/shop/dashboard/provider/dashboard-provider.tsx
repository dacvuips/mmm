import cloneDeep from "lodash/cloneDeep";
import { createContext, useContext, useEffect, useState } from "react";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { ReportService } from "../../../../lib/repo/report.repo";
import { ShopVoucher } from "../../../../lib/repo/shop-voucher.repo";

type shopOrderType = {
  pending: number;
  confirmed: number;
  delivering: number;
  completed: number;
  canceled: number;
  failure: number;
  total: number;
  pendingRevenue: number;
  revenue: number;
  partnerShipfee: number;
  shipfee: number;
  discount: number;
};

interface KlineData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export const DashboardContext = createContext<
  Partial<{
    top10Products: {
      productId: string;
      qty: number;
      productName: string;
    }[];
    top10Vouchers: {
      voucherId: string;
      qty: number;
      voucher: ShopVoucher;
    }[];
    shopOrderReport: shopOrderType;
    shopOrderReportToday: shopOrderType;
    loadReportProduct: (fromDate: Date, toDate: Date) => Promise<any>;
    loadReportShopOrder: (fromDate: Date, toDate: Date) => Promise<any>;
    loadReportChart: (fromDate: Date, toDate: Date) => Promise<any>;
    loadReportVoucher: (fromDate: Date, toDate: Date) => Promise<any>;
    loadReportShopCustomer: () => Promise<any>;
    shopCustomerReport: number;
    shopOrderChartData: KlineData;
  }>
>({});
export function DashboardProvider(props) {
  const [shopCustomerReport, setShopCustomerReport] = useState<number>(0);
  const [shopOrderChartData, setShopOrderChartData] = useState<KlineData>();
  const [shopOrderReportToday, setShopOrderReportToday] = useState<shopOrderType>({
    pending: 0,
    confirmed: 0,
    delivering: 0,
    completed: 0,
    canceled: 0,
    failure: 0,
    total: 0,
    pendingRevenue: 0,
    revenue: 0,
    partnerShipfee: 0,
    shipfee: 0,
    discount: 0,
  });
  const [top10Products, setTop10Products] = useState<
    {
      productId: string;
      qty: number;
      productName: string;
    }[]
  >([]);
  const [top10Vouchers, setTop10Vouchers] = useState<
    {
      voucherId: string;
      qty: number;
      voucher: ShopVoucher;
    }[]
  >([]);
  const [shopOrderReport, setShopOrderReport] = useState<shopOrderType>({
    pending: 0,
    confirmed: 0,
    delivering: 0,
    completed: 0,
    canceled: 0,
    failure: 0,
    total: 0,
    pendingRevenue: 0,
    revenue: 0,
    partnerShipfee: 0,
    shipfee: 0,
    discount: 0,
  });

  const loadReportChart = (fromDate: Date, toDate: Date) => {
    return ReportService.reportShopOrderKline(fromDate, toDate).then((res) =>
      setShopOrderChartData({ ...res })
    );
  };
  const loadReportShopCustomer = () => {
    return ReportService.reportShopCustomer().then((res) => setShopCustomerReport(res.total));
  };
  const loadReportShopOrder = (fromDate: Date, toDate: Date) => {
    return ReportService.reportShopOrder(fromDate, toDate).then((res) => setShopOrderReport(res));
  };

  const loadReportVoucher = (fromDate: Date, toDate: Date) => {
    return ReportService.reportShopVoucher(fromDate, toDate).then((res) =>
      setTop10Vouchers([...cloneDeep(res.top10)])
    );
  };

  const loadReportProduct = (fromDate: Date, toDate: Date) => {
    return ReportService.reportShopProduct(fromDate, toDate).then((res) =>
      setTop10Products(cloneDeep(res.top10))
    );
  };

  useEffect(() => {
    let date = new Date();
    ReportService.reportShopOrder(date, date).then((res) => setShopOrderReportToday(res));
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        loadReportProduct,
        top10Products,
        top10Vouchers,
        loadReportShopOrder,
        shopCustomerReport,
        shopOrderReport,
        loadReportShopCustomer,
        shopOrderReportToday,
        shopOrderChartData,
        loadReportChart,
        loadReportVoucher,
      }}
    >
      {props.children}
    </DashboardContext.Provider>
  );
}

export const useDashboardContext = () => useContext(DashboardContext);
