import { BusinessChart } from "./components/business-chart";
import { BusinessOverview } from "./components/business-overview";
import { ReportProductOrder } from "./components/report-product-order";
import { DashboardProvider } from "./provider/dashboard-provider";

export function DashboardPage() {
  return (
    <DashboardProvider>
      <BusinessOverview />
      <BusinessChart />
      <ReportProductOrder />
    </DashboardProvider>
  );
}
