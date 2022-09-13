import formatDistanceToNow from "date-fns/formatDistanceToNow";
import vi from "date-fns/locale/vi";
import { cloneDeep } from "lodash";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import { GiBoxUnpacking } from "react-icons/gi";

import { Button } from "../../../components/shared/utilities/form/button";
import { Img, StatusLabel } from "../../../components/shared/utilities/misc";
import { Popover } from "../../../components/shared/utilities/popover/popover";
import { StaffPermission } from "../../../lib/constants/staff-scopes.const";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useAuth } from "../../../lib/providers/auth-provider";
import { SUBSCRIPTION_PLANS } from "../../../lib/repo/shop-subscription.repo";
import {
  IconCollaborator,
  IconComment,
  IconCustomer,
  IconDiscount,
  IconDriver,
  IconEmployee,
  IconHome,
  IconLuckyWheel,
  IconMenu,
  IconNews,
  IconOrder,
  IconPayment,
  IconPosition,
  IconReport,
  IconSelection,
  IconSettings,
  IconTable,
  IconTrigger,
} from "../../../lib/svg";
import { Footer } from "../../admin-layout/components/footer";

interface PropsType extends ReactProps { }
export default function Sidebar({ ...props }: PropsType) {
  const { member, staffPermission } = useAuth();
  const router = useRouter();
  const screen2xl = useScreen("xxl");
  const refPopover = useRef();
  const [menus, setMenus] = useState<Menus[]>(SIDEBAR_MENUS);


  useEffect(() => {
    const openMenu = localStorage.getItem("open-shop-menu");
    const openMenuTitles: string[] = openMenu ? JSON.parse(openMenu) : [];
    let menus = cloneDeep(SIDEBAR_MENUS);
    menus.forEach((menu) => {
      let flag = false;
      menu.subMenus.forEach((subMenu) => {
        if (router.pathname.includes(subMenu.path)) flag = true;
        if (subMenu.permission && !staffPermission(subMenu.permission as any))
          subMenu.hidden = true;
      });
      if (menu.subMenus.length == menu.subMenus.filter((x) => x.hidden).length) menu.hidden = true;
      if (flag || openMenuTitles.includes(menu.title)) menu.isOpen = true;
    });

    setMenus([...menus]);
  }, []);

  return (
    <div
      className={`${screen2xl ? "w-60" : "w-24"
        } bg-white sticky top-0 shadow flex flex-col z-10 shrink-0`}
      style={{ height: "calc(100vh)" }}
    >
      <div className={`${screen2xl ? "" : "justify-around"} flex items-center p-4 h-18 `}>
        <Img className={"xxl:w-12 min-w-12 "} contain src="/assets/img/logo-som.png" />
        {screen2xl && (
          <div className="flex-1 pl-3 text-lg font-bold leading-tight text-brand text-ellipsis-2">
            KINH DOANH TINH GỌN
          </div>
        )}
      </div>
      <div className="flex-1 pt-1 border-t border-b border-gray-300">
        <Scrollbars
          hideTracksWhenNotNeeded={true}
          autoHideTimeout={0}
          autoHideDuration={300}
          autoHide
        >
          {menus.map((menu, index) => (
            <div className="mb-2" key={index}>
              {menu.subMenus
                .filter((x) => !x.hidden)
                ?.map((submenu, index) => {
                  const isActive =
                    router.pathname == submenu?.path ||
                    router.pathname.startsWith(`${submenu.path}/`);
                  // const ref = useRef<HTMLButtonElement>();
                  // useEffect(() => {
                  //   if (isActive && ref.current) {
                  //     ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  //   }
                  // }, [ref.current, isActive]);

                  return (
                    <Button
                      // innerRef={ref}
                      key={index}
                      primary={isActive}
                      className={`${screen2xl
                        ? "justify-start pl-6"
                        : "flex justify-around pl-0 items-center pr-2"
                        } h-9 text-sm mt-0.5 w-full pr-0 rounded-none ${isActive ? "" : "hover:bg-primary-light"
                        }`}
                      iconClassName="transform scale-75 mr-0 mt-0.5 flex-center"
                      icon={submenu?.icon}
                      href={submenu?.path}
                      text={screen2xl ? submenu?.title : null}
                      tooltip={screen2xl ? null : submenu?.title}
                    />
                  );
                })}
              {/* </Accordion> */}
            </div>
          ))}
        </Scrollbars>
      </div>
      <div className="p-3">
        <div className="flex-col items-stretch border border-gray-300 rounded flex-center">
          {screen2xl && (
            <div className="flex items-center justify-between w-full px-3 py-2 border-b border-gray-300 rounded-t">
              <StatusLabel
                options={SUBSCRIPTION_PLANS}
                value={member.subscription.plan}
                type="text"
                extraClassName="pl-0"
              />
              <div className="text-xs text-gray-600">
                còn{" "}
                {formatDistanceToNow(new Date(member.subscription?.expiredAt), {
                  locale: vi,
                  addSuffix: true,
                })}
              </div>
            </div>
          )}
          <Button
            small
            gray
            // hoverDarken
            className="w-full rounded-t-none"
            text={
              screen2xl
                ? member.subscription.plan == "FREE"
                  ? "Đăng ký gói tính phí"
                  : "Gia hạn gói dịch vụ"
                : null
            }
            href={"/shop/settings/subscription"}
            innerRef={refPopover}
            icon={!screen2xl && <GiBoxUnpacking />}
            iconClassName="text-2xl flex-center text-primary"
          />
          {!screen2xl && (
            <Popover placement="right-start" trigger="hover" reference={refPopover}>
              <div className="flex flex-col items-start justify-between w-full px-3 py-2 border-gray-300 ">
                <div className="py-2 border-b border-dashed">
                  {member.subscription.plan == "FREE"
                    ? "Đăng ký gói tính phí"
                    : "Gia hạn gói dịch vụ"}
                </div>

                <StatusLabel
                  options={SUBSCRIPTION_PLANS}
                  value={member.subscription.plan}
                  type="text"
                  extraClassName="pl-0"
                />
                <div className="text-xs text-gray-600">
                  còn{" "}
                  {formatDistanceToNow(new Date(member.subscription?.expiredAt), {
                    locale: vi,
                    addSuffix: true,
                  })}
                </div>
              </div>
            </Popover>
          )}
        </div>
      </div>
      <Footer className="text-gray-600" />
    </div>
  );
}
export interface SubMenus {
  title: string;
  path: string;
  hidden?: boolean;
  icon: JSX.Element;
  permission?: StaffPermission;
}
export interface Menus {
  title: string;
  isOpen?: boolean;
  hidden?: boolean;
  subMenus?: SubMenus[];
}

