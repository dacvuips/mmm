import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  CollaboratorReport,
  CustomerReport,
  OrderReport,
  PromotionReport,
  ReportService,
  RewardPointReport,
  ShopReport,
} from "../../../../../lib/repo/report.repo";
export const ReportContext = createContext<
  Partial<{
    isAdmin: boolean;
    color: string;
    accent: string;
    shopReport: ShopReport;
    loadReportShop: () => any;
    orderReport: OrderReport;
    loadOrderReport: ({
      fromDate,
      toDate,
      memberId,
      timeUnit,
    }: {
      fromDate: Date;
      toDate: Date;
      memberId: string;
      timeUnit: TimeUnit;
    }) => any;
    customerReport: CustomerReport;
    loadCustomerReport: ({ fromDate, toDate }: { fromDate: Date; toDate: Date }) => any;
    rewardPointReport: RewardPointReport;
    loadRewardReport: ({
      fromDate,
      toDate,
      memberId,
    }: {
      fromDate: Date;
      toDate: Date;
      memberId: string;
    }) => any;
    collaboratorReport: CollaboratorReport;
    loadCollaboratorReport: ({
      fromDate,
      toDate,
      memberId,
    }: {
      fromDate: Date;
      toDate: Date;
      memberId: string;
    }) => any;
    promotionReport: PromotionReport;
    loadPromotionReport: ({
      fromDate,
      toDate,
      memberId,
    }: {
      fromDate: Date;
      toDate: Date;
      memberId: string;
    }) => any;
  }>
>({});
interface PropsType extends ReactProps {
  isAdmin: boolean;
}
export function ReportProvider({ isAdmin = true, ...props }: PropsType) {
  const [shopReport, setShopReport] = useState<ShopReport>();
  const [orderReport, setOrderReport] = useState<OrderReport>();
  const [customerReport, setCustomerReport] = useState<CustomerReport>();
  const [collaboratorReport, setCollaboratorReport] = useState<CollaboratorReport>();
  const [promotionReport, setPromotionReport] = useState<PromotionReport>();
  const [rewardPointReport, setRewardPointReport] = useState<RewardPointReport>();
  const colorRef = useRef();
  const accentRef = useRef();
  const [color, setColor] = useState("#666");
  const [accent, setAccent] = useState("#666");

  const loadReportShop = () => {
    setShopReport(null);
    ReportService.reportShop().then((res) => setShopReport(res));
  };

  const loadOrderReport = ({ fromDate, toDate, memberId, timeUnit }) => {
    setOrderReport(null);
    ReportService.reportOrder({ fromDate, toDate, memberId, timeUnit }).then((res) =>
      setOrderReport(res)
    );
  };

  const loadCustomerReport = ({ fromDate, toDate }) => {
    setCustomerReport(null);
    ReportService.reportCustomer({ fromDate, toDate }).then((res) => setCustomerReport(res));
  };

  const loadCollaboratorReport = ({ memberId, fromDate, toDate }) => {
    setCollaboratorReport(null);
    ReportService.reportCollaborator({ memberId, fromDate, toDate }).then((res) =>
      setCollaboratorReport(res)
    );
  };

  const loadPromotionReport = ({ memberId, fromDate, toDate }) => {
    setPromotionReport(null);
    ReportService.reportPromotion({ memberId, fromDate, toDate }).then((res) =>
      setPromotionReport(res)
    );
  };
  const loadRewardReport = ({ memberId, fromDate, toDate }) => {
    setRewardPointReport(null);
    ReportService.reportRewardPoint({ memberId, fromDate, toDate }).then((res) =>
      setRewardPointReport(res)
    );
  };
  useEffect(() => {
    setTimeout(() => {
      setColor(getComputedStyle(colorRef.current).color);
    }, 100);
  }, [colorRef.current]);

  useEffect(() => {
    setTimeout(() => {
      setAccent(getComputedStyle(accentRef.current).color);
    }, 100);
  }, [accentRef.current]);

  return (
    <ReportContext.Provider
      value={{
        color,
        accent,
        shopReport,
        loadReportShop,
        orderReport,
        loadOrderReport,
        customerReport,
        loadCustomerReport,
        collaboratorReport,
        loadCollaboratorReport,
        promotionReport,
        loadPromotionReport,
        isAdmin,
        rewardPointReport,
        loadRewardReport,
      }}
    >
      <div
        className="text-accent opacity-0 invisible absolute pointer-events-none"
        ref={colorRef}
      ></div>
      <div
        className="text-danger opacity-0 invisible absolute pointer-events-none"
        ref={accentRef}
      ></div>
      {props.children}
    </ReportContext.Provider>
  );
}

export const useReportContext = () => useContext(ReportContext);

export const TIME_UNITS: Option[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];
export type TimeUnit = "day" | "week" | "month";
