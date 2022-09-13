import Link from "next/link";
import React from "react";
import { FaCircle } from "react-icons/fa";
import { Img } from "../../../shared/utilities/misc";

type Props = {};

export function MarketPlaceNewPost({ }: Props) {
  return (
    <div>
      <div className="my-3 text-xl font-semibold">Các tin tức mới nhất</div>
      <div className="flex flex-col ">
        {[1, 2, 3, 4].map((item, index) => {
          return (
            <Link href="">
              <a>
                <div className="flex flex-row items-start my-3" key={index}>
                  <Img
                    src="https://photo-baomoi.bmcdn.me/w700_r16x9_sm/2022_05_04_94_42498495/f051c6f63eb4d7ea8ea5.jpg"
                    className="object-cover rounded-md shadow w-80"
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-ellipsis-2">
                      Cryptocurrency Coin98 to be listed in world's second biggest
                    </div>
                    <div className="text-sm text-gray-400 text-ellipsis-3">
                      Coin98 is set to become the second Vietnam blockchain app after Axie Infinity
                      to have its ... Coin98 is set to become the second Vietnam blockchain app
                      after Axie Infinity to have its
                    </div>
                    <div className="flex flex-row items-center text-gray-400 test-sm">
                      Admin <FaCircle className="mx-2 text-[9px]" /> 7 hours ago
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
