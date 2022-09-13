import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import KhongDau from "khong-dau";

import { parseNumber } from "../../../../lib/helpers/parser";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { Category } from "../../../../lib/repo/category.repo";
import { Button, Input } from "../../../shared/utilities/form";
import { Img, NotFound } from "../../../shared/utilities/misc";
import { useShopDetailsContext } from "../../../index/shop-details/providers/shop-details-provider";
import { FiSearch } from "react-icons/fi";

type Props = {};

export function BilledProductList({ }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { selectedBranch } = useShopContext();
  const { categories } = useShopDetailsContext();

  const [searchText, setSearchText] = useState("");

  const filterCategories: Category[] = useMemo(() => {
    let tempCategories = [];
    if (categories && selectedBranch) {
      categories.forEach((cat) => {
        let filteredProducts = cat.products.filter(
          (item) =>
            (item.allowSale && item.branchIds?.length == 0) ||
            item.branchIds?.find((id) => id == selectedBranch.id)
        );
        if (filteredProducts.length) {
          tempCategories.push({
            ...cat,
            products: filteredProducts,
            productIds: filteredProducts.map((item) => item.id),
          });
        }
      });
    }
    return tempCategories;
  }, [categories, selectedBranch]);
  const categoriesOptions = useMemo(() => {
    let arrNew = [];
    arrNew.push({ value: null, label: "Tất cả" });
    filterCategories.forEach((x) => {
      arrNew.push({ value: x.id, label: x.name });
    });
    return arrNew;
  }, [filterCategories]);
  const listProducts = useMemo(() => {
    let allProducts = [];
    if (!selectedCategory) {
      filterCategories.forEach((cat) => {
        allProducts = [...allProducts, ...cat.products];
      });
      return allProducts;
    } else {
      return filterCategories.find((x) => x.id == selectedCategory)?.products || [];
    }
  }, [selectedCategory, filterCategories]);

  const handleSearchProduct = useMemo(() => {
    if (searchText) {
      return listProducts.filter((item) => {
        return KhongDau(item.name)
          .trim()
          .toLowerCase()
          .includes(KhongDau(searchText).trim().toLowerCase());
      });
    }
  }, [searchText, listProducts]);

  return (
    <div className="p-3 mt-10 bg-white rounded-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-row flex-wrap items-center gap-2">
          {categoriesOptions.map((item, index) => (
            <Button
              primary={selectedCategory === item.value}
              key={index}
              text={`${item.label}`}
              className={` rounded-md border border-primary text-sm font-medium 
              `}
              onClick={() => setSelectedCategory(item.value)}
            />
          ))}
        </div>
        {/* <Input
          className="mt-0 ml-2 rounded-xl w-80"
          clearable
          prefix={
            <i className="text-xl">
              <FiSearch />
            </i>
          }
          placeholder={`Tìm kiếm nhanh món?`}
          debounce={500}
          value={searchText}
          onChange={setSearchText}
        /> */}
      </div>
      <div className="mt-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {searchText ? (
            handleSearchProduct.length <= 0 ? (
              <NotFound text="Không có sản phẩm tìm kiếm" />
            ) : (
              handleSearchProduct.map((item, index) => (
                <BilledProductCard product={item} key={index} />
              ))
            )
          ) : (
            listProducts.map((item, index) => <BilledProductCard product={item} key={index} />)
          )}
        </div>
      </div>
    </div>
  );
}

function BilledProductCard({ product, ...props }) {
  const { shopCode } = useShopContext();
  return (
    <Link
      href={{
        pathname: `/shop/pos`,
        query: { product: product?.code },
      }}
    >
      <a className="shadow p-0.5 rounded-md flex flex-col justify-between">
        <div>
          <Img className="object-cover w-full rounded-md " ratio169 src={product?.image} />
          <div className="my-2 text-sm font-medium text-ellipsis-2">{product?.name}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-primary">{parseNumber(product?.basePrice)}đ</div>
          {Number(product?.downPrice) > 0 &&
            Number(product?.downPrice) > Number(product?.basePrice) && (
              <del className="text-xs text-gray-500">{parseNumber(product?.downPrice)}đ</del>
            )}
        </div>
      </a>
    </Link>
  );
}
