import React from "react";
import { NotFound } from "../../shared/utilities/misc";
import { TabGroup } from "../../shared/utilities/tab/tab-group";
import { ShopPostPage } from "../post/post-page";
import { ShopSaleFeedsPage } from "../sale-feeds/sale-feeds-page";
import { ShopVideosPage } from "../videos/videos-page";

type Props = {};

export function MarketPlacesPage({ }: Props) {
  return (
    <div className="">
      <TabGroup
        name={"market place"}
        flex={false}
        tabsClassName="shrink-0 grow-0 border-b border-gray-200"
        className=" px-3 bg-white"
        tabClassName="h-16 py-4 text-base px-4"
        bodyClassName="py-6 flex-1"
        activeClassName="bg-white"
        autoHeight={true}
      >
        <TabGroup.Tab label="Đăng bán">
          <ShopSaleFeedsPage />
        </TabGroup.Tab>
        <TabGroup.Tab label="Tin tức">
          <ShopPostPage />
        </TabGroup.Tab>
        <TabGroup.Tab label="Video">
          <ShopVideosPage />
        </TabGroup.Tab>
        <TabGroup.Tab label="Liên hệ">
          <NotFound text="Trang đang được phát triển" />
        </TabGroup.Tab>
      </TabGroup>
    </div>
  );
}
