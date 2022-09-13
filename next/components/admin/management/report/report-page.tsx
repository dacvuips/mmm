import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { ShopPageTabs } from "../../../shared/shop-layout/shop-page-tabs";
import { CollaboratorReport } from "./components/collaborator-report";
import { CustomerReport } from "./components/customer-report";
import { OrderReport } from "./components/order-report";
import { PromotionReport } from "./components/promotion-report";
import { ShopReport } from "./components/shop-report";
import { ReportProvider } from "./providers/report-providers";
import { RewardPointReport } from "./components/reward-point-report";

export function ReportPage() {
  return <ReportList />;
}

export const REPORT_TABS: (Option & { isAdmin?: boolean })[] = [
  { value: "shops", label: "Cửa hàng" },
  { value: "orders", label: "Đơn hàng", isAdmin: false },
  { value: "customers", label: "Khách hàng", isAdmin: false },
  { value: "collaborators", label: "Cộng tác viên", isAdmin: false },
  { value: "promotion", label: "Khuyến mãi", isAdmin: false },
  { value: "rewardPoints", label: "Điểm thưởng", isAdmin: false },
];

export function ReportList({ isAdmin = true }: { isAdmin?: boolean }) {
  const [tab, setTab] = useState<string>("");
  const router = useRouter();

  const reportTabs = useMemo(() => {
    return isAdmin ? REPORT_TABS : REPORT_TABS.filter((x) => x.isAdmin === false);
  }, [isAdmin]);

  useEffect(() => {
    if (reportTabs) {
      if (reportTabs.find((x) => x.value == router.query.type)) {
        setTab(router.query.type as string);
      } else {
        setTab(reportTabs[0].value);
      }
    }
  }, [router.query, reportTabs]);

  return (
    <ReportProvider isAdmin={isAdmin}>
      <ShopPageTabs
        className="-mt-4 mb-4"
        options={reportTabs}
        value={tab}
        onChange={(val) => {
          router.replace(`/${isAdmin ? "admin" : "shop"}/report/${val}`);
        }}
      />
      {
        {
          shops: <ShopReport />,
          orders: <OrderReport isAdmin={isAdmin} />,
          customers: <CustomerReport />,
          collaborators: <CollaboratorReport />,
          promotion: <PromotionReport />,
          rewardPoints: <RewardPointReport />,
        }[tab]
      }
    </ReportProvider>
  );
}
