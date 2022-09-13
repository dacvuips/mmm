import { useState } from "react";
import { AiOutlineLeft } from "react-icons/ai";
import { FaListUl } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { RiLayoutGridFill } from "react-icons/ri";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { Button, Input } from "../../../shared/utilities/form";
import { useMenusDishContext } from "../provider/menus-dish-provider";

export function MenusDishHeader() {
  const { shop } = useShopContext();
  const { setModeShow, modeShow, searchText, handleSearch } = useMenusDishContext();

  return (
    <div className="sticky top-0 flex flex-row items-center justify-between py-3 bg-gray-50 z-100">
      <Button
        tooltip="Quay lại"
        href={`/${shop?.code}/table?table=${sessionStorage.getItem(shop?.code + "-tableCode")}`}
        icon={<AiOutlineLeft />}
        iconClassName="text-xl text-primary"
        className=""
      />
      <Input
        className="flex-1 w-10"
        clearable
        prefix={
          <i className="text-xl">
            <FiSearch />
          </i>
        }
        placeholder={`Tìm kiếm sản phẩm`}
        debounce={500}
        value={searchText}
        onChange={(value) => {
          handleSearch(value);
        }}
      />
      <div className="grid grid-cols-2 gap-2 ml-3">
        <Button
          icon={<RiLayoutGridFill />}
          iconClassName={`${modeShow == "grid" ? "text-primary" : "text-gray-400"} text-2xl`}
          onClick={() => {
            setModeShow(`grid`);
          }}
          className="px-2"
        />
        <Button
          icon={<FaListUl />}
          iconClassName={`${modeShow == "list" ? "text-primary" : "text-gray-400"} text-2xl`}
          onClick={() => {
            setModeShow(`list`);
          }}
          className="px-2"
        />
      </div>
    </div>
  );
}
