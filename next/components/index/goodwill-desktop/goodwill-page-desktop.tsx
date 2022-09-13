import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { RiStore3Line } from "react-icons/ri";

import { DefaultFooterDesktop } from "../../../layouts/defalut-footer-desktop";
import { LocationProvider } from "../../../lib/providers/location-provider";
import { AddressService } from "../../../lib/repo/address.repo";
import { Button, Input, Select } from "../../shared/utilities/form";
import { Img, NotFound, Spinner } from "../../shared/utilities/misc";
import { ShopsHeaderDesktop } from "../shops/components/shops-header-desktop";
import { GoodWillProvider, useGoodWillContext } from "./providers/goodwill-provider";

type Props = {};

export function GoodwillPageDesktop({ }: Props) {
  return (
    <LocationProvider>
      <GoodWillProvider>
        <ShopsHeaderDesktop />
        <div className="min-h-screen mt-20 main-container">
          <GoodwillBodyDesktop />
        </div>
        <DefaultFooterDesktop />
      </GoodWillProvider>
    </LocationProvider>
  );
}

function GoodwillBodyDesktop() {
  const { setDistrictId } = useGoodWillContext();
  return (
    <div>
      <div className="my-5 text-lg font-semibold text-center">Ưu đãi gần tôi</div>
      <div className="flex flex-row items-center justify-between ">
        <div className="w-1/6">
          <Select
            placeholder="Chọn khu vực"
            // options={[
            //   { value: "1", label: "Hà nội" },
            //   { value: "50", label: "Hồ Chí Minh" },
            // ]}
            clearable
            optionsPromise={() =>
              AddressService.getDistricts("70").then((res) =>
                res.map((x) => ({ value: x.id, label: x.district }))
              )
            }
            onChange={(value) => {
              setDistrictId(value);
              console.log(value);
            }}
          />
        </div>
        <SearchProduct />
      </div>
      <ProductListDesktop />
    </div>
  );
}

function SearchProduct() {
  const { search, setSearch } = useGoodWillContext();

  return (
    <div>
      <Input
        className=""
        placeholder="Bạn muốn tìm cửa hàng?"
        prefix={
          <>
            <FiSearch />
          </>
        }
        prefixClassName="text-2xl"
        value={search}
        onChange={setSearch}
        clearable
        debounce={500}
      />
    </div>
  );
}

function ProductListDesktop() {
  const { shops, isLoadingMore, loadMore, noLoadMore } = useGoodWillContext();

  return (
    <div className="my-5">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {!shops ? (
          <Spinner />
        ) : (
          <>
            {!shops.length && (
              <NotFound icon={<RiStore3Line />} text="Không tìm thấy cửa hàng nào" />
            )}

            {shops.map((shop, index) => (
              <Link key={index} href={`/${shop?.shopCode}`}>
                <a className="p-3 transition-all bg-white rounded-sm delay-80 hover:-translate-y-1 hover:shadow-lg transform-gpu">
                  <Img
                    src={shop?.coverImage}
                    ratio169
                    className="object-contain rounded-md"
                    alt={shop?.name}
                  />
                  <div className="flex flex-col">
                    <div className={`font-medium  hover:text-primary-dark py-1 text-ellipsis-2`}>
                      {shop?.name}
                    </div>

                    <div className="text-gray-400 text-ellipsis-1 ">{shop?.fullAddress}</div>
                    {/* <div className="flex flex-wrap items-center justify-start my-2 min-h-10 flex-start ">
                      {shop?.labels?.length > 0 &&
                        shop?.labels.map((label, index) => (
                          <span
                            className="px-2 py-1 my-1 mr-2 text-white rounded-full"
                            style={{ background: `${label?.color}` }}
                            key={index}
                          >
                            {label?.name}
                          </span>
                        ))}
                    </div> */}
                    <div className="flex mt-auto">
                      <span className="flex items-center">
                        <i className="mr-1 mb-0.5 text-primary">
                          <FaMapMarkerAlt />
                        </i>
                        <span className="text-primary">{shop?.distance}km</span>
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </>
        )}
      </div>
      <div className="flex justify-center my-8">
        {!!shops?.length && !noLoadMore && (
          <Button
            primary
            isLoading={isLoadingMore}
            text={"Tải thêm"}
            className="px-8"
            onClick={loadMore}
          />
        )}
      </div>
    </div>
  );
}
