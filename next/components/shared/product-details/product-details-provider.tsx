import { createContext, useContext, useEffect, useState } from "react";
import cloneDeep from "lodash/cloneDeep";
import {
  OrderItemToppingInput,
  ProductTopping,
  ToppingOption,
} from "../../../lib/repo/product-topping.repo";
import { Product, ProductService } from "../../../lib/repo/product.repo";
import { CartProduct, useCart } from "../../../lib/providers/cart-provider";
import { useRouter } from "next/router";
import { usePaymentContext } from "../../index/payment/providers/payment-provider";
import { initProductToppings } from "../../../lib/helpers/product";
import { useToast } from "../../../lib/providers/toast-provider";

export const ProductDetailsContext = createContext<
  Partial<{
    isDiscountItems: boolean;
    productCode: string;
    editCartProductIndex: number;
    cartProduct: CartProduct;
    product: Product;
    dataTopping: any;
    setDataTopping: any;
    totalAmount: number;
    qty: number;
    setQty: any;
    toppings: OrderItemToppingInput[];
    onChangeQuantity: (qty: number) => any;
    onToppingOptionClick: (option: ToppingOption, topping: ProductTopping) => any;
  }>
>({});

export function ProductDetailsProvider({
  isDiscountItems,
  ...props
}: { isDiscountItems?: boolean } & ReactProps) {
  const [productCode, setProductCode] = useState<string>();
  const [editCartProductIndex, setEditCartProductIndex] = useState<number>();
  const [editCartProduct, setEditCartProduct] = useState<CartProduct>();
  const { cartProducts } = useCart();
  const {
    discountItems,
    discountItemGroups,
    selectedVoucher,
    orderInput,
    isGroup,
    isOffer,
  } = usePaymentContext();
  const router = useRouter();

  const removeQuery = () => {
    const url = new URL(location.href);
    url.searchParams.delete("product");
    url.searchParams.delete("editProduct");
    url.searchParams.delete("editDiscountProduct");
    router.replace(url.toString(), null, { shallow: true });
  };

  if (isDiscountItems) {
    useEffect(() => {
      if (router.query.editDiscountProduct) {
        let editIndex = Number(router.query.editDiscountProduct);
        setEditCartProductIndex(!isNaN(editIndex) ? editIndex : undefined);
      } else {
        setEditCartProductIndex(undefined);
      }
    }, [router.query.editDiscountProduct]);

    useEffect(() => {
      if (!isGroup) {
        if (
          discountItems &&
          editCartProductIndex >= 0 &&
          editCartProductIndex <= discountItems.length - 1
        ) {
          setEditCartProduct(discountItems[editCartProductIndex]);
        } else {
          setEditCartProduct(null);
          removeQuery();
        }
      } else {
        if (
          discountItemGroups &&
          editCartProductIndex >= 0 &&
          editCartProductIndex <= discountItemGroups[orderInput.offerGroupIndex].length - 1
        ) {
          setEditCartProduct(discountItemGroups[orderInput.offerGroupIndex][editCartProductIndex]);
        } else {
          setEditCartProduct(null);
          removeQuery();
        }
      }
    }, [editCartProductIndex]);
  } else {
    useEffect(() => {
      setProductCode(router.query.product?.toString() || "");
      if (router.query.editProduct) {
        let editIndex = Number(router.query.editProduct);
        setEditCartProductIndex(!isNaN(editIndex) ? editIndex : undefined);
      } else {
        setEditCartProductIndex(undefined);
      }
    }, [router.query.product, router.query.editProduct]);

    useEffect(() => {
      if (editCartProductIndex !== null && editCartProductIndex !== undefined) {
        if (
          cartProducts &&
          editCartProductIndex >= 0 &&
          editCartProductIndex <= cartProducts.length - 1
        ) {
          setEditCartProduct(cartProducts[editCartProductIndex]);
        } else {
          setEditCartProduct(null);
          removeQuery();
        }
      } else {
        setEditCartProduct(null);
      }
    }, [cartProducts, editCartProductIndex]);
  }

  const [product, setProduct] = useState<Product>();
  const [qty, setQty] = useState(1);
  const [dataTopping, setDataTopping] = useState<any>([]);
  const [toppings, setToppings] = useState<OrderItemToppingInput[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const toast = useToast();

  const loadProduct = () => {
    setProduct(null);
    if (!productCode && !editCartProduct) return;

    ProductService.getAll({
      fragment: ProductService.fullFragment,
      query: { limit: 1, filter: { code: productCode || editCartProduct?.product?.code } },
    })
      .then((res) => {
        if (res.data.length) {
          let newProduct = initProductToppings(
            res.data[0],
            editCartProduct ? editCartProduct.product : null
          );
          if (isDiscountItems) {
            if (isOffer) {
              newProduct.basePrice = 0;
            } else {
              newProduct.basePrice = selectedVoucher.samePrice;
            }
          }
          setProduct(newProduct);
        } else {
          toast.warn("Không tìm thấy sản phẩm");
          removeQuery();
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Không lấy được dữ liệu sản phẩm");
        removeQuery();
      });
  };

  const handleAddTopping = (data) => {
    let arr: OrderItemToppingInput[] = [];
    for (var item in data) {
      arr.push({ ...data[item] });
    }
    setToppings([...arr]);
  };

  const onToppingOptionClick = (option: ToppingOption, topping: ProductTopping) => {
    if (option.selected) {
      if (
        (topping.required && topping.selectedOptions.length == 1) ||
        topping.selectedOptions.length - 1 < topping.min ||
        !topping.selectedOptions.find((x) => x.name == option.name)
      ) {
        return;
      } else {
        option.selected = false;
        topping.selectedOptions = topping.selectedOptions.filter((x) => x.name != option.name);
      }
    } else {
      if (topping.max && topping.max == topping.selectedOptions.length) {
        topping.options.find((x) => x.name == topping.selectedOptions[0].name).selected = false;
        topping.selectedOptions = topping.selectedOptions.slice(1);
      }
      option.selected = true;
      topping.selectedOptions.push(option);
    }
    product.selectedToppings = product.toppings.reduce(
      (options, topping) => [
        ...options,
        ...topping.options
          .filter((x) => x.selected)
          .map((option) => ({
            toppingId: topping.id,
            toppingName: topping.name,
            optionName: option.name,
            price: option.price,
          })),
      ],
      []
    );
    setProduct({ ...product, toppings: [...product.toppings] });
  };

  const onChangeQuantity = (qty) => {
    setQty(qty);
  };

  const calculateTotalAmount = () => {
    if (product) {
      setTotalAmount(
        (product.basePrice +
          product.toppings.reduce(
            (total, topping) =>
              total +
              topping.options
                .filter((x) => x.selected)
                .reduce((toppingTotal, option) => toppingTotal + option.price, 0),
            0
          )) *
        qty
      );
    } else {
      setTotalAmount(0);
    }
  };

  useEffect(() => {
    handleAddTopping(dataTopping);
  }, [dataTopping]);

  useEffect(() => {
    calculateTotalAmount();
  }, [product, qty]);

  useEffect(() => {
    loadProduct();
  }, [productCode, editCartProduct]);

  return (
    <ProductDetailsContext.Provider
      value={{
        isDiscountItems,
        productCode,
        editCartProductIndex,
        cartProduct: editCartProduct,
        product,
        dataTopping,
        setDataTopping,
        totalAmount,
        qty,
        toppings,
        setQty,
        onChangeQuantity,
        onToppingOptionClick,
      }}
    >
      {props.children}
    </ProductDetailsContext.Provider>
  );
}

export const useProductDetailsContext = () => useContext(ProductDetailsContext);
