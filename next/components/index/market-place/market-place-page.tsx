import Link from "next/link";
import React, { useRef, useState } from "react";
import { FiMoreHorizontal, FiSearch } from "react-icons/fi";
import { DefaultFooterDesktop } from "../../../layouts/defalut-footer-desktop";
import { formatDate } from "../../../lib/helpers/parser";
import { Button, Input } from "../../shared/utilities/form";
import { Img } from "../../shared/utilities/misc";
import { Dropdown } from "../../shared/utilities/popover/dropdown";
import { ShopsHeaderDesktop } from "../shops/components/shops-header-desktop";
import { MarketPlacePost } from "./components/market-place-post";
import { MarketPlacePostNew } from "./components/market-place-post-new";
import { MarketPlacePostSale } from "./components/market-place-post-sale";
import { MarketPlaceVideo } from "./components/market-place-video";

type Props = {};

export function MarketPlacePage({ }: Props) {
  const [selectedTab, setSelectedTab] = useState("all");
  const refMore = useRef(null);
  return (
    <>
      <ShopsHeaderDesktop />
      <div className="min-h-screen mt-20 bg-slate-light">
        <div className="main-container">
          <div className="my-5 text-lg font-semibold text-center capitalize">market place</div>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center justify-between gap-5">
              {OPTIONS_DEMO_TAB.slice(0, 5).map((tab, i) => (
                <Button
                  text={tab.label}
                  className={`${tab.value == selectedTab ? "bg-primary-dark text-white " : ""
                    } capitalize`}
                  outline
                  hoverWhite={tab.value == selectedTab}
                  key={i}
                  onClick={() => setSelectedTab(tab.value)}
                />
              ))}
              {OPTIONS_DEMO_TAB.length > 5 && (
                <>
                  <Button
                    icon={<FiMoreHorizontal />}
                    className="text-primary text-3xl "
                    onClick={() => { }}
                    innerRef={refMore}
                  />
                  <Dropdown reference={refMore}>
                    {OPTIONS_DEMO_TAB.slice(5, OPTIONS_DEMO_TAB.length).map((tab, i) => (
                      <Dropdown.Item key={i}>
                        <Button
                          text={tab.label}
                          className="px-0"
                          onClick={() => {
                            console.log(tab.label);
                          }}
                        />
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </>
              )}
            </div>
            <SearchingMarketPlace />
          </div>
        </div>
        <MarketPlacePostSale />
        <MarketPlacePostNew />
        <MarketPlaceVideo />
      </div>
      <DefaultFooterDesktop />
    </>
  );
}

function SearchingMarketPlace() {
  const [searchText, setSearchText] = useState("");
  return (
    <div>
      <Input
        className=""
        placeholder="Tìm kiếm bài viết ?"
        prefix={
          <>
            <FiSearch />
          </>
        }
        prefixClassName="text-2xl"
        value={searchText}
        onChange={setSearchText}
        clearable
      />
    </div>
  );
}

export const OPTIONS_DEMO_TAB: Option[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Android",
    value: "android",
  },
  {
    label: "Cricket",
    value: "cricket",
  },
  {
    label: "iOS",
    value: "iOS",
  },
  {
    label: "Google",
    value: "google",
  },
  {
    label: "Nano Technology",
    value: "nano-technology",
  },
  {
    label: "Metal Health",
    value: "metal-health",
  },
];
