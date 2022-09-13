import { FaStar, FaShoppingBasket, FaMapMarkerAlt } from "react-icons/fa";
import { formatDate } from "../../../lib/helpers/parser";
import { useDevice } from "../../../lib/hooks/useDevice";
import { useScreen } from "../../../lib/hooks/useScreen";

interface Props extends ReactProps {
  rating: number | string;
  numRated?: number | string;
  ratingTime?: string;
  soldQty?: number;
  distance?: number;
}
export function ProductRating({ className = "", distance, ...props }: Props) {
  const { isDesktop } = useDevice();
  const screenLg = useScreen("lg");

  return (
    <div
      className={`flex items-center gap-4 text-gray-600 ${screenLg ? "text-lg" : "text-sm"
        } ${className}`}
    >
      {distance >= 0 && (
        <div className="flex items-center">
          <i className={`${isDesktop ? "text-primary" : "text-gray-800 font-semibold"} mb-0.5`}>
            <FaMapMarkerAlt />
          </i>
          <span className={`${isDesktop ? "text-primary" : "text-gray-800 font-semibold"} ml-2`}>
            {distance} km
          </span>
        </div>
      )}
      {props.rating > 0 && (
        <div className="flex items-center">
          <i className={`text-yellow-300 mb-0.5`}>
            <FaStar />
          </i>
          <span className="ml-1">{props.rating}</span>
          {props.numRated && <span className="text-gray-400"> ({props.numRated}+)</span>}
          {props.ratingTime && (
            <span className="font-light text-gray-400">
              | {formatDate(props.ratingTime, "dd-MM-yyyy HH:mm")}
            </span>
          )}
        </div>
      )}

      {!!props.soldQty && (
        <div className="flex items-center">
          <i className={`text-slate mb-0.5`}>
            <FaShoppingBasket />
          </i>
          <span className="ml-1 text-sm">
            {(props.soldQty >= 1000 && "999+ đã bán") ||
              (props.soldQty >= 100 && "99+ đã bán") ||
              (props.soldQty >= 10 && "9+ đã bán") ||
              props.soldQty}
          </span>
        </div>
      )}
    </div>
  );
}
