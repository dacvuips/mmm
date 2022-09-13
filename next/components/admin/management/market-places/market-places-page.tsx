import React, { useState } from "react";

import { Card } from "../../../shared/utilities/misc";
import { TabGroup } from "../../../shared/utilities/tab/tab-group";
import { ShopSaleFeedsTab } from "./components/shop-sale-feeds-tab";

type Props = {};

export function MarketPlacesPage({ }: Props) {
  return (
    <Card>
      <TabGroup
        name={"market place"}
        flex={false}
        tabsClassName="shrink-0 grow-0 border-b border-gray-200"
        className=" bg-white"
        tabClassName="h-16 py-4 text-base px-4"
        bodyClassName="py-6 flex-1"
        activeClassName="bg-white"
        autoHeight={true}
      >
        <TabGroup.Tab label="Đăng bán">
          <ShopSaleFeedsTab />
        </TabGroup.Tab>
      </TabGroup>
    </Card>
  );
}
