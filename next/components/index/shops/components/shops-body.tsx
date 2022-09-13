import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { HiChevronRight, HiOutlineChevronRight } from "react-icons/hi";
import { RiCheckboxBlankCircleFill, RiStore3Line } from "react-icons/ri";
import SwiperCore, { Autoplay, Navigation } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";

import { useOnScreen } from "../../../../lib/hooks/useOnScreen";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useLocation } from "../../../../lib/providers/location-provider";
import { AddressService } from "../../../../lib/repo/address.repo";
import { ProductImg } from "../../../shared/product/product-img";
import { ProductPrice } from "../../../shared/product/product-price";
import { ProductRating } from "../../../shared/product/product-rating";
import { Select } from "../../../shared/utilities/form";
import { Button } from "../../../shared/utilities/form/button";
import { Img, NotFound, Spinner } from "../../../shared/utilities/misc";
import { useShopsContext } from "../providers/shops-provider";
import { ShopsBannersAds } from "./shops-banner-ads";
import { ShopCard } from "./shop-card";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";

SwiperCore.use([Navigation, Autoplay]);

interface PropsType extends ReactProps {}
export function ShopsBody({ ...props }: PropsType) {
  const { listMode } = useShopsContext();

  return (
    <>
      {listMode !== "products" && <CategoryHead />}
      {listMode !== "shops" && <TopBrands />}
      {<TopPromotionList />}
      {<TopBrandsDiscount />}
      {!listMode && <NearbyShopList />}
      <ShopsBannersAds />
      {(!listMode || listMode == "shops") && <ShopList />}
      {(!listMode || listMode == "products") && <ProductList />}
    </>
  );
}

function CategoryHead() {
  const { categories, selectedCategory, setSelectedCategory } = useShopsContext();
  const screenSm = useScreen("sm");
  if (!categories) return <Spinner />;
  return (
    <div className="mt-2 ">
      <Swiper slidesPerView={screenSm ? 5 : 4} className="p-2" grabCursor={true} spaceBetween={5}>
        {categories.map(
          (item, index) =>
            item.shopCount !== 0 && (
              <SwiperSlide key={index}>
                <div
                  className="flex flex-col items-center justify-center text-xs rounded-lg cursor-pointer sm:text-sm group"
                  onClick={() => setSelectedCategory(item.id)}
                >
                  <Img
                    className={`border w-16 sm:w-20 p-1 mb-3 transition rounded-lg ${
                      item.id === selectedCategory
                        ? "border-primary"
                        : "border-gray-200 group-hover:border-gray-400"
                    }`}
                    src={item.image || "/assets/default/default.png"}
                  />
                  <div
                    className={`transition-colors text-ellipsis-2 px-1 text-center ${
                      item.id === selectedCategory
                        ? "text-primary font-bold"
                        : "text-gray-600 group-hover:text-gray-800 font-semibold"
                    }`}
                  >
                    {item.name}
                  </div>
                </div>
              </SwiperSlide>
            )
        )}
      </Swiper>
    </div>
  );
}

function NearbyShopList() {
  const { nearByShops } = useShopsContext();
  const screenSm = useScreen("sm");

  if (!nearByShops || !nearByShops.length) return <></>;
  return (
    <div className="p-4 mt-2 ">
      <div className="flex items-center justify-between mb-2 text-lg font-semibold">
        <div className="flex flex-row items-center justify-start">
          <img src="/assets/img/COUPON.png" className="object-cover w-6 mr-2" />
          <span className="mr-2 text-base font-semibold text-primary sm:text-lg">
            Deal HOT quanh đây
          </span>
          <i className="font-semibold text-primary">
            <HiOutlineChevronRight />
          </i>
        </div>
        {screenSm && (
          <span className="text-sm font-medium text-primary">{nearByShops.length} cửa hàng</span>
        )}
      </div>
      <Swiper slidesPerView={screenSm ? 2.3 : 2} grabCursor={true} spaceBetween={16}>
        {nearByShops.map(
          (shop, index) =>
            shop.shopCount !== 0 && (
              <SwiperSlide className={`cursor-pointer text-sm h-full`} key={index}>
                <ShopCardProduct shop={shop} ratio169={true} />
              </SwiperSlide>
            )
        )}
      </Swiper>
    </div>
  );
}

