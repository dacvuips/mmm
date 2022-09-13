import Link from "next/link";
import KhongDau from "khong-dau";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { Category } from "../../../../lib/repo/category.repo";
import { Product, ProductService } from "../../../../lib/repo/product.repo";
import { ProductCard } from "../../../shared/product/product-card";
import { Button, Input } from "../../../shared/utilities/form";
import { Img, NotFound, Scrollbar, Spinner } from "../../../shared/utilities/misc";
import { useShopDetailsContext } from "../providers/shop-details-provider";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useCrud } from "../../../../lib/hooks/useCrud";

type Props = {};

var disableScrollCheck = false;
var disableTimout;
export function ShopDetailCategoriesDesktop({ ...props }: Props) {
  const router = useRouter();
  const { categories } = useShopDetailsContext();
  const { selectedBranch, shopCode } = useShopContext();
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);

  const [currentInViewportTab, setCurrentInViewportTab] = useState("");
  const isInViewport = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  };

  // const scrollEvent = () => {
  //   if (disableScrollCheck || !categories) return;

  //   if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
  //     setCurrentInViewportTab(categories[categories.length - 1].id);
  //     return;
  //   }
  //   for (let i = 0; i < categories.length; i++) {
  //     const category = categories[i];
  //     const el = document.getElementById(`tab-item-${category.id}`);
  //     if (el && isInViewport(el)) {
  //       setCurrentInViewportTab(categories[i].id);
  //       return;
  //     }
  //   }
  //   setCurrentInViewportTab(categories?.length ? categories[0].id : "");
  // };

  // useEffect(() => {
  //   if (categories) {
  //     document.addEventListener("scroll", scrollEvent, {
  //       passive: true,
  //     });
  //   }
  //   return () => {
  //     document.removeEventListener("scroll", scrollEvent);
  //   };
  // }, [categories]);

  const filteredCategories: Category[] = useMemo(() => {
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

    if (searchText) {
      tempCategories = tempCategories.filter((cat) => {
        let filteredProducts = cat.products.filter((item) => {
          let name = item.name;
          let nameKhongDau = KhongDau(name).trim().toLowerCase();
          let searchTextKhongDau = KhongDau(searchText).trim().toLowerCase();
          return nameKhongDau.includes(searchTextKhongDau);
        });
        if (filteredProducts.length) {
          return true;
        }
        return false;
      });
    }
    return tempCategories;
  }, [categories, selectedBranch]);

  const categoriesOptions = useMemo(
    () => filteredCategories.map((x) => ({ value: x.id, label: x.name })),
    [filteredCategories]
  );
  useEffect(() => {
    if (router.query.cate) {
      const contactEle = document.getElementById(`${router.query.cate as string}`);
      if (contactEle) contactEle.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [router.query]);

  useEffect(() => {
    if (searchText == "") {
      setProducts([]);
      return;
    } else {
      ProductService.getAll({
        query: { limit: 10, search: searchText, filter: { allowSale: true } },
      }).then((res) => {
        setProducts(res.data);
      });
    }
  }, [searchText]);

  if (!categories || !filteredCategories) return <Spinner />;
  return (
    <>
      <div className="w-1/4">
        <div className="mb-5 text-lg font-semibold text-primary">Thực đơn</div>
        {categoriesOptions?.length > 0 ? (
          <div className="sticky flex flex-col p-5 bg-white rounded-md top-5">
            <Scrollbar className="mr-4" height={520} style={{ maxHeight: `cal(100vh - 50px)` }}>
              {categoriesOptions.map((item, index) => {
                return (
                  <Link href={`/${shopCode}?cate=${item.label}`} key={index}>
                    <a>
                      <div
                        className={`${currentInViewportTab == item.label ? "text-white bg-primary" : ""
                          } p-2 mb-2 font-medium hover:bg-primary hover:text-white  rounded-md cursor-pointer text-sm whitespace-nowrap text-ellipsis-1`}
                        onClick={() => {
                          setCurrentInViewportTab(item.label);
                        }}
                      >
                        {item.label}
                      </div>
                    </a>
                  </Link>
                );
              })}
            </Scrollbar>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex-1 min-h-screen p-5 ml-5 bg-white rounded-md">
        <div className="relative">
          <Input
            className=""
            placeholder="Bạn muốn tìm đồ ăn gì ?"
            prefix={
              <>
                <FiSearch />
              </>
            }
            prefixClassName="text-2xl"
            value={searchText}
            onChange={setSearchText}
            debounce={500}
            clearable
          />
          {searchText != "" ? (
            <div className="absolute left-0 w-full rounded-b-lg shadow top-10 bg-gray-50 z-100">
              {products?.length > 0 ? (
                <>
                  {products.map((product, index) => (
                    <Link
                      href={{
                        pathname: `/${product?.member?.code}`,
                        query: { product: product?.code },
                      }}
                      shallow
                      key={index}
                    >
                      <a>
                        <div
                          className="flex items-center justify-start p-3 mt-1 border-b"
                          key={index}
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
        {filteredCategories?.length > 0 ? (
          <>
            {filteredCategories.map((item, index) => (
              <div key={index} id={item.name}>
                <ShopCategory id={item.id} products={item.products} title={item.name} />
              </div>
            ))}
          </>
        ) : (
          <NotFound text="Không có sản phẩm cần tìm" />
        )}
      </div>
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
    <div className="relative pt-4 bg-white menu">
      <div ref={ref} className="absolute -top-8" id={`tab-item-${props.id}`}></div>
      <div className="text-lg font-semibold menu-title">{props.title}</div>
      {!!props.products.length && (
        <>
          {props.products.map(
            (item: Product, index: number) =>
              !!item.allowSale && (
                <ProductCard
                  key={index}
                  product={item}
                  hasQuantityButtons
                  hasLabel
                  className="border-b"
                />
              )
          )}
        </>
      )}
    </div>
  );
}
