import { AnalyticConfig } from "../repo/shop-config.repo";

export const pageview = (url) => {
  let config = sessionStorage.getItem("analyticConfig");
  let analyticConfig: AnalyticConfig = config ? JSON.parse(config) : null;
  if ((window as any).gtag && analyticConfig?.googleAnalytic) {
    (window as any).gtag("config", analyticConfig.googleAnalytic, {
      page_path: url,
    });
  }
};
