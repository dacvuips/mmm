import React from "react";
import { parseNumber } from "../../../lib/helpers/parser";
import { useScreen } from "../../../lib/hooks/useScreen";
interface Propstype extends ReactProps {
  price: string | number;
  downPrice?: string | number;
  saleRate?: string | number;
}

export function ProductPrice({ className = "", downPrice, saleRate, ...props }: Propstype) {
  const screenLg = useScreen("lg");
  return (
    <div className={`flex items-center ${screenLg ? "text-lg" : "text-sm"}  ${className}`}>
      <span className={`text-primary font-medium`}>{parseNumber(props.price, true)}</span>
      {(downPrice && (
        <span className={`line-through ml-2 text-gray-400`}>{parseNumber(downPrice, true)}</span>
      )) ||
        ""}
      {saleRate > 0 && (
        <div className="px-1 py-0.5 ml-2 text-xs font-bold text-white rounded bg-danger">
          {-saleRate}%
        </div>
      )}
    </div>
  );
}
