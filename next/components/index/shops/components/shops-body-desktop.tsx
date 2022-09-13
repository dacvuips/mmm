import React, { useEffect, useMemo, useRef, useState } from "react";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { LocationToolbar } from "../../../shared/location/location-toolbar";
import { Button, Select } from "../../../shared/utilities/form";
import { Img, NotFound, Scrollbar, Spinner } from "../../../shared/utilities/misc";
import { useShopsContext } from "../providers/shops-provider";
import { ShopsBannerDesktop } from "./shops-banner-desktop";
import Link from "next/link";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useRouter } from "next/router";
import { RiStore3Line } from "react-icons/ri";
import { ShopCardDesktop } from "./shop-card";
import { SearchDesktop } from "../../search/components/search-desktop";
import { AddressService } from "../../../../lib/repo/address.repo";
import { AiOutlineCaretDown } from "react-icons/ai";
import { Dropdown } from "../../../shared/utilities/popover/dropdown";
import { useToast } from "../../../../lib/providers/toast-provider";
import { LoadingObserver } from "./shops-body";

type Props = {};

export function ShopsBodyDesktop({ }: Props) {
  return (
    <div className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 main-container">
      <div className="mt-20">
        <div className="sticky left-0 top-28">
          <SearchDesktop />
          <CategoryHead />
          <ShopsBannerDesktop />
        </div>
      </div>
      <div className="mt-20">
        <LocationToolbar />
        <div className="my-5">
          <NearbyShopListDesktop />
        </div>
        <div className="my-5">
          <ShopListDesktop />
        </div>
      </div>
    </div>
  );
}

function CategoryHead() {
  const { categories, selectedCategory, setSelectedCategory } = useShopsContext();

  if (!categories) return <Spinner />;
  return (
    <div className="flex flex-row flex-wrap items-center gap-2 my-5">
      {categories.map(
        (item, index) =>
          item.shopCount !== 0 && (
            <Button
              key={index}
              outline
              hoverDarken={item.id !== selectedCategory}
              className={`font-medium ${item.id === selectedCategory
                ? "bg-white text-primary hover:text-primary-dark"
                : "text-white  border-white hover:bg-white"
                }`}
              text={item.name}
              onClick={() => {
                setSelectedCategory(item.id);
              }}
            />
          )
      )}
    </div>
  );
}

function NearbyShopListDesktop() {
  const { nearByShops } = useShopsContext();
  const screenSm = useScreen("sm");
  const router = useRouter();

  if (!nearByShops || !nearByShops.length) return <></>;
  return (
    <div className="p-4 mt-2 bg-white rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-2 text-lg font-semibold">
        <span>Ưu đãi gần tôi</span>
        {/* <span className="text-sm font-medium">{nearByShops.length} cửa hàng</span> */}
        <Button className="h-8 px-0 font-normal text-primary" href={`/goodwill`} text="Xem tất cả" />
      </div>
      <div className="grid grid-cols-3 gap-5">
        {nearByShops.map(
          (shop, index) =>
            shop.shopCount !== 0 && (
              <div className={``} key={index}>
                <Link href={`/${shop.shopCode}`}>
                  <a className="flex flex-col min-h-full bg-white group">
                    <Img
                      ratio169
                      src={shop.coverImage}
                      className="object-cover w-auto border border-gray-100 rounded-md shadow-sm"
                    />
                    <div className="flex flex-col min-h-18">
                      <div className="mt-3 mb-1 font-medium break-words text-ellipsis-1 group-hover:text-primary">
                        {shop.name}
                      </div>
                      <div className="text-gray-400 text-ellipsis-1 ">{shop.fullAddress}</div>
                      <div className="flex mt-auto">
                        <span className="flex items-center">
                          <i className="mr-1 mb-0.5 text-primary">
                            <FaMapMarkerAlt />
                          </i>
                          <span className="text-primary">{shop.distance}km</span>
                        </span>
                        {/* {shop.rating > 0 && (
                          <span className="flex items-center ml-auto">
                            <i className="mr-1 mb-0.5 text-yellow-300">
                              <FaStar />
                            </i>
                            {shop.rating}
                          </span>
                        )} */}
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            )
        )}
      </div>
    </div>
  );
}

function ShopListDesktop() {
  const {
    listMode,
    shops,
    isLoadingMore,
    loadMore,
    noLoadMore,
    openAddress,
    setDistrictId,
    sortByTotalOrder,
    setSortByTotalOrder,
  } = useShopsContext();
  const router = useRouter();
  const { userLocation, openLocation } = useLocation();
  const [selectedFilter, setSelectedFilter] = useState("near-me");
  const [provinceId, setProvinceId] = useState("70");
  // const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState([]);
  const toast = useToast();

  const dataDistrict = useMemo(async () => {
    return await AddressService.getDistricts(provinceId).then((res) => {
      let data = res.map((x) => ({ value: x.id, label: x.district }));
      setDistrict([{ value: "", label: "Tất cả" }, ...data]);
    });
  }, [provinceId]);
  useEffect(() => {
    setProvinceId(provinceId);
  }, [provinceId]);

  useEffect(() => {
    dataDistrict;
  }, [provinceId]);

  return (
    <div className="p-4 mt-2 bg-white rounded-md">
      <div className="flex items-center justify-between text-lg font-semibold">
        <span>Danh sách cửa hàng</span>

        <div className="w-1/3">
          <Select
            options={[
              { value: "70", label: "Hồ Chí Minh" },
              { value: "10", label: "Hà Nội" },
            ]}
            value={provinceId}
            className="border-0 outline-none"
            onChange={(value) => {
              setProvinceId(value);
            }}
          />
        </div>
      </div>
      <div className="flex flex-row items-start justify-between my-3">
        <div className="flex flex-wrap gap-3">
          {BTN_OPTIONS_FILTER.map((item, index) => (
            <Button
              textPrimary={item.value != sortByTotalOrder}
              text={item.label}
              className={`${sortByTotalOrder == item.value ? "text-white bg-primary hover:text-white" : ""
                }`}
              hoverWhite={sortByTotalOrder == item.value}
              outline
              key={index}
              onClick={() => {
                setSortByTotalOrder(item.value);
              }}
            />
          ))}
        </div>
        <div className="w-1/3">
          <Select
            value={""}
            options={district}
            onChange={(e) => {
              setDistrictId(e as string);
              console.log(" districtId : ", e);
            }}
            placeholder="Chọn khu vực"
          />
        </div>
      </div>

      {!shops ? (
        <Spinner />
      ) : (
        <div>
          {!shops.length && (
            <NotFound icon={<RiStore3Line />} text="Không tìm thấy cửa hàng gần bạn">
              {!userLocation?.lat && (
                <Button
                  className="mt-2"
                  primary
                  text="Chọn địa chỉ"
                  icon={<FaMapMarkerAlt />}
                  onClick={() => openLocation()}
                />
              )}
            </NotFound>
          )}
          {shops.map((shop, index) => (
            <ShopCardDesktop
              key={shop.id}
              shop={shop}
              className={`${index < shops.length - 1 ? "border-b" : "pb-0"}`}
            />
          ))}

          <div className="flex justify-center mt-8">
            {!!shops?.length && !noLoadMore && (
              <Button
                outline
                primary
                isLoading={isLoadingMore}
                text={"Xem thêm"}
                className="px-8 border-0"
                onClick={loadMore}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const BTN_OPTIONS_FILTER: Option[] = [
  // { value: "ordered", label: "Đã đặt" },
  // { value: "favorite", label: "Được yêu thích" },
  { value: false, label: "Gần tôi" },
  { value: true, label: "Nổi bật" },
];