export const SIDEBAR_MENUS: Menus[] = [
  {
    title: "Quản trị",
    subMenus: [
      {
        title: "Tổng quan",
        path: "/shop/dashboard",
        icon: <IconHome />,
        permission: "OVERVIEW",
      },
      {
        title: "Đơn hàng",
        path: "/shop/orders",
        icon: <IconOrder />,
        permission: "READ_ORDERS",
      },
      {
        title: "Cửa hàng",
        path: "/shop/branches",
        icon: <IconPosition />,
        permission: "READ_BRANCHES",
      },
      {
        title: "Bàn",
        path: "/shop/tables",
        icon: <IconTable />,
        permission: "READ_TABLES",
      },
      {
        title: "Món",
        path: "/shop/products",
        icon: <IconMenu />,
        permission: "READ_PRODUCTS",
      },
      {
        title: "Topping",
        path: "/shop/toppings",
        icon: <IconSelection />,
        permission: "READ_TOPPINGS",
      },
      {
        title: "Khuyến mãi",
        path: "/shop/vouchers",
        icon: <IconDiscount />,
        permission: "READ_VOUCHERS",
      },
      {
        title: "Khách hàng",
        path: "/shop/customers",
        icon: <IconCustomer />,
        permission: "READ_CUSTOMERS",
      },
      {
        title: "Tài xế nội bộ",
        path: "/shop/drivers",
        icon: <IconDriver />,
        permission: "READ_DRIVERS",
      },
      {
        title: "Nhân viên",
        path: "/shop/staffs",
        icon: <IconEmployee />,
        permission: "READ_STAFFS",
      },
      {
        title: "Cộng tác viên",
        path: "/shop/collaborators",
        icon: <IconCollaborator />,
        permission: "READ_COLLABORATORS",
      },
      {
        title: "Bình luận",
        path: "/shop/comments",
        icon: <IconComment />,
        permission: "READ_COMMENTS",
      },
      {
        title: "Vòng quay",
        path: "/shop/lucky-wheels",
        icon: <IconLuckyWheel />,
        permission: "READ_WHEELS",
      },
      {
        title: "Báo cáo",
        path: "/shop/report",
        icon: <IconReport />,
        permission: "READ_REPORTS",
      },
      {
        title: "Lịch sử thanh toán",
        path: "/shop/payment-history",
        icon: <IconPayment />,
        permission: "READ_PAYMENT_HISTORY",
      },
      {
        title: "Market place",
        path: "/shop/market-places",
        icon: <IconNews />,
        permission: "READ_FEEDS",
      },
      // {
      //   title: "Đăng bán",
      //   path: "/shop/sale-feeds",
      //   icon: <IconSales />,
      // },
      // {
      //   title: "Tin tức",
      //   path: "/shop/news",
      //   icon: <IconNews />,
      // },
      // {
      //   title: "Video",
      //   path: "/shop/videos",
      //   icon: <IconPlay />,
      // },
      {
        title: "Marketing",
        path: "/shop/triggers",
        icon: <IconTrigger />,
        permission: "READ_TRIGGERS",
      },
      {
        title: "Cấu hình cửa hàng",
        path: "/shop/settings",
        icon: <IconSettings />,
        permission: "READ_SETTINGS",
      },
    ],
  },
];
