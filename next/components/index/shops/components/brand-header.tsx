import { divide } from "lodash";
import Link from "next/link";
import { useState } from "react";
import { FaBell } from "react-icons/fa";
import { HiLocationMarker, HiMenu, HiOutlineChevronRight, HiShoppingCart } from "react-icons/hi";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { LocationToolbar } from "../../../shared/location/location-toolbar";
import { Button } from "../../../shared/utilities/form/button";
import { useShopsContext } from "../providers/shops-provider";
import { Search } from "./shops-header";
import { ShopsMenu } from "./shops-menu";

export function BrandHeader(props) {
  const { listMode } = useShopsContext();
  const toast = useToast();
  const { userLocation, openLocation } = useLocation();
  const [openMenu, setOpenMenu] = useState(false);

  if (userLocation === undefined) return <></>;
  return (
    <>
      <header className={`sticky top-0 max-w-lg w-full z-100 bg-primary`}>
        <div className="flex items-center justify-between w-full max-w-lg px-3 mx-auto text-white h-14">
          <div className="flex items-center justify-start">
            {userLocation ? (
              <div className="flex flex-row items-center">
                <i className="pr-1 text-xl text-white ">{<HiLocationMarker />}</i>
                <div
                  className="w-40 text-sm whitespace-nowrap text-ellipsis-1 sm:w-52 sm:text-lg"
                  onClick={() => openLocation()}
                >
                  {userLocation.fullAddress}
                </div>
                <i className="pl-2 text-white">
                  <HiOutlineChevronRight />
                </i>
              </div>
            ) : (
              <>
                <Link href={`/`}>
                  <a className="mr-3">
                    <img
                      className="w-8 h-auto mx-auto sm:w-10"
                      src="/assets/img/logo-som-icon.png"
                    />
                  </a>
                </Link>
                <span className="flex-1 text-base font-semibold text-center uppercase">
                  {listMode == "products"
                    ? "Món ăn"
                    : listMode == "shops"
                      ? "Cửa hàng"
                      : "Trang chủ"}
                </span>
              </>
            )}
          </div>
          {/* <Button
            href="/shop/register"
            text="Đăng ký cửa hàng"
            className="px-2 font-medium"
            small
            primary
          /> */}
          <div className="flex flex-row items-center justify-end">
            <Button
              icon={<HiMenu />}
              iconClassName="text-2xl text-white"
              className="px-1"
              onClick={() => {
                setOpenMenu(true);
              }}
            />
          </div>
        </div>
        <Search />
        <ShopsMenu isOpen={openMenu} onClose={() => setOpenMenu(false)} />
      </header>
    </>
  );
}
// export function Header(props) {
//   return (
//     <>
//       <header className={`fixed top-0 max-w-lg w-full z-100`}>
//         <div className="flex items-center justify-between w-full h-16 max-w-lg px-4 mx-auto text-white bg-gray-800 shadow">
//           <Link href={`/`}>
//             <a className="">
//               <img className="w-12 h-auto py-6 mx-auto sm:w-14" src="/assets/img/logo-som.png" />
//             </a>
//           </Link>
//           <span className="w-full text-lg font-semibold text-center uppercase">Trang chủ</span>
//           <div className="w-12"></div>
//         </div>
//       </header>
//     </>
//   );
// }
