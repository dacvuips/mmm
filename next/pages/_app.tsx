import { DefaultSeo, NextSeo } from 'next-seo';
import { Fragment, useEffect } from 'react'
import { AlertProvider } from "../lib/providers/alert-provider";
import { ToastProvider } from "../lib/providers/toast-provider";
import { TooltipProvider } from "../lib/providers/tooltip-provider";
import { AuthProvider } from "../lib/providers/auth-provider";
import "../style/style.scss";

import nextI18nextConfig from "../next-i18next.config";
import { appWithTranslation } from "next-i18next";


function App({ Component, pageProps }) {
  const Layout = Component.Layout ? Component.Layout : Fragment;
  const layoutProps = Component.LayoutProps ? Component.LayoutProps : {};

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (pageProps?.analyticConfig) {
        sessionStorage.setItem('analyticConfig', JSON.stringify(pageProps.analyticConfig));
      } else {
        sessionStorage.removeItem('analyticConfig');
      }
    }
  }, [pageProps.analyticConfig]);

  return (
    <>
      <DefaultSeo
        titleTemplate="%s"
        defaultTitle="Cửa hàng"
        openGraph={{
          type: 'website',
          locale: 'vi_VN',
          site_name: '3mShop',
        }}
      />
      {
        pageProps.seo &&
        <NextSeo {...pageProps.seo} />
      }
      <TooltipProvider>
        <ToastProvider>
          <AlertProvider>
            <AuthProvider>
              <Layout {...layoutProps}>
                <Component {...pageProps} />
              </Layout>
            </AuthProvider>
          </AlertProvider>
        </ToastProvider>
      </TooltipProvider>
    </>
  );
}
// export default App;
export default appWithTranslation(App, nextI18nextConfig);