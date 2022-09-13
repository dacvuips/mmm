import Link from "next/link";
import React from "react";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { PublicShop } from "../../../../lib/repo/shop.repo";
import { ProductRating } from "../../../shared/product/product-rating";
import { Button } from "../../../shared/utilities/form";
import { Img } from "../../../shared/utilities/misc";
interface Props extends ReactProps {
  shop: PublicShop;
}
export function ShopCard({ shop, className = "", ...props }: Props) {
  return (
    <Link href={`/${shop.shopCode}`}>
      <a className={`flex py-3 ${className}`}>
        <Img src={shop?.coverImage} className="w-20 rounded-md sm:w-24" />
        <div className="flex flex-col flex-1 pt-0.5 pl-3">
          <div className="font-semibold text-ellipsis-2 group-hover:text-primary">{shop.name}</div>
          <div className="my-1 text-gray-400 text-ellipsis-2 ">{shop.fullAddress}</div>
          <ProductRating rating={shop.rating} distance={shop.distance} />
          {/* <span className="cursor-pointer text-primary" onClick={() => {}}>
            Xem thêm chi nhánh
          </span> */}
        </div>
      </a>
    </Link>
  );
}

export function ShopCardDesktop({ shop, className = "", ...props }: Props) {
  return (
    <Link href={`/${shop.shopCode}`}>
      <a className={`flex py-3 group ${className}`}>
        <Img
          ratio169
          src={shop?.coverImage}
          className="object-cover w-24 border border-gray-100 rounded-md grow-0 shrink-0 sm:w-40"
        />
        <div className="flex flex-col flex-1 pt-0.5 pl-3">
          <div className="font-medium text-ellipsis-2 group-hover:text-primary">{shop.name}</div>
          <div className="my-1 text-gray-400 text-ellipsis-2 ">{shop.fullAddress}</div>
          <ProductRating rating={shop.rating} distance={shop.distance} />
        </div>
      </a>
    </Link>
  );
}
