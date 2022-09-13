import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useRef } from "react";
import { AiOutlineGooglePlus } from "react-icons/ai";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { RiFacebookFill, RiInstagramFill, RiTwitterFill } from "react-icons/ri";
import { Img } from "../../../components/shared/utilities/misc";
import { Dropdown } from "../../../components/shared/utilities/popover/dropdown";

export function Footer({ tabs, backgroundFooterColor, ...props }) {
  const router = useRouter();
  const subTabRef = useRef<HTMLDivElement>();
  const footerMenus = useMemo(
    () => [
      {
        title: "3M Marketing",
        menus: tabs.map((x) => ({
          name: x.title,
          href: x.href,
          subTabs: x.subTabs,
        })),
      },
      {
        title: "Thông tin chính sách",
        menus: [
          {
            name: "Chính sách bán hàng",
            href:
              "https://docs.google.com/document/d/19B9Ero_HESTo6BP5B8VGhQhIhXPSBk28uCo0bPwfhnY/edit?usp=sharing",
          },
          {
            name: "Chính sách bảo mật",
            href:
              "https://docs.google.com/document/d/1Z3Zpam8qOxbXasTPrVmk4TW2_yGTf1k6f0g3o6kiX-Y/edit?usp=sharing",
          },
          {
            name: "Điều khoản dịch vụ",
            href:
              "https://docs.google.com/document/d/1hTCH7ehZKQvfefmhOo-W-uUOPMmhmVKMgnsAnzHDX2s/edit?usp=sharing",
          },
          {
            name: "Quy trình giải quyết tranh chấp",
            href:
              "https://docs.google.com/document/d/1hTCH7ehZKQvfefmhOo-W-uUOPMmhmVKMgnsAnzHDX2s/edit?usp=sharing",
          },
        ],
      },
      {
        title: "Liên hệ",
        menus: [
          { name: "0315772049", icon: <FaPhoneAlt />, href: "tel:0315772049" },
          {
            name: "marketing3m@gmail.com",
            icon: <FaEnvelope />,
            href: "mailto:marketing3m@gmail.com",
          },
          {
            name: "225 Nguyễn Xí, Phường 13, Quận Bình Thạnh, Tp Hồ Chí Minh",
            icon: <FaMapMarkerAlt />,
            href:
              'http://maps.google.com/?q=225 Nguyễn Xí, Phường 13, Quận Bình Thạnh, Tp Hồ Chí Minh"',
          },
        ],
      },
    ],
    [tabs]
  );
  return (
    <footer
      className={`w-full flex relative justify-end text-white text-sm lg:mt-28 xl:mt-40 2xl:mt-48 -mt-5 pt-10 pb-20 bg-primary`}
    >
      <img
        className={`absolute top-0 left-0 right-0 z-0 w-full h-auto origin-top transform -translate-y-3/4`}
        style={{
          backgroundColor: backgroundFooterColor ? backgroundFooterColor : "rgb(255,255,255)",
        }}
        src="/assets/img/landing/bg-footer.svg"
      />
      <div className="relative z-10 w-full transform bg-primary">
        <div className="grid flex-wrap justify-between grid-cols-2 px-4 mb-0 md:grid-cols-3 gap-y-6 gap-x-4 xl:flex lg:gap-10 main-container lg:px-0">
          <div className="flex flex-col items-center col-span-2 md:col-span-1 md:items-start whitespace-nowrap">
            <Link href="/">
              <a className="flex items-center">
                <Img className="w-24" contain src="/assets/img/landing/footer-logo.png" />
              </a>
            </Link>
          </div>
          {footerMenus.map((footerMenu, index) => (
            <div
              key={footerMenu.title}
              className={`flex flex-col gap-y-2 ${
                index == footerMenus.length - 1 ? "col-span-2 md:col-span-1 xl:w-1/5" : "col-span-1"
              }`}
            >
              <span className="h-auto text-base font-semibold lg:mb-3 lg:h-auto">
                {footerMenu.title}
              </span>
              {footerMenu.menus.map((menu, idx) =>
                menu.subTabs ? (
                  <div key={idx}>
                    <div
                      ref={subTabRef}
                      onClick={(e) => e.preventDefault()}
                      className={`flex items-start hover:underline cursor-pointer`}
                    >
                      {menu.icon && <i className="mt-1 mr-2 text-white">{menu.icon}</i>}
                      <span>{menu.name}</span>
                    </div>
                    <Dropdown reference={subTabRef} placement="bottom-start">
                      {menu.subTabs.map((sub, index) => {
                        return (
                          <Dropdown.Item
                            text={sub.title}
                            key={index}
                            className={`px-8 py-2 font-normal hover:bg-gray-100 text-xs ${
                              index !== 0 ? "border-t border-gray-200" : ""
                            }`}
                            href={sub.href}
                            onClick={() => router.push(sub.href)}
                            asyncLoading={false}
                          />
                        );
                      })}
                    </Dropdown>
                  </div>
                ) : (
                  <a
                    href={menu.href}
                    key={idx}
                    className={`flex items-start hover:underline`}
                    {...([
                      "Chính sách bán hàng",
                      "Chính sách bảo mật",
                      "Điều khoản dịch vụ",
                      "Quy trình giải quyết tranh chấp",
                    ].includes(menu.name) && { target: "_blank" })}
                  >
                    {menu.icon && <i className="mt-1 mr-2 text-white">{menu.icon}</i>}
                    <span>{menu.name}</span>
                  </a>
                )
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 col-span-2 gap-4 text-white xl:flex xl:w-3/12 lg:flex-col">
            <div className="">
              <div className="text-base font-semibold">Kết nối với chúng tôi</div>
              <div className="flex gap-3 mt-3 xl:mt-4 md:gap-4">
                {conectSocials.map((item, index) => (
                  <i className="text-xl text-white cursor-pointer" key={index}>
                    {item.icon}
                  </i>
                ))}
              </div>
            </div>
            <div className="">
              <div className="text-base font-semibold">Tải ngay ứng dụng</div>
              <div className="flex flex-col gap-2 mt-3 xl:mt-4 lg:flex-row">
                <Link href="https://play.google.com/store/apps/details?id=mcom.app.shop3m">
                  <a target="_blank">
                    <img
                      src="/assets/img/googleplay.png"
                      className="object-contain cursor-pointer w-28"
                    />
                  </a>
                </Link>
                <Link href="https://apps.apple.com/vn/app/som-kinh-doanh-tinh-g%E1%BB%8Dn/id1577028537?l=vi">
                  <a target="_blank">
                    <img
                      src="/assets/img/appstore.png"
                      className="object-contain cursor-pointer w-28"
                    ></img>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const conectSocials = [
  { icon: <RiFacebookFill /> },
  { icon: <AiOutlineGooglePlus /> },
  { icon: <RiTwitterFill /> },
  { icon: <RiInstagramFill /> },
];