function TopBrands() {
  const { nearByShops, shops } = useShopsContext();
  const screenSm = useScreen("sm");
  const router = useRouter();

  // if (!shops || !shops.length) return <Spinner />;
  return (
    <div className="p-4 mt-2 ">
      <div className="flex items-center justify-between mb-2 text-lg font-semibold">
        <div className="mr-2 text-base font-semibold text-primary sm:text-lg">
          Top các thương hiệu
        </div>
        <Button
          href={{ pathname: router.pathname, query: { ...router.query, list: "shops" } }}
          className="h-8 px-0 text-sm font-normal text-primary"
        >
          Xem thêm
        </Button>
      </div>
      {!shops ? (
        <Spinner />
      ) : (
        <>
          {!shops.length && (
            <NotFound icon={<RiStore3Line />} text="Không tìm thấy cửa hàng gần bạn"></NotFound>
          )}
          <Swiper slidesPerView={screenSm ? 2.8 : 3} grabCursor={true} spaceBetween={16}>
            {shops.map(
              (shop, index) =>
                shop.shopCount !== 0 && (
                  <SwiperSlide className={`cursor-pointer text-sm h-full`} key={index}>
                    <Link href={`/${shop.shopCode}`}>
                      <a className="flex flex-col min-h-full group">
                        <Img src={shop.coverImage} className="w-full rounded-md" />
                        <div className="flex flex-col min-h-18">
                          <div className="mt-3 mb-1 font-semibold break-words text-ellipsis-2 group-hover:text-primary">
                            {shop.name}
                          </div>
                          <div className="flex mt-auto">
                            {shop.rating > 0 && (
                              <span className="flex items-center">
                                <i className="mr-1 mb-0.5 text-yellow-300">
                                  <FaStar />
                                </i>
                                {shop.rating}
                              </span>
                            )}
                            <span className="flex items-center ml-2">
                              <i className=" mb-0.5  text-gray-400">
                                <RiCheckboxBlankCircleFill className="w-2" />
                              </i>
                              <span className="ml-1">{shop.distance}km</span>
                            </span>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </SwiperSlide>
                )
            )}
          </Swiper>
        </>
      )}
    </div>
  );
}

function TopBrandsDiscount() {
  const { nearByShops, shops } = useShopsContext();
  const screenSm = useScreen("sm");

  if (!shops || !shops.length) return <></>;

  return (
    <div className="p-4 mt-2 ">
      <div className="flex items-center justify-between mb-2 text-lg font-semibold">
        <div className="flex flex-row items-center justify-start">
          <img src="/assets/img/COUPON.png" className="object-cover w-6 mr-2" />
          <span className="mr-2 text-base font-semibold text-primary sm:text-lg">
            Top thương hiệu khao đến 90k
          </span>
          <i className="font-semibold text-primary">
            <HiOutlineChevronRight />
          </i>
        </div>
      </div>
      <Swiper slidesPerView={screenSm ? 2.3 : 2} grabCursor={true} spaceBetween={16}>
        {shops.map(
          (shop, index) =>
            shop.shopCount !== 0 && (
              <SwiperSlide className={`cursor-pointer text-sm h-full`} key={index}>
                <ShopCardProduct shop={shop} ratio169={true} />
              </SwiperSlide>
            )
        )}
      </Swiper>
    </div>
  );
}

