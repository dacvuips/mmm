import { FaMapMarkerAlt } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useLocation } from "../../../lib/providers/location-provider";
import { useShopContext } from "../../../lib/providers/shop-provider";

export function LocationToolbar() {
  const screenLg = useScreen("lg");
  const { userLocation, openLocation } = useLocation();
  const { shopCode } = useShopContext();

  if (userLocation === undefined) return <></>;
  return (
    <>
      <div
        className={`${!shopCode ? "rounded-lg" : "rounded-b-lg"} ${shopCode ? "" : ""
          } px-4 py-2.5 shadow-sm  bg-white cursor-pointer `}
        onClick={() => openLocation()}
      >
        {userLocation ? (
          <div className={`${shopCode && !screenLg ? "" : "flex-row-reverse"} flex `}>
            <span className="flex-1 text-left text-ellipsis-1">
              <span className="font-semibold text-gray-600">Giao đến: </span>
              <span className="font-medium text-gray-600">{userLocation.fullAddress}</span>
            </span>
            <i className={`${shopCode ? "" : "mr-2"} text-xl text-primary`}>
              {<HiLocationMarker />}
            </i>
          </div>
        ) : (
          <div className="flex items-center">
            <i className="pr-2 text-xl text-primary">{<HiLocationMarker />}</i>
            <span className="font-semibold text-gray-600">Vui lòng nhập địa chỉ của bạn</span>
          </div>
        )}
      </div>
    </>
  );
}
