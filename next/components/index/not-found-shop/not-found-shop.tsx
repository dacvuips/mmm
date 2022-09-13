import React from "react";
import { Img } from "../../shared/utilities/misc";

export function NotFoundShop() {
  return (
    <div className="flex flex-col items-center h-screen px-4 pt-24 text-center bg-white min-h-lg">
      <Img src="/assets/img/closed.png" className="w-24 pb-4" />
      Không tìm thấy cửa hàng. Vui lòng kiểm tra lại đường dẫn.
    </div>
  );
}
