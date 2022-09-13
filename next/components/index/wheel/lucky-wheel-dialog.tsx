import React, { useEffect, useState } from "react";
import { DialogGiftResult } from "./dialog-gift-result";
import { WheelProvider, useWheelContext, WheelContext } from "./providers/wheel-provider";
import { useRouter } from "next/router";
import { useRef } from "react";
import { HiOutlineX } from "react-icons/hi";
import { useWheelsContext } from "../wheels/providers/wheels-provider";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { Button } from "../../shared/utilities/form/button";
import { DialogProps, Dialog } from "../../shared/utilities/dialog/dialog";
import { Spinner } from "../../shared/utilities/misc";

export const LuckyWheel = (props) => {
  const { luckyWheel } = useWheelsContext();
  const { setShowGift, showGift, playLuckyWheel, gift, loading } = useWheelContext();
  const { shopCode } = useShopContext();
  const router = useRouter();

  return (
    //background
    <div
      className=" v-scrollbar"
      style={{
        maxHeight: "calc(100vh - 110px)",
      }}
    >
      <div
        className={`relative flex flex-col items-center bg-gray-light`}
        style={{
          backgroundImage: `url("${luckyWheel.backgroundImage ? luckyWheel.backgroundImage : ""}")`,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundColor: `"${luckyWheel.backgroundColor || ""}"`,
        }}
      >
        {/* banner */}
        <div className={`w-full ${!luckyWheel.bannerImage ? "min-h-4xs" : ""}`}>
          <img
            src={luckyWheel.bannerImage}
            alt=""
            className="w-full h-auto object-contain flex justify-center self-center"
          />
        </div>
        <div className="lucky-wheel-container">
          <img
            id="wheel"
            src={luckyWheel.wheelImage}
            alt=""
            className="lucky-wheel object-contain"
          />
          <img
            src={luckyWheel.pinImage}
            alt=""
            className="object-contain w-full h-full absolute top-0 left-0 self-center"
          />
        </div>

        <div
          className={`relative w-full min-h-4xs pb-10`}
          // style={}
        >
          <Button
            text={luckyWheel.btnTitle || "Bắt đầu quay"}
            isLoading={loading}
            className="absolute transform left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full sm:text-base text-sm"
            primary
            large
            style={{ backgroundColor: luckyWheel.buttonColor || "" }}
            onClick={() => playLuckyWheel()}
          />
        </div>

        {gift ? (
          <DialogGiftResult
            isOpen={showGift}
            onClose={() => {
              setShowGift(false);
              router.replace(`/${shopCode}/wheel/history`);
            }}
            gift={gift}
          />
        ) : (
          ""
        )}
      </div>
      <img
        src={luckyWheel.footerImage}
        alt=""
        className="w-full h-auto object-contain flex justify-center self-center"
      />
    </div>
  );
};
interface PropsType extends DialogProps {
  code: string;
}
export function LuckyWheelDialog({ code, ...props }: PropsType) {
  const { luckyWheel } = useWheelsContext();
  if (!luckyWheel)
    return (
      <Spinner
        style={{
          height: "calc(100vh - 110px)",
        }}
      />
    );
  return (
    <Dialog {...props} title={luckyWheel.title}>
      <WheelProvider code={code}>
        <Dialog.Body>
          <LuckyWheel />
        </Dialog.Body>
      </WheelProvider>
    </Dialog>
  );
}
