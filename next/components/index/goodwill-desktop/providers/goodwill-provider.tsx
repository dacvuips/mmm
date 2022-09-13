import { cloneDeep, orderBy } from "lodash";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCrud } from "../../../../lib/hooks/useCrud";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Product, ProductService } from "../../../../lib/repo/product.repo";
import { PublicShop, ShopService } from "../../../../lib/repo/shop.repo";

export const GoodWillContext = createContext<
  Partial<{
    search: string;
    setPagination: (page: any) => any;
    setSearch: (key: string) => any;
    page: number;
    products: Product[];
    pagination: any;
    shops: PublicShop[];
    setDistrictId: (id: string) => any;
    sortByTotalOrder: boolean;
    setSortByTotalOrder: (value: boolean) => any;
    isLoadingMore: boolean;
    loadMore: () => Promise<any>;
    noLoadMore: boolean;
  }>
>({});

export function GoodWillProvider(props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<PublicShop[]>();
  const { userLocation } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [sortByTotalOrder, setSortByTotalOrder] = useState<boolean>(false);
  const router = useRouter();
  const [listMode, setListMode] = useState("");
  // const listMode: "shops" | "products" = useMemo(() => {
  //   const mode = router.query["list"] as string;
  //   if (mode == "shops" || mode == "products") return mode;
  //   else return null;
  // }, [router?.query.list]);

  const toast = useToast();

  const { items, pagination, setPagination } = useCrud(
    ProductService,
    {
      limit: limit,
      search,
      filter: {
        allowSale: true,
      },
      order: { _id: -1 },
    }, {
    cache: false
  });

  useEffect(() => {
    setShops(null);
    if (userLocation?.lat && userLocation?.fullAddress) {
      sessionStorage.setItem("addressSelected", JSON.stringify(userLocation));
      setNoLoadMore(false);
      const currentPage = 1;
      setPage(1);
      ShopService.getAllShop(
        userLocation.lat,
        userLocation.lng,
        selectedCategory,
        districtId,
        !listMode ? true : false,
        search,
        limit,
        currentPage,
        sortByTotalOrder
      )
        .then((res) => {
          setShops(orderBy(res, (o) => o.distance));
        })
        .catch((err) => {
          toast.error("Không lấy được danh sách cửa hàng. " + err);
        });
    } else {
      setShops([]);
    }
  }, [userLocation, selectedCategory, search, listMode, districtId, sortByTotalOrder]);
  useEffect(() => {
    loadMore();
  }, []);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noLoadMore, setNoLoadMore] = useState(false);
  const loadMore = async () => {
    if (!userLocation || !userLocation.fullAddress || !userLocation.lat) return;
    setIsLoadingMore(true);

    let currentPage = page + 1;
    setPage(currentPage);
    ShopService.getAllShop(
      userLocation.lat,
      userLocation.lng,
      selectedCategory,
      districtId,
      !listMode ? true : false,
      search,
      limit,
      currentPage,
      sortByTotalOrder
    )
      .then((res) => {
        if (!res.length || res.length < limit) {
          setNoLoadMore(true);
        }
        setShops([...shops, ...orderBy(res, (o) => o.distance)]);
      })
      .catch((err) => {
        toast.error("Không lấy được danh sách cửa hàng. " + err);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  };

  return (
    <GoodWillContext.Provider
      value={{
        products: items,
        pagination: pagination,
        setPagination,
        setSearch,
        shops,
        setDistrictId,
        isLoadingMore,
        loadMore,
        noLoadMore,
      }}
    >
      {props.children}{" "}
    </GoodWillContext.Provider>
  );
}
export const useGoodWillContext = () => useContext(GoodWillContext);
