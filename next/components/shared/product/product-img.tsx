import React from "react";
import { ImgProps, Img } from "../utilities/misc";
import { ProductLabel } from "../../../lib/repo/product-label.repo";
interface Propstype extends ImgProps {
  saleRate: number;
  tag?: ProductLabel[];
}

export function ProductImg({ saleRate, className = "", ...props }: Propstype) {
  return (
    <div className="relative overflow-hidden">
      <Img
        src={props.src}
        className={`border shadow-sm bg-white rounded ${className}`}
        {...props}
      />
      {!!saleRate && (
        <div
          className={`absolute bg-danger text-white font-bold rounded-r-full py-1 text-xs px-2 top-2 left-0`}
        >
          -{saleRate}%
        </div>
      )}
    </div>
  );
}
