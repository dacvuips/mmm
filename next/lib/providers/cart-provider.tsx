import cloneDeep from "lodash/cloneDeep";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ProductDetailsDialogDesktop } from "../../components/shared/product-details-desktop/product-details-dialog-desktop";
import { ProductDetailsDialog } from "../../components/shared/product-details/product-details-dialog";
import { ProductDetailsProvider } from "../../components/shared/product-details/product-details-provider";
import { useScreen } from "../hooks/useScreen";
import { OrderInput, OrderItem } from "../repo/order.repo";
import { OrderItemToppingInput } from "../repo/product-topping.repo";
import { Product, ProductService } from "../repo/product.repo";
import { useShopContext } from "./shop-provider";

export const CartContext = createContext<
  Partial<{
    reOrderInput?: OrderInput;
    clearCartProducts: () => void;
    totalQty: number;
    totalAmount: number;
    cartProducts: CartProduct[];
    addProductToCart: (product: Product, qty: number, note: string) => any;
    changeProductQuantity: (productIndex: number, qty: number) => any;
    removeProductFromCart: (productIndex: number) => any;
    reOrder: (items: OrderItem[], reOderInput: OrderInput) => any;
    upsaleProducts: Product[];
    addToCartNoTopping: (product: Product, qty: number) => any;
    updateCartProduct: (product: Product, qty: number, note: string, index: number) => any;
    loadCart: () => void;
    editProductIndex: number;
  }>
>({});
export interface CartProduct {
  productId: string;
  product?: Product;
  note?: string;
  qty: number;
  price?: number;
  amount?: number;
  topping?: OrderItemToppingInput[];
}

