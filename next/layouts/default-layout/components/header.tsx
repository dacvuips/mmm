import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaBell, FaEllipsisV, FaSearch } from "react-icons/fa";
import { Button } from "../../../components/shared/utilities/form";
import { Img } from "../../../components/shared/utilities/misc";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { NotificationService } from "../../../lib/repo/notification.repo";
import { Menu } from "./menu";
import { PageHeader } from "../../../components/shared/default-layout/page-header";
import { HiMenu, HiMenuAlt3, HiOutlineChevronLeft } from "react-icons/hi";
import { useScreen } from "../../../lib/hooks/useScreen";
import { Search } from "./search";
import { FiChevronLeft } from "react-icons/fi";
import { AiOutlineLeft } from "react-icons/ai";

export interface HeaderPropsType extends ReactProps {
  title?: string;
  search?: "invisible" | "show" | "hide";
  backgroundColor?: "white" | "primary";
  showAvatar?: boolean;
  code?: string;
  name?: string;
  isCheckBackOrder?: boolean;
}
export function Header({ name, isCheckBackOrder, ...props }: HeaderPropsType) {
  const { customer, shop, shopCode, notificationCount, setOpenLoginDialog } = useShopContext();
  const [openMenu, setOpenMenu] = useState(false);
  const screenSm = useScreen("sm");

  return (
    <>
      {name ? (
        <PageHeaderLayoutMobile title={name} isCheckBackOrder={isCheckBackOrder} />
      ) : (
        <header className={`sticky w-full  top-0 z-100  text-white h-28`}>
          <div
            className={
              "sticky top-0 flex items-center z-100 bg-primary  justify-between w-screen pl-3 pr-1 mx-auto h-14 "
            }
          >
            <Link href={`/${shopCode}`}>
              <a className="flex items-center">
                {shop && (
                  <>
                    <Img
                      src={shop.shopLogo}
                      className="w-8 bg-white border border-gray-100 rounded-full shadow-sm xs:w-9"
                    />
                  </>
                )}
              </a>
            </Link>
            <div className="flex-1 px-2 text-sm font-semibold text-ellipsis-1 sm:text-base">
              {shop?.shopName}
            </div>
            <div className="flex items-center">
              {customer ? (
                <>
                  {/* <Button
                    className="px-2.5 text-white"
                    href={`/${shopCode}/search`}
                    icon={<FaSearch />}
                    hoverWhite
                  /> */}
                  <Button
                    className="px-2.5 text-white border-none"
                    href={`/${shopCode}/notification`}
                    icon={<FaBell />}
                    hoverWhite
                  >
                    {!!notificationCount && (
                      <div className="absolute h-5 px-1 text-xs font-semibold rounded-full min-w-5 left-5 -bottom-0.5 bg-accent text-white flex-center">
                        {notificationCount}
                      </div>
                    )}
                  </Button>
                  <Button
                    className="px-2.5 text-white border-none"
                    onClick={() => setOpenMenu(true)}
                    icon={<HiMenu />}
                    hoverWhite
                    iconClassName="text-2xl"
                  />
                </>
              ) : customer === null ? (
                <Button
                  text="Đăng nhập"
                  className="whitespace-nowrap btn-sm"
                  textWhite
                  onClick={() => setOpenLoginDialog(true)}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="relative">
            <Search />
          </div>

          <Menu isOpen={openMenu} onClose={() => setOpenMenu(false)} />
        </header>
      )}
    </>
  );
}

export function PageHeaderLayoutMobile({ title, isCheckBackOrder, ...props }) {
  const { shopCode } = useShopContext();
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <header className="sticky top-0 w-full z-100">
      <div className="flex items-center justify-between w-full p-2 pl-3 pr-1 mx-auto bg-primary-dark h-14">
        <Button
          icon={<HiOutlineChevronLeft />}
          iconClassName="text-2xl text-white "
          className="w-10 px-0"
          tooltip={`${isCheckBackOrder ? "Lịch sử đơn hàng" : "Trang chủ"}`}
          href={`${isCheckBackOrder ? `/${shopCode}/order` : `/${shopCode}`} `}
        />
        <div className="flex-1 text-lg font-semibold text-center text-white">{title}</div>
        <Button
          className="px-2.5 text-white border-none"
          onClick={() => setOpenMenu(true)}
          icon={<HiMenuAlt3 />}
          iconClassName="text-2xl"
          hoverPrimary
        />
      </div>
      <Menu isOpen={openMenu} onClose={() => setOpenMenu(false)} />
    </header>
  );
}
