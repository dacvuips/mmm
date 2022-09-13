import { cloneDeep } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import { IoNewspaperOutline } from "react-icons/io5";
import {
  RiBillLine,
  RiContactsBookLine,
  RiEdit2Line,
  RiFileList3Line,
  RiImageLine,
  RiNotificationBadgeLine,
  RiSettings3Line,
  RiStore2Line,
  RiStore3Line,
  RiTeamLine,
  RiTicket2Line,
  RiUser2Line,
  RiUser5Line,
} from "react-icons/ri";

import { Button } from "../../../components/shared/utilities/form/button";
import { Accordion } from "../../../components/shared/utilities/misc";
import { AdminPermission } from "../../../lib/constants/admin-scopes.const";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useAdminLayoutContext } from "../providers/admin-layout-provider";
import { Footer } from "./footer";

interface PropsType extends ReactProps { }
export default function Sidebar({ ...props }: PropsType) {
  const [menus, setMenus] = useState<Menus[]>(SIDEBAR_MENUS);
  const router = useRouter();
  const screen2xl = useScreen("xxl");
  const { pendingRegistrations, pendingWithdrawRequest } = useAdminLayoutContext();
  const { adminPermission } = useAuth();

  const toggleMenu = (index) => {
    menus[index].isOpen = !menus[index].isOpen;
    setMenus([...menus]);
  };

  // useEffect(() => {
  //   menus.forEach((menu) => {
  //     if (router.pathname.includes(menu.path)) menu.isOpen = true;
  //   });
  //   setMenus([...menus]);
  // }, []);
  useEffect(() => {
    const openMenu = localStorage.getItem("open-menu");
    const openMenuTitles: string[] = openMenu ? JSON.parse(openMenu) : [];
    let menus = cloneDeep(SIDEBAR_MENUS);
    menus.forEach((menu) => {
      let flag = false;
      menu.submenus.forEach((subMenu) => {
        if (router.pathname.includes(subMenu.path)) flag = true;
        if (subMenu.permission && !adminPermission(subMenu.permission as any))
          subMenu.hidden = true;
      });
      if (menu.submenus.length == menu.submenus.filter((x) => x.hidden).length) menu.hidden = true;
      if (flag || openMenuTitles.includes(menu.title)) menu.isOpen = true;
    });
    setMenus([...menus]);
  }, []);

  return (
    <div
      className={`${screen2xl ? "w-60" : "w-24"} fixed flex flex-col bg-white shadow top-14 `}
      style={{ height: "calc(100vh - 56px)" }}
    >
      <div className="flex-1 pt-6 pb-3 v-scrollbar">
        <Scrollbars
          hideTracksWhenNotNeeded={true}
          autoHideTimeout={0}
          autoHideDuration={300}
          autoHide
        >
          {menus.map((menu, index) => (
            <div className="mb-2" key={index}>
              <div
                className={`${screen2xl ? "px-4" : "px-2"} flex  py-2 group`}
                onClick={() => toggleMenu(index)}
              >
                {/* <i className="w-5 h-5 text-lg text-primary group-hover:text-primary-dark">
                  {menu.icon}
                </i> */}
                <span className="flex-1 px-2 font-semibold text-gray-700 uppercase">
                  {menu.title}
                </span>
                {/* <i
                  className={`text-lg text-gray-700 group-hover:text-primary self-center transform transition ${
                    menu.isOpen ? "rotate-180" : ""
                  }`}
                >
                  <RiArrowDownSLine />
                </i> */}
              </div>
              <Accordion isOpen={true}>
                {menu.submenus
                  .filter((x) => !x.hidden)
                  .map((submenu, index) => (
                    <Button
                      key={index}
                      primary={
                        router.pathname == submenu.path ||
                        router.pathname.includes(`${submenu.path}/`)
                      }
                      className={`w-full pl-8 pr-0 justify-start font-normal rounded-none ${router.pathname.includes(submenu.path) ? "" : "hover:bg-gray-100"
                        }`}
                      icon={submenu.icon}
                      href={submenu.path}
                      text={
                        screen2xl && (
                          <div className="flex items-center">
                            <span>{submenu.title}</span>
                            {!!pendingRegistrations && submenu.showRegistrations && (
                              <div
                                className={`ml-1.5 bg-warning text-white rounded-full px-1 min-w-5 h-5 flex-center text-sm font-bold`}
                              >
                                {pendingRegistrations}
                              </div>
                            )}
                            {!!pendingWithdrawRequest && submenu.showWithdrawRequests && (
                              <div
                                className={`ml-1.5 bg-warning text-white rounded-full px-1 min-w-5 h-5 flex-center text-sm font-bold`}
                              >
                                {pendingWithdrawRequest}
                              </div>
                            )}
                          </div>
                        )
                      }
                      tooltip={screen2xl ? null : submenu.title}
                    ></Button>
                  ))}
              </Accordion>
            </div>
          ))}
        </Scrollbars>
      </div>
      <Footer />
    </div>
  );
}
export interface SubMenus {
  title: string;
  path: string;
  hidden?: boolean;
  icon: JSX.Element;
  permission?: AdminPermission;
  showRegistrations?: boolean;
  showWithdrawRequests?: boolean;
}
export interface Menus {
  title: string;
  isOpen?: boolean;
  hidden?: boolean;
  submenus?: SubMenus[];
}