function TopPromotionList() {
  const { vouchers } = useShopsContext();
  const screenSm = useScreen("sm");
  const [openVoucherDialog, setOpenVoucherDialog] = useState<string>();

  if (!vouchers || !vouchers.length) return <></>;
  return (
    <div className="p-4 mt-2 ">
      <Swiper slidesPerView={screenSm ? 2.3 : 1.3} grabCursor={true} spaceBetween={16}>
        {vouchers?.map((voucher, index) => (
          <SwiperSlide className={`cursor-pointer text-sm h-full`} key={index}>
            {/* <Link href={`/${voucher.shopCode}`}> */}
            <div
              className="flex flex-row items-center justify-start min-h-full gap-2 p-3 rounded-full group"
              style={{ background: `${voucher?.shop?.config?.primaryColor}` }}
              onClick={() => {
                setOpenVoucherDialog(voucher?.id);
              }}
            >
              <Img
                src={voucher?.shop?.shopCover}
                className="object-cover border border-gray-300 rounded-full min-w-12 lg:w-16"
              />
              <div className="flex flex-col">
                <div className="text-white text-ellipsis-2">{voucher?.code}</div>
                <div className="text-sm text-gray-300 text-ellipsis-2">
                  {voucher?.shop?.shopName}
                </div>
              </div>
            </div>
            {/* </Link> */}
          </SwiperSlide>
        ))}
      </Swiper>
      <VoucherDetailsDialog
        isOpen={!!openVoucherDialog}
        voucherId={openVoucherDialog}
        onClose={() => setOpenVoucherDialog("")}
      />
    </div>
  );
}

function ShopCardProduct({ shop, ratio169, ...props }) {
  return (
    <Link href={`/${shop?.shopCode}`}>
      <a className="flex flex-col min-h-full group">
        <Img ratio169={ratio169} src={shop?.coverImage} className="w-full rounded-md" />
        <div className="flex flex-col min-h-18">
          <div className="mt-3 mb-1 font-semibold break-words text-ellipsis-2 group-hover:text-primary">
            {shop?.name}
          </div>
          <div className="flex mt-auto">
            {shop?.rating > 0 && (
              <span className="flex items-center">
                <i className="mr-1 mb-0.5 text-yellow-300">
                  <FaStar />
                </i>
                {shop?.rating}
              </span>
            )}
            <span className="flex items-center ml-2">
              <i className=" mb-0.5  text-gray-400">
                <RiCheckboxBlankCircleFill className="w-2" />
              </i>
              <span className="ml-1">{shop?.distance}km</span>
            </span>
          </div>
        </div>
      </a>
    </Link>
  );
}

function ShopList() {
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
  const { userLocation, openLocation } = useLocation();
  const screenSm = useScreen("sm");
  const [selectedCate, setSelectedCate] = useState("");

  const categories: {
    id?: string;
    label: string;
    value: boolean;
    onClick?: Function;
  }[] = [
    {
      label: "Gần tôi",
      value: false,
    },
    {
      label: "Nổi bật",
      value: true,
    },
    // {
    //   label: "Đã đặt",
    //   value: true,
    // },
    // {
    //   label: "Được yêu thích",
    //   value: true,
    // },
  ];

  return (
    <div className="p-4 mt-2 ">
      <div className="flex flex-row items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-primary">Quán ngon quanh đây</div>
          <div className="text-sm text-gray-500">{shops?.length} cửa hàng gần bạn</div>
        </div>
        <div className="w-1/3">
          <Select
            clearable
            optionsPromise={() =>
              AddressService.getDistricts("70").then((res) =>
                res.map((x) => ({ value: x.id, label: x.district }))
              )
            }
            className="border border-blue-700 rounded-lg"
            onChange={(e) => {
              console.log(" districtId : ", e);
              setDistrictId(e as string);
            }}
            placeholder="Chọn khu vực"
          />
        </div>
      </div>
      <div className="mt-2 ">
        <Swiper
          slidesPerView={screenSm ? 3 : 3.5}
          className="py-2 pr-2"
          grabCursor={true}
          spaceBetween={10}
        >
          {categories.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                style={{ background: "#E6EDF4" }}
                className={`${sortByTotalOrder == item.value ? "border border-blue-700" : ""} 
                flex flex-col items-center whitespace-nowrap justify-center text-xs px-5 py-3  rounded-full cursor-pointer sm:text-sm group  text-primary font-semibold`}
                onClick={() => {
                  setSortByTotalOrder(item.value);
                }}
              >
                {item.label}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* <div className="flex items-center justify-between text-lg font-semibold">
        <span>Danh sách cửa hàng</span>
        {!listMode && (
          <Button
            className="h-8 px-0"
            href={{ pathname: router.pathname, query: { ...router.query, list: "shops" } }}
            text="Xem tất cả"
            icon={<HiChevronRight />}
            iconClassName="text-lg"
            iconPosition="end"
          />
        )}
      </div> */}

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
            <ShopCard
              key={shop.id}
              shop={shop}
              className={`${index < shops.length - 1 ? "" : ""} bg-white rounded-lg px-4 my-4`}
            />
          ))}
          {listMode == "shops" && !!shops.length && !noLoadMore && (
            <div className="pt-3 mt-3 border-t border-gray-200 flex-center">
              <Button
                primary
                isLoading={isLoadingMore}
                text={"Tải thêm"}
                className="px-8"
                onClick={loadMore}
              />
            </div>
          )}
          {!listMode && isLoadingMore && (
            <div className="pt-3 font-semibold text-center loading-ellipsis text-primary">
              Đang tải thêm
            </div>
          )}
          <LoadingObserver />
        </div>
      )}
    </div>
  );
}

