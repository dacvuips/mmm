import { orderBy } from "lodash";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Banner } from "../../../../lib/repo/banner.repo";
import { Member } from "../../../../lib/repo/member.repo";
import { Product, ProductService } from "../../../../lib/repo/product.repo";
import { ShopCategory, ShopCategoryService } from "../../../../lib/repo/shop-category.repo";
import { ShopVoucher, ShopVoucherService } from "../../../../lib/repo/shop-voucher.repo";
import { PublicShop, ShopService } from "../../../../lib/repo/shop.repo";

export const ShopsContext = createContext<
  Partial<{
    openAddress: () => any;
    nearByShops: PublicShop[];
    shops: PublicShop[];
    categories: ShopCategory[];
    selectedCategory: string;
    setSelectedCategory: (id: string) => any;
    banner: Banner[];
    search: string;
    listMode: "shops" | "products";
    isLoadingMore: boolean;
    loadMore: () => Promise<any>;
    noLoadMore: boolean;
    products: Product[];
    members: Member[];
    setDistrictId: (id: string) => any;
    sortByTotalOrder: boolean;
    setSortByTotalOrder: (value: boolean) => any;
    vouchers: ShopVoucher[];
  }>
>({});

export function ShopsProvider(props) {
  const [categories, setCategories] = useState<ShopCategory[]>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { userLocation } = useLocation();

  const [nearByShops, setNearByShops] = useState<PublicShop[]>();
  const [shops, setShops] = useState<PublicShop[]>();
  const router = useRouter();
  const search = useMemo(() => router.query["search"] as string, [router?.query.search]);
  const [districtId, setDistrictId] = useState<string>("");
  const [sortByTotalOrder, setSortByTotalOrder] = useState<boolean>(false);
  const [vouchers, setVouchers] = useState<ShopVoucher[]>();
  const listMode: "shops" | "products" = useMemo(() => {
    const mode = router.query["list"] as string;
    if (mode == "shops" || mode == "products") return mode;
    else return null;
  }, [router?.query.list]);

  const toast = useToast();
  const limit = 15;
  const [page, setPage] = useState<number>(1);

  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = () => {
    ProductService.getRandomProduct(limit, selectedCategory).then((res) => {
      setProducts(res);
    });
  };

  const searchProducts = () => {
    setProducts(null);
    setNoLoadMore(false);
    const currentPage = 1;
    setPage(1);
    ProductService.getAll({
      query: { limit, search: search, filter: { allowSale: true }, page: currentPage },
    }).then((res) => {
      setProducts(res.data);
    });
  };

  useEffect(() => {
    if (search) {
      searchProducts();
    } else {
      loadProducts();
    }
  }, [search, selectedCategory]);

  const loadCategories = () => {
    ShopCategoryService.getAll({
      query: { limit: 10, order: { priority: -1 } },
      cache: false,
    })
      .then((res) => {
        setCategories([
          {
            id: "",
            createdAt: "",
            updatedAt: "",
            name: "Tất cả",
            image: "/assets/img/cat-default.png",
            desc: "",
            shopCount: null,
            priority: 100,
          },
          ...res.data,
        ]);
      })
      .catch((err) => {
        setCategories([]);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setNearByShops(null);
    if (userLocation?.lat && userLocation?.fullAddress) {
      sessionStorage.setItem("addressSelected", JSON.stringify(userLocation));
      ShopService.getAllShop(
        userLocation.lat,
        userLocation.lng,
        selectedCategory,
        districtId,
        false,
        search,
        50,
        page,
        sortByTotalOrder
      )
        .then((res) => {
          setNearByShops(orderBy(res, (o) => o.distance));
        })
        .catch((err) => {
          toast.error("Không lấy được danh sách cửa hàng. " + err);
        });
    } else {
      setNearByShops([]);
    }
  }, [userLocation, selectedCategory, search]);

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

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noLoadMore, setNoLoadMore] = useState(false);
  const loadMore = async () => {
    if (!userLocation || !userLocation.fullAddress || !userLocation.lat) return;
    setIsLoadingMore(true);
    if (listMode == "products") {
      let currentPage = page + 1;
      setPage(currentPage);
      ProductService.getAll({
        query: { limit, search: search, filter: { allowSale: true }, page: currentPage },
      })
        .then((res) => {
          let newProducts = [...products, ...res.data];
          setProducts(newProducts);
          if (newProducts.length >= res.total) {
            setNoLoadMore(true);
          }
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    } else {
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
    }
  };

  useEffect(() => {
    ShopVoucherService.getAllVoucher("")
      .then((res) => {
        setVouchers(res);
      })
      .catch((err) => {
        toast.error("Không lấy được danh sách voucher. " + err);
      });
  }, []);

  return (
    <ShopsContext.Provider
      value={{
        nearByShops,
        shops,
        categories,
        selectedCategory,
        setSelectedCategory,
        search,
        listMode,
        isLoadingMore,
        noLoadMore,
        loadMore,
        products,
        setDistrictId,
        sortByTotalOrder,
        setSortByTotalOrder,
        vouchers,
      }}
    >
      {props.children}
    </ShopsContext.Provider>
  );
}

export const useShopsContext = () => useContext(ShopsContext);
