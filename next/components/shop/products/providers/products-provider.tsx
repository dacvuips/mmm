import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Category, CategoryService } from "../../../../lib/repo/category.repo";
import { Product, ProductService } from "../../../../lib/repo/product.repo";
import cloneDeep from "lodash/cloneDeep";
import { ProductTopping, ProductToppingService } from "../../../../lib/repo/product-topping.repo";

export const ProductsContext = createContext<
  Partial<{
    categories: Category[];
    loadCategories: (reset?: boolean) => Promise<any>;
    removeCategory: (category: Category) => Promise<any>;
    onProductChange: (product: Product, category: Category) => any;
    onDeleteProduct: (product: Product, category: Category) => Promise<any>;
    onToggleProduct: (product: Product, category: Category) => Promise<any>;
    onToggleCategory: (category: Category) => Promise<any>;
    toppings: ProductTopping[];
    loadToppings: () => Promise<any>;
    filter: any;
    onFilterChange: (data: any) => any;
    changePositionProduct: (catIndex: number, proIndex: number, up: boolean) => any;
  }>
>({});
export function ProductsProvider(props) {
  const [categories, setCategories] = useState<Category[]>(null);
  const [toppings, setToppings] = useState<ProductTopping[]>(null);
  const [filter, setFilter] = useState({});
  const toast = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const changePositionProduct = async (catIndex: number, proIndex: number, up: boolean) => {
    let cat = categories[catIndex];
    let ids = cat.productIds;
    let realIndex = ids.findIndex((item) => item === cat.products[proIndex].id);
    if (up) {
      let next = cat.products[proIndex + 1];
      let realIndexNext = ids.findIndex((item) => item === next.id);
      let prodIDNext = ids[realIndexNext];
      ids[realIndexNext] = ids[realIndex];
      ids[realIndex] = prodIDNext;
    } else {
      let prev = cat.products[proIndex - 1];
      let realIndexPrev = ids.findIndex((item) => item === prev.id);
      let prodIDPrev = ids[realIndexPrev];
      ids[realIndexPrev] = ids[realIndex];
      ids[realIndex] = prodIDPrev;
    }
    let err = null;
    try {
      await CategoryService.createOrUpdate({ id: cat.id, data: { productIds: [...ids] } });
    } catch (error) {
      err = error;
    } finally {
      if (!err) {
        toast.success("Thay đổi vị trí thành công");
        await loadCategories();
      } else {
        toast.error("Thay đổi vị thất bại " + err);
      }
    }
    // setCategories({ ...categories });
  };
  const loadCategories = async (reset: boolean = false) => {
    if (reset) {
      setCategories(null);
      await CategoryService.clearStore();
    }
    CategoryService.getAll({
      query: {
        limit: 0,
        order: { priority: -1, createdAt: 1 },
      },
      fragment: CategoryService.shortFragmentWithProducts,
    }).then((res) => {
      setCategories(cloneDeep(res.data));
    });
  };

  const removeCategory = async (category: Category) => {
    try {
      await CategoryService.delete({ id: category.id });
      await loadCategories();
    } catch (err) {
      toast.error("Xóa thất bại " + err.message);
    }

  };

  const onProductChange = (product: Product, category: Category) => {
    let cat = categories.find((x) => x.id == category.id);
    if (cat) {
      let index = cat.products.findIndex((x) => x.id == product.id);
      if (index >= 0) {
        cat.products[index] = { ...product };
      } else {
        cat.products.push({ ...product });
        cat.productIds.push(product.id);
      }
      setCategories([...categories]);
    }
  };

  const onDeleteProduct = async (product: Product, category: Category) => {
    try {
      await ProductService.delete({ id: product.id, toast });
      let cat = categories.find((x) => x.id == category.id);
      if (cat) {
        let index = cat.products.findIndex((x) => x.id == product.id);
        if (index >= 0) {
          cat.products.splice(index, 1);
          setCategories([...categories]);
        }
      }
    } catch (err) { }
  };

  const onToggleCategory = async (category: Category) => {
    try {
      let cat = categories.find((x) => x.id == category.id);
      let hidden = cat.hidden;
      cat.hidden = !hidden;
      setCategories([...categories]);
      await CategoryService.update({
        id: cat.id,
        data: { hidden: !hidden },
      })
        .then((res) => toast.success(`${!hidden ? "Ngưng" : "Mở"} bán danh mục thành công`))
        .catch((err) => {
          toast.error(`${!hidden ? "Ngưng" : "Mở"} bán danh mục thất bại`);
          cat.hidden = hidden;
          setCategories([...categories]);
        });
    } catch (err) { }
  };
  const onToggleProduct = async (product: Product, category: Category) => {
    try {
      let allowSale = product.allowSale;
      let cat = categories.find((x) => x.id == category.id);
      let index = cat.products.findIndex((x) => x.id == product.id);
      cat.products[index] = { ...product, allowSale: !allowSale };
      setCategories([...categories]);
      await ProductService.update({
        id: product.id,
        data: { allowSale: !allowSale },
      })
        .then((res) => toast.success(`${allowSale ? "Ngưng" : "Mở"} bán món thành công`))
        .catch((err) => {
          toast.error(`${allowSale ? "Ngưng" : "Mở"} bán món thất bại`);
          cat.products[index] = { ...product, allowSale };
          setCategories([...categories]);
        });
    } catch (err) { }
  };

  const loadToppings = async () => {
    ProductToppingService.getAll({
      query: {
        limit: 0,
        order: { createdAt: -1 },
      },
    }).then((res) => {
      setToppings(cloneDeep(res.data));
    });
  };

  const onFilterChange = (data: any) => {
    setFilter({ ...filter, ...data });
  };

  return (
    <ProductsContext.Provider
      value={{
        categories,
        loadCategories,
        removeCategory,
        onProductChange,
        onDeleteProduct,
        onToggleProduct,
        toppings,
        loadToppings,
        filter,
        onFilterChange,
        onToggleCategory,
        changePositionProduct,
      }}
    >
      {props.children}
    </ProductsContext.Provider>
  );
}

export const useProductsContext = () => useContext(ProductsContext);
