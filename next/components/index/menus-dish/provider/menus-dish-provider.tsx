import { useRouter } from "next/router";
import KhongDau from "khong-dau";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { Category } from "../../../../lib/repo/category.repo";
import { useShopDetailsContext } from "../../shop-details/providers/shop-details-provider";
import { ConfirmOrderDialog } from "../components/confirm-order-dialog";
import { ErrorRequestOrderDialog } from "../components/error-request-order-dialog";

var disableScrollCheck = false;
export const MenusDishContext = createContext<
  Partial<{
    modeShow: "grid" | "list" | string;
    setModeShow: (modeShow: "grid" | "list" | string) => void;
    currentInViewportTab: string;
    filteredCategories: Category[];
    searchText: string;
    handleSearch: (searchText: string) => void;
    handleSearchProduct: any;
    showConfirmOrderDialog;
    setShowConfirmOrderDialog;
    showRequestOrderError;
    setShowRequestOrderError;
  }>
>({});
export function MenusDishProvider(props) {
  const [modeShow, setModeShow] = useState<string>("grid");
  const { categories } = useShopDetailsContext();
  const { selectedBranch, shopCode } = useShopContext();
  const [searchText, setSearchText] = useState("");
  const [showConfirmOrderDialog, setShowConfirmOrderDialog] = useState(false);
  const [showRequestOrderError, setShowRequestOrderError] = useState(false);
  const router = useRouter();

  const [currentInViewportTab, setCurrentInViewportTab] = useState("");
  const isInViewport = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  };

  const scrollEvent = () => {
    if (disableScrollCheck || !categories) return;

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setCurrentInViewportTab(categories[categories.length - 1].id);
      return;
    }
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const el = document.getElementById(`tab-item-${category.id}`);
      if (el && isInViewport(el)) {
        setCurrentInViewportTab(categories[i].id);
        return;
      }
    }
    setCurrentInViewportTab(categories?.length ? categories[0].id : "");
  };

  useEffect(() => {
    if (categories) {
      document.addEventListener("scroll", scrollEvent, {
        passive: true,
      });
    }
    return () => {
      document.removeEventListener("scroll", scrollEvent);
    };
  }, [categories]);

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
    return tempCategories;
  }, [categories, selectedBranch,]);

  const handleSearchProduct = useMemo(() => {
    if (searchText) {
      let products = [];
      filteredCategories.forEach((cat) => {
        let temp = cat.products.filter((item) =>
          KhongDau(item.name)
            .trim()
            .toLowerCase()
            .includes(KhongDau(searchText).trim().toLowerCase())
        );
        if (temp.length) {
          products.push({
            ...cat,
            products: temp,
            productIds: temp.map((item) => item.id)
          })
        }
        return products;
      });
      return products;
    } else {
      return filteredCategories;
    }
  }, [searchText, filteredCategories]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    router.push({
      pathname: `/${shopCode}/menu`,
      query: {
        ...(value?.trim().length ? { keyword: value } : {}),
      },
    });
  };

  return (
    <MenusDishContext.Provider
      value={{
        modeShow,
        setModeShow,
        filteredCategories,
        currentInViewportTab,
        searchText,
        handleSearch,
        handleSearchProduct,
        setShowConfirmOrderDialog,
        setShowRequestOrderError,
      }}
    >
      {props.children}
      <ConfirmOrderDialog
        isOpen={!!showConfirmOrderDialog}
        onClose={() => {
          setShowConfirmOrderDialog(false);
        }}
      />
      <ErrorRequestOrderDialog
        isOpen={!!showRequestOrderError}
        onClose={() => {
          setShowRequestOrderError(false);
        }}
      />
    </MenusDishContext.Provider>
  );
}

export const useMenusDishContext = () => useContext(MenusDishContext);
