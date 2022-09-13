import Link from "next/link";
import { useRouter } from "next/router";
import { AiFillCloseCircle, AiOutlineCloseCircle, AiOutlineFileText } from "react-icons/ai";
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
import { HiOutlinePencilAlt, HiOutlineX } from "react-icons/hi";
import { useToast } from "../../../../lib/providers/toast-provider";
import { DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Slideout } from "../../../shared/utilities/dialog/slideout";
import { Button } from "../../../shared/utilities/form";

interface Propstype extends DialogProps {}
export function ShopsMenu({ ...props }: Propstype) {
  const toast = useToast();
  const menus: {
    label: string;
    icon?: JSX.Element;
    onClick?: Function;
    href?: string;
  }[] = [
    {
      label: "Market Place",
      icon: <FaHome />,
      href: ``,
      onClick: () => {
        toast.info("Tính năng đang phát triển");
      },
    },
    {
      label: "Tin tức",
      icon: <AiOutlineFileText />,
      href: `/3MMarketing/news`,
    },
    {
      label: "Đăng ký cửa hàng",
      icon: <HiOutlinePencilAlt />,
      href: "/shop/register",
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
                className={`py-2 sm:py-3 h-auto w-full text-gray-50 justify-start px-2 my-1 rounded-none `}
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
        </div>
      </Slideout>
    </>
  );
}