export const SIDEBAR_MENUS: Menus[] = [
  {
    title: "Quản trị",
    submenus: [
      // {
      //   title: "Bảng điều khiển",
      //   path: "/admin/dashboard",
      //   icon: <RiDashboard2Line />,
      // },
      {
        title: "Tài khoản",
        path: "/admin/users",
        icon: <RiUser2Line />,
        permission: "READ_USERS",
      },
      {
        title: "Cửa hàng",
        path: "/admin/members",
        icon: <RiStore2Line />,
        permission: "READ_MEMBERS",
      },
      {
        title: "Khách hàng",
        path: "/admin/customers",
        icon: <RiUser5Line />,
        permission: "READ_CUSTOMERS",
      },
      {
        title: "Đơn hàng",
        path: "/admin/orders",
        icon: <RiBillLine />,
        permission: "READ_ORDERS",
      },
      {
        title: "Cộng tác viên",
        path: "/admin/collaborators",
        icon: <RiTeamLine />,
        permission: "READ_COLLABORATORS",
      },
      {
        title: "Khuyến mãi",
        path: "/admin/vouchers",
        icon: <RiTicket2Line />,
        permission: "READ_VOUCHERS",
      },
      {
        title: "Danh mục cửa hàng",
        path: "/admin/shop-categories",
        icon: <RiStore3Line />,
        permission: "READ_SHOP_CATEGORIES",
      },
      {
        title: "Banner cửa hàng",
        path: "/admin/banners",
        icon: <RiImageLine />,
        permission: "READ_BANNERS",
      },
      {
        title: "Đăng ký cửa hàng",
        path: "/admin/registrations",
        icon: <RiEdit2Line />,
        showRegistrations: true,
        permission: "READ_REGISTRATIONS",
      },
      {
        title: "Yêu cầu rút tiền",
        path: "/admin/withdraw-requests",
        icon: <RiBillLine />,
        showWithdrawRequests: true,
        permission: "READ_WITHDRAW_REQUESTS",
      },
      {
        title: "Báo cáo",
        path: "/admin/report",
        icon: <RiFileList3Line />,
        permission: "READ_REPORTS",
      },
      // {
      //   title: "Đợt chi",
      //   path: "/admin/disburse-payouts",
      //   icon: <RiMoneyDollarBoxLine />,
      // },
      // {
      //   title: "Email",
      //   path: "/admin/emails",
      //   icon: <RiMailLine />,
      // },
      {
        title: "Cấu hình",
        path: "/admin/settings",
        icon: <RiSettings3Line />,
        permission: "READ_GENERAL_CONFIG",
      },
      {
        title: "Market place",
        path: "/admin/market-places",
        icon: <IoNewspaperOutline />,
        permission: "READ_FEEDS",
      },
    ],
  },
  {
    title: "Truyền thông",
    submenus: [
      {
        title: "Tin tức",
        path: "/admin/posts",
        icon: <RiFileList3Line />,
        permission: "READ_POSTS",
      },
      {
        title: "Khách hàng cần tư vấn",
        path: "/admin/customers-contact",
        icon: <RiContactsBookLine />,
        permission: "READ_CUSTOMERS_CONTACT",
      },
      {
        title: "Thông báo",
        path: "/admin/notifications",
        icon: <RiNotificationBadgeLine />,
        permission: "READ_NOTIFICATIONS",
      },
      // {
      //   title: "Gói dịch vụ",
      //   path: "/admin/subscription-package",
      //   icon: <RiFundsLine />,
      // },
    ],
  },
];
