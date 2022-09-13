import { useEffect, useState } from "react";
import { DefaultFooterDesktop } from "../../../layouts/defalut-footer-desktop";
import { useDevice } from "../../../lib/hooks/useDevice";
import { useScreen } from "../../../lib/hooks/useScreen";
import { LocationProvider } from "../../../lib/providers/location-provider";
import { Spinner } from "../../shared/utilities/misc";
import { ShopsBody } from "./components/shops-body";
import { ShopsBodyDesktop } from "./components/shops-body-desktop";
import { ShopsFooter } from "./components/shops-footer";
import { ShopsHeader } from "./components/shops-header";
import { ShopsHeaderDesktop } from "./components/shops-header-desktop";
import { ShopsProvider, useShopsContext } from "./providers/shops-provider";

export function ShopsPage() {
  const screenLg = useScreen("lg");
  const { isMobile } = useDevice();
  return (
    <LocationProvider>
      <ShopsProvider>
        {screenLg ? <ShopsComponentDesktop /> : isMobile && <ShopsComponent />}
      </ShopsProvider>
    </LocationProvider>
  );
}
function ShopsComponent() {
  const { products } = useShopsContext();
  if (products === undefined) return <Spinner />;
  return (
    <div className="relative flex flex-col min-h-screen text-gray-700 bg-gray-200">
      <div className="relative flex flex-col w-full max-w-lg min-h-screen mx-auto bg-gray-100 shadow-md">
        <ShopsHeader />
        <ShopsBody />
        <ShopsFooter />
      </div>
    </div>
  );
}

function ShopsComponentDesktop() {
  const [bgPage, setBgPage] = useState("");
  useEffect(() => {
    setBgPage("/assets/img/bg-home.png");
  }, []);
  return (
    <>
      <ShopsHeaderDesktop />
      <div
        style={{
          backgroundImage: `url("${bgPage}")`,
          backgroundColor: `rgba(0,0,0,0.9)`,
        }}
        className="min-h-screen bg-fixed bg-no-repeat bg-cover"
      >
        <ShopsBodyDesktop />
      </div>
      <DefaultFooterDesktop />
    </>
  );
}
