import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { RiCloseFill, RiMenuFill } from "react-icons/ri";
import { Slideout } from "../../../components/shared/utilities/dialog/slideout";
import { Button } from "../../../components/shared/utilities/form/button";
import { Dropdown } from "../../../components/shared/utilities/popover/dropdown";
import { useScreen } from "../../../lib/hooks/useScreen";

interface PropsType extends ReactProps {
  tabs: { title: string; href?: string; subTabs?: { title: string; href: string }[] }[];
  isHeaderTransparent?: boolean;
}

export function Header({ tabs, isHeaderTransparent, ...props }: PropsType) {
  const [selected, setSelected] = useState(0);
  const inkbarRef = useRef<HTMLDivElement>();
  const subTabRef = useRef<HTMLDivElement>();
  const router = useRouter();
  const md = useScreen("md");
  const lg = useScreen("lg");
  const [openMenu, setOpenMenu] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const isScrolled = useMemo(() => scrollTop > 100, [scrollTop]);
  const onScroll = (e) => {
    setScrollTop(e.target.documentElement.scrollTop);
  };

  useEffect(() => {
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(false);
    tabs.forEach((menu, index) => {
      if (
        menu.subTabs &&
        ["/3MMarketing/website", "/3MMarketing/app", "/3MMarketing/product-service"].includes(
          router.pathname
        )
      ) {
        setSelected(index);
      }
      if (router.pathname.includes(menu.href)) {
        setSelected(index);
      }
    });
  }, [router.pathname]);

  useEffect(() => {
    if (inkbarRef.current && tabs[selected] && lg) {
      const el = document.getElementById("landing-tab-" + selected);
      if (el) {
        inkbarRef.current.style.width = el.offsetWidth + "px";
        inkbarRef.current.style.left = el.offsetLeft + "px";
      }
    }
  }, [inkbarRef.current, tabs, selected, lg]);

  return (
    <header
      className={`fixed flex gap-4 justify-between items-center top-0 left-0 z-50 border-b w-full lg:px-2 2xl:px-14 ${
        md ? "h-24" : "h-14"
      } ${isScrolled ? "border-gray-100" : "border-transparent shadow-none"} transition-all`}
      style={{
        backgroundColor: isHeaderTransparent
          ? `rgba(255, 255, 255, ${scrollTop / 100})`
          : "rgba(255, 255, 255, 1)",
      }}
      id="navBar"
    >
      <div className="flex items-center w-full">
        <Link href="/3MMarketing">
          <a
            className={`flex items-center ${
              lg ? "h-full px-6 py-3" : md ? "h-14 px-6" : "h-9 px-3"
            } text-xl font-bold text-primary`}
          >
            <img
              className="object-contain w-auto h-full"
              src="/assets/img/landing/logo-landing.png"
            />
          </a>
        </Link>
        <div className="relative ml-auto mr-0">
          {lg ? (
            <>
              <ul className="flex items-center text-lg uppercase ">
                {tabs.map((item, index: number) => (
                  <li
                    key={index}
                    id={"landing-tab-" + index}
                    className={`text-center ${
                      index === selected ? " text-primary" : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    {item.subTabs ? (
                      <>
                        <div
                          className="py-4 cursor-pointer lg:px-2 xl:px-4"
                          ref={subTabRef}
                          onClick={(e) => e.preventDefault()}
                        >
                          {item.title}
                        </div>
                        <Dropdown reference={subTabRef} placement="bottom-start">
                          {item.subTabs.map((sub, index) => {
                            return (
                              <Dropdown.Item
                                text={sub.title}
                                key={index}
                                className={`px-12 py-2 font-normal hover:bg-gray-100 ${
                                  index !== 0 ? "border-t border-gray-200" : ""
                                }`}
                                href={sub.href}
                                onClick={() => router.push(sub.href)}
                                asyncLoading={false}
                              />
                            );
                          })}
                        </Dropdown>
                      </>
                    ) : (
                      <Link href={item.href} key={index}>
                        <a
                          {...(item.title === "Hướng dẫn" && { target: "_blank" })}
                          className="block py-4 lg:px-2 xl:px-4"
                        >
                          {item.title}
                        </a>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div
                className={`absolute h-1 transition-all duration-300 ease-in-out bottom-3 bg-primary`}
                ref={inkbarRef}
              ></div>
            </>
          ) : (
            <>
              <Button
                className="px-4"
                iconClassName="text-xl"
                icon={<RiMenuFill />}
                onClick={() => {
                  setOpenMenu(true);
                }}
              />
              <Slideout
                placement="right"
                isOpen={openMenu}
                onClose={() => setOpenMenu(false)}
                width="86%"
                className="mr-0"
                extraDialogClass="mr-0"
              >
                <div className="h-screen bg-white shadow">
                  <div className="flex items-center justify-between pr-6 text-white h-14 bg-primary">
                    <Button
                      className="px-4"
                      iconClassName="text-2xl text-white"
                      icon={<RiCloseFill />}
                      onClick={() => setOpenMenu(false)}
                    />
                    <div className="font-semibold uppercase">Menu</div>
                  </div>
                  <div className="py-2 v-scrollbar" style={{ height: "calc(100% - 56px)" }}>
                    {tabs.map((tab, index) =>
                      tab.subTabs ? (
                        <div key={index} className={`${index === 0 ? "" : "border-t"}`}>
                          <div
                            className={`cursor-pointer justify-between font-semibold text-gray-600 hover:text-primary hover:bg-primary-light flex items-center px-4 py-3 border-l-4 border-transparent
                          `}
                          >
                            <div className="">{tab.title}</div>
                          </div>
                          <div>
                            {tab.subTabs.map((subTab, idx) => (
                              <div
                                key={idx}
                                className={`${index === 0 ? "" : "border-t"} border-gray-100`}
                              >
                                <div
                                  className={`cursor-pointer font-semibold text-gray-600 hover:text-primary border-transparent hover:bg-primary-light flex items-center px-4 pl-12 py-3 border-l-4  ${
                                    subTab.href == router.pathname ? "border-primary" : ""
                                  }`}
                                  onClick={() => router.push(subTab.href)}
                                >
                                  {subTab.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link href={tab.href} key={index}>
                          <a className={`block ${index === 0 ? "" : "border-t"} border-gray-100`}>
                            <div
                              className={`font-semibold text-gray-600 hover:text-primary hover:bg-primary-light flex items-center px-4 py-3 border-l-4 border-transparent ${
                                selected == index ? "border-primary" : ""
                              }`}
                            >
                              {tab.title}
                            </div>
                          </a>
                        </Link>
                      )
                    )}
                    {!lg && (
                      <Link href="https://3mshop.s1.mcom.app/shop/register">
                        <a className="block w-full px-6 py-3 font-semibold text-gray-600 border border-t">
                          Dùng thử
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              </Slideout>
            </>
          )}
        </div>
      </div>
      {lg && (
        <Button
          text="Dùng thử"
          primary
          className="uppercase whitespace-nowrap"
          large
          href="https://3mshop.s1.mcom.app/shop/register"
          targetBlank
        />
      )}
    </header>
  );
}
