import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";

import { Input } from "../../../components/shared/utilities/form";
import { useInterval } from "../../../lib/hooks/useInterval";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useDefaultLayoutContext } from "../provider/default-layout-provider";

type Props = {};
var didScroll;
var lastScrollTop = 0;


export function Search({ }: Props) {
  const router = useRouter();
  const { shopCode } = useShopContext();
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const [y, setY] = useState(window.scrollY);
  const { showAndHiddenSearch } = useDefaultLayoutContext();

  const handleSearch = (value: string) => {
    setSearch(value);
    router.push({
      pathname: `/${shopCode}`,
      query: {
        ...(value?.trim().length ? { keyword: value } : {}),
      },
    });
  };






  return (
    <div className={`bg-primary z-0  w-screen mx-auto transition-all duration-300 ease-in-out overflow-hidden px-3 
      ${showAndHiddenSearch ? "max-h-14 pb-3" : "max-h-0"}`} id="search-header" ref={searchRef}>
      <Input
        clearable
        debounce={500}
        prefix={<FiSearch />}
        prefixClassName="text-2xl text-gray-400 "
        placeholder="Tìm kiếm sản phẩm gì ?"
        className="w-full px-3 py-2 text-gray-700 rounded-xl bg-gray-50 "
        value={search}
        onChange={(value) => {
          // setSearch(value);
          handleSearch(value);
        }}
      />
    </div>
  );
}
