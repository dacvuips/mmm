import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { VerticalPageTabs } from "../../shared/shop-layout/vertical-page-tabs";
import { AnalyticsSettings } from "./components/analytics-settings";
import { CollaboratorSettings } from "./components/collaborator-settings";
import { ConfigSettings } from "./components/config-settings";
import { DeliverySettings } from "./components/delivery-settings";
import { DomainSettings } from "./components/domain-settings";
import { GeneralSettings } from "./components/general-settings";
import { PaymentSettings } from "./components/payment-settings";
import { RewardSettings } from "./components/reward-settings";
import { SubscriptionSettings } from "./components/subscription-settings";
import { SuportSettings } from "./components/support-settings";

export function SettingsPage(props: ReactProps) {
  const router = useRouter();
  const [type, setType] = useState("");

  useEffect(() => {
    if (SETTINGS_TABS.find((x) => x.value == router.query.type)) {
      setType(router.query.type as string);
    } else {
      setType(SETTINGS_TABS[0].value);
    }
  }, [router.query]);

  return (
    <>
      <div className="pb-2 mb-2 border-b border-gray-300">
        <ShopPageTitle title="Cấu hình cửa hàng" />
      </div>
      <div className="flex gap-3">
        <VerticalPageTabs
          className="min-w-3xs whitespace-nowrap"
          options={SETTINGS_TABS}
          href="/shop/settings"
          value={type}
        />
        <div className="w-full ml-3 min-w-screen-md">
          {
            {
              general: <GeneralSettings />,
              config: <ConfigSettings />,
              delivery: <DeliverySettings />,
              payment: <PaymentSettings />,
              collaborator: <CollaboratorSettings />,
              reward: <RewardSettings />,
              support: <SuportSettings />,
              subscription: <SubscriptionSettings />,
              domain: <DomainSettings />,
              analytics: <AnalyticsSettings />,
            }[type]
          }
        </div>
      </div>
    </>
  );
}

export const SETTINGS_TABS: Option[] = [
  { value: "general", label: "Thông tin cơ bản" },
  { value: "config", label: "Thiết lập cửa hàng" },
  { value: "collaborator", label: "Cộng tác viên" },
  { value: "reward", label: "Điểm thưởng" },
  { value: "delivery", label: "Giao hàng" },
  { value: "payment", label: "Thanh toán" },
  { value: "subscription", label: "Gói dịch vụ" },
  { value: "support", label: "Hỗ trợ" },
  { value: "domain", label: "Tên miền" },
  { value: "analytics", label: "Phân tích" },
];
