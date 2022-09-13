import Link from "next/link";
import React from "react";
import { Img } from "../../../components/shared/utilities/misc";

export function MobileScreen() {
  return (
    <div className="flex flex-col items-center gap-2 py-4 bg-white">
      <Img src="/assets/img/logo-som.png" className="w-2/5" contain></Img>
      <div className="p-4 m-6 text-center border-2 ">
        <span>
          Nền tảng dashboard không hỗ trợ trên di động, vui lòng đăng nhập với tài khoản đã đăng ký
          trên máy tính
        </span>
        <br />
        <span>
          Để có thể nhận đơn hàng và xử lý trên hệ thống có thể tải app 3M đăng nhập với tài khoản
          đã đăng ký
        </span>
      </div>
      <Link href="https://apps.apple.com/us/app/som-kinh-doanh-tinh-g%E1%BB%8Dn/id1577028537">
        <a>
          <img src="/assets/img/appstore.png" className="object-contain w-44"></img>
        </a>
      </Link>
      <Link href="https://play.google.com/store/apps/details?id=mcom.app.shop3m">
        <a>
          <img src="/assets/img/googleplay.png" className="object-contain w-44"></img>
        </a>
      </Link>
    </div>
  );
}
