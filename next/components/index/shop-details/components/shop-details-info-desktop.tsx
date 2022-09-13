import React, { useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { FaCircle } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { useShopContext } from "../../../../lib/providers/shop-provider";

type Props = {};

export function ShopDetailsInfoDesktop({ }: Props) {
  const { shop, isOpenShop, selectedBranch } = useShopContext();
  const [timeOpen, setTimeOpen] = useState("");

  let now = new Date();
  let currentDay = now.getDay();

  const handleCheckTimeOpenShop = () => {
    if (selectedBranch) {
      if (selectedBranch.operatingTimes.length > 0) {
        const day = selectedBranch.operatingTimes.find((time) => time.day == currentDay);
        if (day?.timeFrames?.length) {
          setTimeOpen(
            day.timeFrames.map((timeFrame) => `${timeFrame[0]} - ${timeFrame[1]}`).join(", ")
          );
        }
      }
    }
  };

  useEffect(() => {
    handleCheckTimeOpenShop();
  }, [selectedBranch]);

  return (
    <div className="my-5">
      <div className="text-[22px] font-semibold text-primary">{shop.shopName}</div>
      <div className="mt-3 text-sm text-gray-700">
        {shop?.address} - {shop?.ward} - {shop?.district} - {shop?.province}{" "}
      </div>
      <ShowRatings numberRatings={shop?.config.rating} />
      <div className="flex flex-row items-center justify-start mt-3">
        <div className="flex flex-row items-center">
          <span>
            <FaCircle className={`${isOpenShop ? "text-green-500" : "text-danger"}`} />
          </span>
          <span className={`${isOpenShop ? " text-green-500" : "text-danger"} ml-2`}>
            {isOpenShop ? "Mở cửa" : "Đóng cửa"}
          </span>
        </div>
        <div className="flex flex-row items-center ml-4">
          <span>
            <FiClock />
          </span>
          <span className="ml-3">{timeOpen}</span>
        </div>
      </div>
    </div>
  );
}

function ShowRatings({ numberRatings, ...props }) {
  const showStar = () => {
    const i = [];
    for (let index = 0; index < 5; index++) {
      i.push(
        <AiFillStar
          key={index}
          className={`${index + 1 <= numberRatings ? "text-yellow-400 " : "text-gray-400"
            } text-[20px]`}
        />
      );
    }
    return i;
  };

  return <div className="flex flex-row items-center mt-3">{showStar()}</div>;
}
