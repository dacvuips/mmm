import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineRight } from 'react-icons/ai';

import { parseNumber } from '../../../../lib/helpers/parser';
import { useShopContext } from '../../../../lib/providers/shop-provider';
import { Category } from '../../../../lib/repo/category.repo';
import { Product } from '../../../../lib/repo/product.repo';
import { Img, NotFound, Spinner } from '../../../shared/utilities/misc';
import { TabScroller } from '../../../shared/utilities/tab/tab-scroller';
import { useShopDetailsContext } from '../../shop-details/providers/shop-details-provider';
import { useMenusDishContext } from '../provider/menus-dish-provider';
import { MenusDishProductCard } from './menus-dish-product-card';

type Props = {};

export function MenusDishCategories({ }: Props) {
  return <ListCategory />;
}

var disableScrollCheck = false;
var disableTimout;
function ListCategory(props) {
  const { categories } = useShopDetailsContext();

  const { modeShow, currentInViewportTab, handleSearchProduct } = useMenusDishContext();

  const categoriesOptions = useMemo(
    () => handleSearchProduct.map((x) => ({ value: x.id, label: x.name })),
    [handleSearchProduct]
  );

  if (!categories || !handleSearchProduct) return <Spinner />;
  return (
    <>
      <TabScroller
        value={currentInViewportTab}
        onChange={(val) => {
          const el = document.getElementById(`tab-item-${val}`);
          if (el) {
            clearTimeout(disableTimout);
            disableScrollCheck = true;
            scrollTo({
              top: (el.offsetParent as HTMLElement).offsetTop + el.offsetTop,
              behavior: "smooth",
            });
            disableTimout = setTimeout(() => {
              disableScrollCheck = false;
            }, 1000);
          }
        }}
        options={categoriesOptions}
        className={`sticky z-50 mt-2 text-gray-400 bg-gray-50 transition-all duration-200 ease-in-out top-14`}
        tabClassName="px-3 py-2 whitespace-nowrap font-medium hover:text-gray-800  cursor-pointer"
        activeTabClassName="text-primary border-b-2 border-primary hover:text-primary-dark"
        dividerClassName="absolute top-1/2 transform -translate-y-1/2 h-3/5  border-gray-300 right-0"
      />
      <div className="bg-white min-h-screen">
        {modeShow == "grid" ? (
          handleSearchProduct.length > 0 ? (
            handleSearchProduct.map((item: Category, index: number) => (
              <CategoryGrid key={index} products={item.products} title={item.name} id={item.id} />
            ))
          ) : (
            <NotFound text="Không có sản phẩm cần tìm" />
          )
        ) : modeShow == "list" ? (
          handleSearchProduct.length > 0 ? (
            <div className="flex flex-col ">
              {handleSearchProduct.map((item: Category, index: number) => (
                <ShopCategory id={item.id} products={item.products} title={item.name} key={index} />
              ))}
            </div>
          ) : (
            <NotFound text="Không có sản phẩm cần tìm" />
          )
        ) : (
          <></>
        )}
      </div>

      <div className="h-16 bg-white border-b-4 border-primary"></div>
    </>
  );
}

interface ShopCategoryPropsType extends ReactProps {
  products: Product[];
  title: string;
  id: string;
}
function ShopCategory(props: ShopCategoryPropsType) {
  const ref = useRef();

  return (
    <>
      <div className="relative px-4 pt-4 bg-white border-b border-dashed menu ">
        <div ref={ref} className="absolute -top-8" id={`tab-item-${props.id}`}></div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-lg font-semibold menu-title">
            {props.title} ({props.products.length})
          </div>
          <Link href="">
            <a className="flex flex-row items-center whitespace-nowrap">
              Xem tất cả{" "}
              <span className="ml-2">
                <AiOutlineRight />
              </span>{" "}
            </a>
          </Link>
        </div>

        {!!props.products.length && (
          <>
            {props.products.map(
              (item: Product, index: number) =>
                !!item.allowSale && (
                  <MenusDishProductCard
                    key={index}
                    product={item}
                    hasQuantityButtons
                    hasLabel
                    className=""
                  />
                )
            )}
          </>
        )}
      </div>
    </>
  );
}

function CategoryGrid(props: ShopCategoryPropsType) {
  const { shopCode } = useShopContext();
  const ref = useRef();

  return (
    <>
      <div className="relative bg-white p-3">
        <div ref={ref} className="absolute -top-8" id={`tab-item-${props.id}`}></div>
        <div className="text-lg font-semibold menu-title mb-3">
          {props.title} ({props.products.length})
        </div>
        <div className="grid grid-cols-3 gap-5 border-b border-dashed pb-4">
          {!!props.products.length && (
            <>
              {props.products.map(
                (item: Product, index: number) =>
                  !!item.allowSale && (
                    <Link
                      href={{
                        pathname: `/${shopCode}/menu`,
                        query: { product: item?.code },
                      }}
                      key={index}
                    >
                      <a className="flex flex-col border border-gray-50 rounded p-2">
                        <Img src={item?.image} className="w-24 object-cover rounded-md" />
                        <div className="font-semibold text-ellipsis-2 my-1">{item?.name}</div>
                        <div className="text-primary font-semibold">
                          {parseNumber(item?.basePrice)}
                        </div>
                        {Number(item?.downPrice) > Number(item?.basePrice) &&
                          Number(item?.downPrice) > 0 && (
                            <del className="text-gray-400 text-sm">
                              {parseNumber(item?.downPrice)}
                            </del>
                          )}
                      </a>
                    </Link>
                  )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
