import Link from "next/link";
import { useRouter } from "next/router";
import { AiFillCloseCircle, AiOutlineCloseCircle } from "react-icons/ai";
import {
  FaCommentDots,
  FaHeadset,
  FaHome,
  FaRecordVinyl,
  FaRegAddressBook,
  FaRegUser,
  FaSignOutAlt,
  FaTag,
  FaUtensils,
} from "react-icons/fa";
import { HiOutlineX } from "react-icons/hi";
import { DialogProps } from "../../../components/shared/utilities/dialog/dialog";
import { Slideout } from "../../../components/shared/utilities/dialog/slideout";
import { Button } from "../../../components/shared/utilities/form";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { Footer } from "../../default-layout/components/footer";

interface Propstype extends DialogProps { }
export function Menu({ ...props }: Propstype) {
  const { shop, customer, logoutCustomer, shopCode } = useShopContext();

  const menus: {
    label: string;
    icon: JSX.Element;
    onClick?: Function;
    href?: string;
  }[] = [
      {
        label: "Trang chủ",
        icon: <FaHome />,
        href: `/${shopCode}`,
      },
      {
        label: "Khuyến mãi",
        icon: <FaTag />,
        href: `/${shopCode}/promotion`,
      },
      {
        label: "Lịch sử đặt hàng",
        icon: <FaUtensils />,
        href: `/${shopCode}/order`,
      },
      ...(shop.config.collaborator
        ? customer?.isCollaborator
          ? [
            {
              label: "Thông tin CTV",
              icon: <FaRegAddressBook />,
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
        label: "Vòng quay may mắn",
        icon: <FaRecordVinyl />,
        href: `/${shopCode}/wheel`,
      },

      {
        label: "Thông tin tài khoản",
        icon: <FaRegUser />,
        href: `/${shopCode}/customer`,
      },
      {
        label: "Bạn cần hỗ trợ",
        icon: <FaHeadset />,
        href: `/${shopCode}/support`,
      },
      {
        label: "Chat với chúng tôi",
        icon: <FaCommentDots />,
        href: `/${shopCode}/chat`,
      },

      {
        label: "Đăng xuất",
        icon: <FaSignOutAlt />,
        onClick: () => {
          props.onClose();
          logoutCustomer();
        },
      },
    ];

  return (
    <>
      <Slideout {...props} placement="right" hasCloseButton={false}>
        <div className="flex flex-col h-full px-6 py-4 ml-auto overflow-y-auto text-white bg-primary max-w-2xs sm:max-w-xs">
          <div className="flex items-end justify-end h-14">
            {/* <span className="text-lg font-bold text-gray-100">Menu</span> */}
            <button
              className="w-10 h-10 px-0 text-2xl text-gray-100 transform translate-x-3 btn hover:text-white hover:bg-primary-dark"
              onClick={() => props.onClose()}
            >
              <i className="bg-transparent">
                <AiFillCloseCircle />
              </i>
            </button>
          </div>
          <div className="flex-1">
            {menus.map((menu, index) => (
              <Button
                hoverWhite
                className={`py-2 sm:py-3 h-auto w-full text-gray-50 justify-start px-2 my-1  rounded-none `}
                iconClassName={"mr-2.5"}
                key={index}
                href={menu.href}
                icon={menu.icon}
                text={menu.label}
                onClick={() => {
                  if (menu.href) {
                    props.onClose();
                  } else {
                    menu.onClick();
                  }
                }}
              />
            ))}
          </div>
          <Footer className="text-xs text-center text-gray-100 sm:text-base" />
        </div>
      </Slideout>
    </>
  );
}