export function CartProvider(props) {
  const screenLg = useScreen("lg");
  const { shopCode } = useShopContext();
  const router = useRouter();
  let [cartProducts, setCartProducts] = useState<CartProduct[]>();
  const [upsaleProducts, setUpsaleProducts] = useState<Product[]>([]);

  const totalQty = useMemo(() => {
    return cartProducts?.reduce((count, item) => (count += item.qty), 0) || 0;
  }, [cartProducts]);
  const totalAmount = useMemo(() => {
    return cartProducts?.reduce((count, item) => (count += item.amount), 0) || 0;
  }, [cartProducts]);

  let [reOrderInput, setReOrderInput] = useState<OrderInput>();

  function loadCart() {
    let storageCartProducts: CartProduct[] = JSON.parse(
      localStorage.getItem(shopCode + "-cart-products")
    );
    if (storageCartProducts) {
      ProductService.getAll({
        query: {
          limit: 0,
          filter: {
            _id: { __in: storageCartProducts.map((x) => x.productId) },
          },
        },
        cache: false,
      })
        .then((res) => {
          let cartProducts = [];
          if (res.data) {
            storageCartProducts.forEach((cartProduct) => {
              const product = res.data.find((x) => x.id === cartProduct.productId);
              if (product) {
                let isValid = true;
                for (let cartProductTopping of cartProduct.product
                  .selectedToppings as OrderItemToppingInput[]) {
                  const topping = product.toppings.find(
                    (x) => x.id == cartProductTopping.toppingId
                  );
                  if (!topping) {
                    isValid = false;
                    break;
                  } else {
                    const option = topping.options.find(
                      (x) => x.name == cartProductTopping.optionName
                    );
                    if (!option || option.price != cartProductTopping.price) {
                      isValid = false;
                      break;
                    }
                  }
                }
                if (isValid) {
                  let price =
                    product.basePrice +
                    cartProduct.product.selectedToppings.reduce(
                      (total, topping) => total + topping.price,
                      0
                    );
                  cartProducts.push({
                    ...cartProduct,
                    price: price,
                    amount: price * cartProduct.qty,
                    product: {
                      ...product,
                      selectedToppings: cartProduct.product.selectedToppings,
                      toppings: cartProduct.product.toppings,
                    },
                  });
                }
              }
            });
          }
          setCartProducts(cartProducts);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      setCartProducts([]);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const addProductToCart = (product: Product, qty: number, note: string): boolean => {
    if (!qty) return false;
    let productIndex = cartProducts.findIndex(
      (x) =>
        x.productId == product.id &&
        JSON.stringify(x.product.selectedToppings) == JSON.stringify(product.selectedToppings)
    );
    if (productIndex >= 0) {
      changeProductQuantity(productIndex, cartProducts[productIndex].qty + qty, note);
    } else {
      let price =
        product.basePrice +
        product.selectedToppings.reduce((total, topping) => total + topping.price, 0);
      cartProducts.push({
        productId: product.id,
        product: product,
        qty,
        price: price,
        amount: price * qty,
        note: note,
      });
    }
    setCartProducts([...cartProducts]);
    return true;
  };

  const addToCartNoTopping = (product: Product, qty: number) => {
    cartProducts.push({
      productId: product.id,
      product: { ...product, selectedToppings: [] },
      qty,
      price: product.basePrice,
      amount: product.basePrice * qty,
    });
    setCartProducts([...cartProducts]);
  };

  const changeProductQuantity = (productIndex: number, qty: number, note?: string) => {
    if (productIndex < 0 || productIndex >= cartProducts.length) return;

    if (qty) {
      cartProducts[productIndex].qty = qty;
      cartProducts[productIndex].amount = cartProducts[productIndex].price * qty;
      if (note) {
        cartProducts[productIndex].note = note;
      }
      setCartProducts([...cartProducts]);
    } else {
      removeProductFromCart(productIndex);
    }
  };

  function updateCartProduct(product: Product, qty: number, note: string, index: number) {
    let price =
      product.basePrice +
      product.selectedToppings.reduce((total, topping) => total + topping.price, 0);
    cartProducts[index] = {
      productId: product.id,
      product: product,
      qty: qty,
      price: price,
      amount: price * qty,
      note: note,
    };
    setCartProducts(cloneDeep(cartProducts));
  }

  const removeProductFromCart = (productIndex: number) => {
    if (productIndex >= 0) {
      cartProducts.splice(productIndex, 1);
      setCartProducts([...cartProducts]);
    }
  };

  const reOrder = (items: OrderItem[], reOderInput: OrderInput) => {
    let resCartProducts = [...items];
    setReOrderInput(cloneDeep(reOderInput));
    if (resCartProducts) {
      // lấy danh sách product mua lại
      ProductService.getAll({
        query: {
          limit: 0,
          filter: {
            _id: { __in: resCartProducts.map((x) => x.productId) },
          },
        },
      }).then((res) => {
        let listCartNew = cartProducts;

        resCartProducts.forEach((reCartProduct) => {
          let { __typename, ...product } = res.data.find((x) => x.id == reCartProduct.productId);
          if (product) {
            let index = listCartNew.findIndex((x) => x.productId == product.id);
            if (index !== -1) {
              listCartNew.splice(index, 1);
            }
            let price = product.basePrice;
            if (reCartProduct.toppings) {
              price += reCartProduct.toppings.reduce((total, topping) => total + topping.price, 0);
              product.selectedToppings = reCartProduct.toppings.map(
                (item: OrderItemToppingInput) => {
                  return {
                    toppingId: item.toppingId,
                    toppingName: item.toppingName,
                    optionName: item.optionName,
                    price: item.price,
                  };
                }
              );
            }
            listCartNew = [
              {
                productId: product.id,
                product: product,
                qty: reCartProduct.qty,
                price: price,
                amount: price * reCartProduct.qty,
                note: reCartProduct.note,
                topping: reCartProduct.toppings,
              },
              ...listCartNew,
            ];
          }
        });
        setCartProducts([...listCartNew]);
      });

      router.push(`/${shopCode}/payment`);
    }
  };

  function clearCartProducts() {
    setCartProducts([]);
  }

  useEffect(() => {
    if (cartProducts) {
      localStorage.setItem(shopCode + "-cart-products", JSON.stringify(cartProducts));
      loadUpsaleProducts();
    } else {
      localStorage.removeItem(shopCode + "-cart-products");
      setUpsaleProducts([]);
    }
  }, [cartProducts]);

  const loadUpsaleProducts = () => {
    let productIds = [];
    cartProducts.forEach((cartProduct) => {
      if (cartProduct.product?.upsaleProductIds?.length > 0) {
        cartProduct.product.upsaleProductIds.forEach((id) => {
          productIds.push(id);
        });
      }
    });
    productIds = productIds.filter((x) => !cartProducts.find((y) => y.productId == x));
    if (productIds.length) {
      ProductService.getAll({
        query: {
          limit: 0,
          filter: {
            _id: { __in: productIds },
          },
        },
      }).then((res) => setUpsaleProducts(res.data));
    }
  };

  return (
    <CartContext.Provider
      value={{
        clearCartProducts,
        reOrder,
        reOrderInput,
        totalQty,
        totalAmount,
        cartProducts,
        addProductToCart,
        removeProductFromCart,
        changeProductQuantity,
        upsaleProducts,
        addToCartNoTopping,
        loadCart,
        updateCartProduct,
      }}
    >
      {props.children}
      <ProductDetailsProvider>
        {screenLg ? <ProductDetailsDialogDesktop /> : <ProductDetailsDialog />}
      </ProductDetailsProvider>
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
