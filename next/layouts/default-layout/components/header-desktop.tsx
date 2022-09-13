import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { AiOutlineCaretDown } from "react-icons/ai";
import { FaRegAddressBook } from "react-icons/fa";
import { HiDocumentText, HiOutlineLogout, HiUser, HiUsers } from "react-icons/hi";
import { IoLogOut } from "react-icons/io5";
import { Button } from "../../../components/shared/utilities/form";
import { Img } from "../../../components/shared/utilities/misc";
import { Dropdown } from "../../../components/shared/utilities/popover/dropdown";
import { useShopContext } from "../../../lib/providers/shop-provider";

interface Propstype extends ReactProps { }
export function HeaderDesktop({ ...props }: Propstype) {
  const { shop, customer, logoutCustomer, shopCode, setOpenLoginDialog } = useShopContext();
  const refDropdown = useRef(null);
  const router = useRouter();

  const MENU_SHOP: {
    label: string;
    onClick?: Function;
    href?: string;
  }[] = [
      {
        href: `/${shopCode}`,
        label: "Trang chủ",
      },

      ...(customer
        ? [
          {
            href: `/${shopCode}/promotion`,
            label: "Khuyến mãi",
          },
        ]
        : []),

      ...(customer
        ? [
          {
            href: `/${shopCode}/order`,
            label: "Lịch sử đặt hàng",
          },
        ]
        : []),
      {
        href: `/${shopCode}/support`,
        label: "Bạn cần hỗ trợ",
      },
      {
        href: ``,
        label: "Chat với chúng tôi",
        onClick: () => {
          const el: HTMLElement = document.querySelector("#chat-widget");
          if (el) {
            el.click();
            setTimeout(() => {
              const typeEl: HTMLElement = document.querySelector("#chat-widget-type-input");
              if (typeEl) {
                typeEl.focus();
              }
            }, 100);
          }
        },
      },
      ...(customer
        ? [
          {
            href: `/${shopCode}/wheel`,
            label: "Vòng quay may mắn",
          },
        ]
        : []),
    ];

  const MENU_DROPDOWN: {
    label: string;
    icon: JSX.Element;
    onClick?: Function;
    href?: string;
  }[] = [
      ...(shop.config.collaborator
        ? customer?.isCollaborator
          ? [
            {
              label: "Thông tin CTV",
              icon: <HiUsers />,
              href: `/${shopCode}/collaborator/info`,
            },
          ]
          : [
            {
              label: "Đăng ký CTV",
              icon: <FaRegAddressBook />,
              href: `/${shopCode}/collaborator/register`,
            },
          ]
        : []),
      ,
      {
        label: "Thông tin tài khoản",
        href: `/${shopCode}/customer`,
        icon: <HiUser />,
      },
      {
        label: "Lịch sử đặt hàng",
        href: `/${shopCode}/order`,
        icon: <HiDocumentText />,
      },

      {
        label: "Đăng xuất",
        icon: <IoLogOut />,
        onClick: () => {
          logoutCustomer();
        },
      },
    ];
  return (
    <div className="fixed top-0 left-0 right-0 bg-primary z-100">
      <div className="main-container">
        <div className="flex flex-row items-center justify-between h-18">
          <Link href={`/`}>
            <a className="bg-white rounded-md">
              <Img
                src={`${shop.shopLogo ? shop.shopLogo : "/assets/img/logo-som-icon.png"}`}
                className="object-cover w-12 rounded-md"
                alt="logo"
              />
            </a>
          </Link>
          <div className="flex flex-row items-center justify-between">
            {MENU_SHOP.map((item, index) => {
              return (
                <Button
                  text={item.label}
                  href={item.href}
                  className="font-medium text-center hover:bg-primary-dark text-[14px]"
                  key={index}
                  onClick={() => {
                    if (!item.href) {
                      item?.onClick();
                    }
                  }}
                  textWhite
                />
              );
            })}
            {customer ? (
              <>
                <div className="flex flex-row items-center justify-start">
                  <Img
                    src={`${customer?.avatar ? customer?.avatar : "/assets/default/avatar.png"} `}
                    className="object-cover w-8 rounded-full"
                  />
                  <Button
                    text={customer?.name}
                    icon={<AiOutlineCaretDown />}
                    iconPosition="end"
                    iconClassName="text-white"
                    className="pl-1"
                    innerRef={refDropdown}
                    textWhite
                  />
                </div>
                <Dropdown
                  placement="bottom-end"
                  className=""
                  trigger="click"
                  reference={refDropdown}
                  arrow
                >
                  {MENU_DROPDOWN.map((item, index) => (
                    <Dropdown.Item
                      key={index}
                      className="flex justify-start text-primary hover:bg-gray-50"
                      onClick={() => {
                        if (!item.href) {
                          item?.onClick();
                        }
                      }}
                      href={item.href}
                      icon={item.icon}
                      iconPosition="start"
                      iconClassName="text-[20px] text-primary "
                      text={item.label}
                    />
                  ))}
                </Dropdown>
              </>
            ) : customer === null ? (
              <Button
                text="Đăng nhập"
                className="text-white whitespace-nowrap text-[14px]"
                hoverWhite
                outline
                onClick={() => {
                  setOpenLoginDialog(true)
                }}
              // href={{ pathname: location.pathname, query: { login: true } }}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