export function LoadingObserver() {
  const { listMode, loadMore, noLoadMore } = useShopsContext();
  const ref = useRef();
  const onScreen = useOnScreen(ref, "-10px");
  useEffect(() => {
    if (onScreen && !noLoadMore && !listMode) {
      loadMore();
    }
  }, [onScreen]);
  return <div ref={ref}></div>;
}

function ProductList() {
  const { listMode, products, isLoadingMore, loadMore, noLoadMore } = useShopsContext();
  const router = useRouter();
  const { search } = router.query;

  return (
    <div className="p-4 mt-2 ">
      <div className="flex items-center justify-between text-lg font-semibold">
        <span className="font-semibold text-primary">
          {search ? "Danh sách món ăn" : "Đã ngon còn khuyến mãi"}{" "}
        </span>

        {!listMode && (
          <Button
            className="h-8 px-0"
            href={{ pathname: router.pathname, query: { ...router.query, list: "products" } }}
            text="Xem tất cả"
            icon={<HiChevronRight />}
            iconClassName="text-lg"
            iconPosition="end"
          />
        )}
      </div>

      {!products ? (
        <Spinner />
      ) : (
        <div className="px-3">
          {!products.length && <NotFound icon={<RiStore3Line />} text="Không tìm thấy món ăn" />}
          {products.map((product, index) => (
            <Link
              key={index}
              href={{
                pathname: `/${product?.member?.code}`,
                query: { product: product?.code },
              }}
            >
              <a className="group">
                <div
                  className={`py-3 px-4 -mx-4 cursor-pointer rounded-lg  bg-white my-3 ${
                    index < products.length - 1 ? "" : ""
                  }`}
                >
                  <div className="flex">
                    <ProductImg
                      src={product.image}
                      className="w-20 border border-gray-100 rounded-sm shadow-sm sm:w-24"
                      compress={100}
                      saleRate={product.saleRate}
                    />
                    <div className="flex flex-col justify-start flex-1 ml-3">
                      <span className="items-start font-semibold text-ellipsis-2 group-hover:text-primary">
                        {product.name}
                      </span>
                      <ProductRating rating={product.rating} soldQty={product.soldQty} />
                      <span className="mt-1 text-sm text-gray-500 text-ellipsis-2">
                        {product.subtitle}
                      </span>
                      <ProductPrice
                        price={product.basePrice}
                        downPrice={product.downPrice}
                        className="mt-auto mb-0"
                      />
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.labels?.map((label, index) => (
                          <div
                            className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white rounded-full whitespace-nowrap"
                            style={{ backgroundColor: label.color }}
                            key={label.name}
                          >
                            <span>{label.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {listMode == "products" && !!products.length && !noLoadMore && (
            <div className="pt-3 mt-3 border-t border-gray-200 flex-center">
              <Button
                primary
                isLoading={isLoadingMore}
                text={"Tải thêm"}
                className="px-8"
                onClick={loadMore}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
