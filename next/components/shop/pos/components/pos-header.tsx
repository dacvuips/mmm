import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { HiPlusCircle } from 'react-icons/hi';
import { IoCloseCircleSharp } from 'react-icons/io5';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper/core';
import { Swiper, SwiperSlide } from 'swiper/react';

import { parseNumber } from '../../../../lib/helpers/parser';
import { useShopContext } from '../../../../lib/providers/shop-provider';
import { ProductService } from '../../../../lib/repo/product.repo';
import { Button, Input, Select } from '../../../shared/utilities/form';
import { Img, NotFound } from '../../../shared/utilities/misc';

type Props = {};
SwiperCore.use([Pagination, Autoplay, Navigation]);

export function BilledHeader({ }: Props) {
  const { shopCode } = useShopContext();

  const MENU: {
    label: string;
    onClick?: Function;
    href?: string;
  }[] = [
      {
        href: "/shop", // url demo
        label: "Trang chủ",
      },
    ];

  const refDropdown = useRef(null);
  const [optionBill, setOptionBill] = useState<string>(null);
  return (
    <div className="fixed top-0 left-0 right-0 bg-primary z-100">
      <div className="flex flex-row items-center justify-between h-18 main-container">
        <div className="flex items-center justify-start gap-8">
          <Link href="/">
            <a>
              <Img
                src="/assets/img/logo-som-icon.png"
                className="object-cover w-12 rounded-md"
                alt="logo"
              />
            </a>
          </Link>
          <SearchBilled />
        </div>
        {/* <CreateBilled /> */}
        {/* <div className="flex flex-row items-center justify-between min-w-max">
          <div className="flex items-center justify-around text-white whitespace-nowrap">
            Đơn đang chọn:
            <span className="mx-2 font-semibold text-white">
              {optionBill ? `Đơn ${optionBill}` : "[Chưa chọn]"}
            </span>
          </div>
          <div>
            <Select
              options={ORDER_LISTS}
              className="w-40"
              value={optionBill}
              onChange={(val) => {
                setOptionBill(val);
              }}
            />
          </div>
        </div> */}
        <div className="flex flex-row items-center">
          <Button
            text={"Quản lý đơn hàng"}
            className="font-medium text-white border-none text-[14px]"
            hoverWhite
            href={"/shop/orders"}
            targetBlank
          />
          {MENU.map((item, index) => (
            <Button
              text={item.label}
              className="font-medium text-white border-none text-[14px]"
              hoverWhite
              href={item.href}
              key={index}
            />
          ))}

          <div className="flex flex-row items-center justify-start">
            <Img
              src={`${"/assets/default/avatar.png"} `}
              className="object-cover w-8 rounded-full"
            />
            <Button
              text={shopCode}
              // icon={<AiOutlineCaretDown />}
              // iconPosition="end"
              iconClassName="text-white"
              className="pl-1 text-white border-none "
              innerRef={refDropdown}
              hoverWhite
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateBilled({ }: Props) {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  return (
    <div className="flex flex-row items-center" style={{ maxWidth: 500 }}>
      <div style={{ minWidth: 500 }}>
        <Swiper
          className="px-10"
          spaceBetween={2}
          slidesPerView={3}
          grabCursor
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
        >
          <div
            ref={navigationPrevRef}
            className="absolute left-0 w-8 pl-0 pr-2 text-gray-600 transform -translate-y-1/2 bg-white border rounded-r-full shadow cursor-pointer h-9 top-1/2 flex-center group-hover:text-primary z-100"
          >
            <i className="text-lg">
              <FaChevronLeft />
            </i>
          </div>
          <div
            ref={navigationNextRef}
            className="absolute right-0 w-8 pl-2 pr-0 text-gray-600 transform -translate-y-1/2 bg-white border rounded-l-full shadow cursor-pointer h-9 top-1/2 flex-center group-hover:text-primary z-100"
          >
            <i className="text-lg">
              <FaChevronRight />
            </i>
          </div>
          {[1, 2, 3, 4, 5, 6].map((item, index) => (
            <SwiperSlide key={index} className="w-full">
              <Button
                text={`Đơn ${item}`}
                icon={<IoCloseCircleSharp />}
                iconClassName="text-2xl"
                iconPosition="end"
                className="text-white border rounded-xl hover:bg-white hover:text-primary whitespace-nowrap"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Button
        icon={<HiPlusCircle />}
        iconClassName="text-3xl"
        iconPosition="end"
        className="text-white border-none"
        hoverWhite
      />
    </div>
  );
}

export function SearchBilled() {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (searchText == "") {
      setProducts([]);
      return;
    } else {
      ProductService.getAll({
        query: { limit: 6, search: searchText, filter: { allowSale: true } },
      }).then((res) => {
        setProducts(res.data);
      });
    }
  }, [searchText]);
  return (
    <div className={"relative"}>
      <Input
        className="flex-1 rounded-xl w-80"
        clearable
        prefix={
          <i className="text-xl">
            <FiSearch />
          </i>
        }
        placeholder={`Tìm kiếm sản phẩm?`}
        debounce={500}
        value={searchText}
        onChange={setSearchText}
      />
      {searchText ? (
        <div className={"absolute top-10 w-full left-0 bg-gray-50 z-100 shadow rounded-lg"}>
          {products?.length > 0 ? (
            <>
              {products.map((product, index) => (
                <Link
                  href={{
                    pathname: `/shop/pos`,
                    query: { product: product?.code },
                  }}
                  shallow
                  key={index}
                >
                  <a>
                    <div
                      className="flex items-center justify-start p-3 mt-1 border-b"
                      key={index}
                      onClick={() => {
                        setSearchText("");
                      }}
                    >
                      <Img src={product.image} className="object-cover w-14" />
                      <div className="ml-3">
                        <div className="font-semibold">{product?.name}</div>
                        <div className="text-sm text-primary">
                          {parseNumber(product?.basePrice)}đ
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </>
          ) : (
            <NotFound text="Không có sản phẩm cần tìm" />
          )}
        </div>
      ) : null}
    </div>
  );
}

export const ORDER_LISTS = [
  { value: "1", label: "Đơn 1" },
  { value: "2", label: "Đơn 2" },
  { value: "3", label: "Đơn 3" },
  { value: "4", label: "Đơn 4" },
  { value: "5", label: "Đơn 5" },
  { value: "6", label: "Đơn 6" },
];
