import cloneDeep from "lodash/cloneDeep";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initProductToppings } from "../../../../lib/helpers/product";
import { useDebounce } from "../../../../lib/hooks/useDebounce";
import { useMemoCompare } from "../../../../lib/hooks/useMemoCompare";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { CartProduct, useCart } from "../../../../lib/providers/cart-provider";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Order, OrderInput, OrderService } from "../../../../lib/repo/order.repo";
import { Product, ProductService } from "../../../../lib/repo/product.repo";
import { ShopVoucher, ShopVoucherService } from "../../../../lib/repo/shop-voucher.repo";
import { PaymentSuccessDialog } from "../components/payment-success-dialog";

export type DiscountCartItem = { selected: boolean } & CartProduct;
export const PaymentContext = createContext<
  Partial<{
    draftOrder?: { invalid: boolean; invalidReason: string; order: Order };
    orderInput?: OrderInput;
    setOrderInput?: (val: OrderInput) => any;
    generateOrder: () => Promise<any>;
    generateDraftOrder: Function;
    vouchers: ShopVoucher[];
    selectedVoucher: ShopVoucher;
    setSelectedVoucher: (val: ShopVoucher) => any;
    discountItems: DiscountCartItem[];
    setDiscountItems: (val: DiscountCartItem[]) => any;
    discountItemGroups: DiscountCartItem[][];
    setDiscountItemGroups: (val: DiscountCartItem[][]) => any;
    updateDiscountItem: (product: Product, qty: number, note: string, index: number) => any;
    changeDiscountItemQuantity: (index: number, qty: number, note?: string) => any;
    openVoucherItemsDialog: boolean;
    setOpenVoucherItemsDialog: (val: boolean) => any;
    groupIndexSelected: number;
    setGroupIndexSelected: Function;
    isDiscountItems: boolean;
    isOffer: boolean;
    isGroup: boolean;
    order: Order;
    setOrder: (val: Order) => any;
    isSubmitting: boolean;
    isSubmittingDraft: boolean;
    openDialog: boolean;
    setOpenDialog: (val: boolean) => any;
  }>
>({});
export function PaymentProvider(props) {
  const [draftOrder, setDraftOrder] = useState<{
    invalid: boolean;
    invalidReason: string;
    order: Order;
  }>({
    invalid: true,
    invalidReason: "",
    order: null,
  });

  const [vouchers, setVouchers] = useState<ShopVoucher[]>();
  const { selectedBranch, customer, shopTable } = useShopContext();
  const { userLocation, openLocation } = useLocation();
  const { cartProducts, reOrderInput, loadCart } = useCart();
  const [selectedVoucher, setSelectedVoucher] = useState<ShopVoucher>();
  const [discountItems, setDiscountItems] = useState<DiscountCartItem[]>();
  const [discountItemGroups, setDiscountItemGroups] = useState<DiscountCartItem[][]>();
  const [openVoucherItemsDialog, setOpenVoucherItemsDialog] = useState(false);
  const [order, setOrder] = useState<Order>();
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allProductSamePrice, setAllProductSamePrice] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const router = useRouter();

  let [orderInput, setOrderInput] = useState<OrderInput>({
    buyerName: "",
    buyerPhone: "",
    pickupMethod: "DELIVERY",
    shopBranchId: "",
    pickupTime: "",
    buyerFullAddress: "",
    buyerAddressNote: "",
    latitude: 0,
    longitude: 0,
    useRewardPoint: false,
    paymentMethod: "COD",
    note: "",
    promotionCode: "",
    customerVoucherId: "",
    offerGroupIndex: 0,
  });
  const toast = useToast();

  const isDiscountItems = useMemo(
    () =>
      selectedVoucher?.type == "OFFER_ITEM" ||
      selectedVoucher?.type == "OFFER_ITEM_2" ||
      selectedVoucher?.type == "SAME_PRICE" ||
      selectedVoucher?.type == "SAME_PRICE_2",
    [selectedVoucher]
  );
  const isOffer = useMemo(
    () => selectedVoucher?.type == "OFFER_ITEM" || selectedVoucher?.type == "OFFER_ITEM_2",
    [selectedVoucher]
  );
  const isGroup = useMemo(
    () => selectedVoucher?.type == "SAME_PRICE_2" || selectedVoucher?.type == "OFFER_ITEM_2",
    [selectedVoucher]
  );

  const getOrderInput = () => {
    let newOrderInput = { ...orderInput };
    newOrderInput.items = [];

    cartProducts?.forEach((cartProduct) => {
      newOrderInput.items.push({
        productId: cartProduct.productId,
        quantity: cartProduct.qty,
        note: cartProduct.note,
        toppings: cartProduct.product.selectedToppings,
      });
    });
    if (isDiscountItems) {
      const selectedDiscountItems = isGroup
        ? discountItemGroups.flat().filter((x) => x.selected)
        : discountItems?.filter((x) => x.selected);
      if (selectedDiscountItems.length) {
        newOrderInput.offerItemIds = selectedDiscountItems?.map((x) => x.productId);
        selectedDiscountItems?.forEach((cartProduct) => {
          newOrderInput.items.push({
            productId: cartProduct.productId,
            quantity: cartProduct.qty,
            note: cartProduct.note,
            toppings: cartProduct.product.selectedToppings,
          });
        });
      }
    }
    return newOrderInput;
  };
  const generateDraftOrder = () => {
    setIsSubmittingDraft(true);
    OrderService.generateDraftOrder(getOrderInput())
      .then((res) => {
        setDraftOrder(cloneDeep(res));
        setIsSubmittingDraft(false);
      })
      .catch((err) => { });
  };

  const generateOrder = async () => {
    if (draftOrder?.invalidReason) {
      toast.error(draftOrder.invalidReason);
      return;
    }

    if (!cartProducts?.length) {
      toast.error("Chưa có sản phẩm trong giỏ hàng");
      return;
    }
    if (!orderInput.shopBranchId) {
      toast.error("Chưa chọn cửa hàng");
      return;
    }
    if (!orderInput.buyerName) {
      toast.error("Chưa nhập tên người nhận");
      return;
    }
    if (!orderInput.pickupMethod) {
      toast.error("Chưa chọn phương thức nhận");
      return;
    }
    if (!orderInput.buyerPhone) {
      toast.error("Chưa nhập số điện thoại");
      return;
    }
    if (orderInput.pickupMethod == "DELIVERY" && !orderInput.buyerFullAddress) {
      toast.error("Chưa nhập địa chỉ giao hàng");
      return;
    }
    let dayCur = new Date();
    let datePickup = new Date(orderInput.pickupTime);

    if (orderInput.pickupMethod == "STORE" && datePickup < dayCur) {
      toast.error("Thời gian nhận hàng không hợp lệ");
      return;
    }

    if (
      isDiscountItems &&
      ((isGroup && !discountItemGroups.flat().filter((x) => x.selected)?.length) ||
        (!isGroup && !discountItems.filter((x) => x.selected)?.length))
    ) {
      toast.error("Chưa chọn sản phẩm khuyến mãi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await OrderService.generateOrder(getOrderInput());
      setOrder(res);
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      toast.error("Đặt hàng không thành công. " + err.message);
    }
  };
  useEffect(() => {
    ProductService.getAll({
      fragment: ProductService.fullFragment,
      query: {
        limit: 0,
      },
    }).then((res) => {
      setAllProductSamePrice(res.data);
    });
  }, [selectedVoucher]);

  useEffect(() => {
    setDiscountItems(null);
    setDiscountItemGroups(null);
    if (selectedVoucher) {
      if (isDiscountItems) {
        loadDiscountItems();
        if (!selectedVoucher.autoAddOfferItem) {
          setOpenVoucherItemsDialog(true);
        } else if (selectedVoucher.offerAllItem) {
          setOpenVoucherItemsDialog(true);
        }
      }

      setOrderInput({ ...orderInput, promotionCode: selectedVoucher.code, offerGroupIndex: 0 });
    } else {
      setOrderInput({ ...orderInput, promotionCode: undefined, offerGroupIndex: 0 });
    }
  }, [selectedVoucher]);

  const loadDiscountItems = () => {
    const ids = isGroup
      ? isOffer
        ? selectedVoucher.offerItemGroups.reduce(
          (items, group) => [...items, ...group.map((x) => x?.productId)],
          []
        )
        : selectedVoucher.offerItemGroups2.reduce(
          (items, group) => [...items, ...group.items.map((x) => x?.productId)],
          []
        )
      : selectedVoucher.offerItems.map((x) => x?.productId);
    ProductService.getAll({
      fragment: ProductService.fullFragment,
      query: {
        filter: {
          _id: { $in: ids },
        },
      },
    })
      .then((res) => {
        const items = res.data;
        if (items?.length) {
          if (isGroup) {
            let discountItemGroups: DiscountCartItem[][] = (isOffer
              ? selectedVoucher.offerItemGroups
              : selectedVoucher.offerItemGroups2
            ).map((group) =>
              (isOffer ? group : group.items).map((offerItem) => {
                let newProduct = initProductToppings({
                  ...items.find((x) => x.id == offerItem.productId),
                });
                let price =
                  (isDiscountItems
                    ? isOffer
                      ? 0
                      : group.samePrice < newProduct.basePrice
                        ? group.samePrice
                        : newProduct.basePrice
                    : newProduct.basePrice) +
                  newProduct?.selectedToppings?.reduce((total, topping) => total + topping.price, 0);

                const qty = isOffer ? offerItem.qty : 1;
                return {
                  productId: newProduct.id,
                  product: newProduct,
                  qty,
                  price: price,
                  amount: price * qty,
                  note: "",
                  selected:
                    selectedVoucher.type === "SAME_PRICE" && selectedVoucher.autoAddOfferItem
                      ? true
                      : false,
                };
              })
            );
            setDiscountItemGroups(discountItemGroups);
          } else {
            if (ids.length && selectedVoucher.offerAllItem) {
              let discountItems = allProductSamePrice?.map((product) => {
                let newProduct = initProductToppings(product);
                let price =
                  (isDiscountItems
                    ? isOffer
                      ? 0
                      : selectedVoucher.samePrice < newProduct.basePrice
                        ? selectedVoucher.samePrice
                        : newProduct.basePrice
                    : newProduct.basePrice) +
                  newProduct?.selectedToppings?.reduce((total, topping) => total + topping.price, 0);
                const qty = isOffer ? product.qty : 1;
                return {
                  productId: product.id,
                  product: product,
                  qty,
                  price: price,
                  amount: price * qty,
                  note: "",
                  selected: false,
                };
              });

              if (selectedVoucher.offerHighestPrice == true) {
                let sortBasePrice = discountItems.sort(
                  (a, b) => b.product.basePrice - a.product.basePrice
                );

                setDiscountItems(sortBasePrice);
              } else {
                setDiscountItems(discountItems);
              }
            } else {
              let discountItems = selectedVoucher.offerItems?.map((offerItem) => {
                let newProduct = initProductToppings({
                  ...items.find((x) => x.id == offerItem.productId),
                });
                let price =
                  (isDiscountItems
                    ? isOffer
                      ? 0
                      : selectedVoucher.samePrice < newProduct.basePrice
                        ? selectedVoucher.samePrice
                        : newProduct.basePrice
                    : newProduct.basePrice) +
                  newProduct?.selectedToppings?.reduce((total, topping) => total + topping.price, 0);
                const qty = isOffer ? offerItem.qty : 1;
                return {
                  productId: newProduct.id,
                  product: newProduct,
                  qty,
                  price: price,
                  amount: price * qty,
                  note: "",
                  selected:
                    selectedVoucher.type === "SAME_PRICE" && selectedVoucher.autoAddOfferItem
                      ? true
                      : false,
                };
              });
              setDiscountItems(discountItems);
            }
          }
        } else {
          // setDiscountItemGroups([]);
          // setDiscountItems([]);
          let discountItems = allProductSamePrice?.map((product) => {
            let newProduct = initProductToppings(product);
            let price =
              (isDiscountItems
                ? isOffer
                  ? 0
                  : selectedVoucher.samePrice < newProduct.basePrice
                    ? selectedVoucher.samePrice
                    : newProduct.basePrice
                : newProduct.basePrice) +
              newProduct?.selectedToppings?.reduce((total, topping) => total + topping.price, 0);
            const qty = isOffer ? product.qty : 1;
            return {
              productId: product.id,
              product: product,
              qty,
              price: price,
              amount: price * qty,
              note: "",
              selected: false,
            };
          });

          if (selectedVoucher.offerHighestPrice == true) {
            let sortBasePrice = discountItems.sort(
              (a, b) => b.product.basePrice - a.product.basePrice
            );

            setDiscountItems(sortBasePrice);
          } else {
            setDiscountItems(discountItems);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Có lỗi xảy ra khi lấy danh sách sản phẩm");
        setSelectedVoucher(null);
      });
  };

  function updateDiscountItem(product: Product, qty: number, note: string, index: number) {
    let price =
      product.basePrice +
      product.selectedToppings.reduce((total, topping) => total + topping.price, 0);

    if (isGroup) {
      discountItemGroups[orderInput.offerGroupIndex][index] = {
        productId: product.id,
        product: product,
        qty,
        price: price,
        amount: price * qty,
        note,
        selected: true,
      };
      setDiscountItemGroups([...discountItemGroups]);
    } else {
      discountItems[index] = {
        productId: product.id,
        product: product,
        qty,
        price: price,
        amount: price * qty,
        note,
        selected: true,
      };
      setDiscountItems([...discountItems]);
    }
  }

  const changeDiscountItemQuantity = (index: number, qty: number, note?: string) => {
    if (index < 0 || index >= discountItems?.length) return;

    const groupIndex = orderInput.offerGroupIndex;
    const offerItem = isGroup
      ? isOffer
        ? selectedVoucher.offerItemGroups[groupIndex][index]
        : selectedVoucher.offerItemGroups2[groupIndex].items[index]
      : selectedVoucher.offerItems[index];
    const discountItem = isGroup
      ? discountItemGroups[orderInput.offerGroupIndex][index]
      : discountItems[index];

    if (qty) {
      if (qty > offerItem?.qty) {
        toast.info(`Sản phẩm này được chọn tối đa ${offerItem.qty} sản phẩm`);
        return;
      }
      if (qty > selectedVoucher?.offerQty) {
        toast.info(`Sản phẩm này được chọn tối đa ${selectedVoucher.offerQty} sản phẩm`);
        return;
      }
      if (discountItem) {
        discountItem.qty = qty;
        discountItem.amount = discountItem.price * qty;
        discountItem.note = note;
      }
    } else {
      discountItem.selected = false;
    }

    if (isGroup) {
      setDiscountItemGroups([...discountItemGroups]);
    } else {
      setDiscountItems([...discountItems]);
    }
  };

  useEffect(() => {
    if (reOrderInput) {
      setOrderInput(cloneDeep(reOrderInput));
    }
  }, [reOrderInput]);
  let debouncedInput = useDebounce(orderInput, 300);
  const memoizedInput = useMemoCompare(debouncedInput);

  useEffect(() => {
    if (
      memoizedInput &&
      memoizedInput.shopBranchId &&
      (memoizedInput.pickupMethod === "STORE" || memoizedInput.buyerFullAddress) &&
      !openVoucherItemsDialog &&
      !order
    ) {
      generateDraftOrder();
    }
    if (router.pathname.startsWith("/shop/pos")) {
      if (
        memoizedInput &&
        memoizedInput.shopBranchId &&
        (memoizedInput.pickupMethod === "DELIVERY" || memoizedInput.buyerFullAddress) &&
        !openVoucherItemsDialog &&
        !order
      ) {
        generateDraftOrder();
      }
    }
    if (!cartProducts?.length) {
      setSelectedVoucher(null);
    }
  }, [memoizedInput, cartProducts, discountItems, discountItemGroups, openVoucherItemsDialog]);

  useEffect(() => {
    if (selectedBranch) {
      orderInput = { ...orderInput, shopBranchId: selectedBranch.id };
      setOrderInput(orderInput);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (!customer) return;
    const buyerFullAddress = userLocation?.fullAddress || customer?.fullAddress;
    orderInput = {
      ...orderInput,
      buyerName: customer.name || "",
      buyerPhone: customer.phone,
      buyerFullAddress,
      buyerAddressNote: customer.addressNote || "",
      latitude: userLocation?.lat || customer.latitude || 0,
      longitude: userLocation?.lng || customer.longitude || 0,
    };
    setOrderInput(orderInput);
    if (!buyerFullAddress) {
      openLocation(true);
    }
  }, [customer]);

  function loadVouchers() {
    ShopVoucherService.getAll({
      query: { order: { createdAt: -1 }, filter: { isPrivate: false, isActive: true } },
      fragment: ShopVoucherService.fullFragment,
      cache: false,
    })
      .then((res) => setVouchers(cloneDeep(res.data)))
      .catch((err) => setVouchers(null));
  }

  useEffect(() => {
    if (shopTable) {
      orderInput = {
        ...orderInput,
        pickupMethod: "STORE",
        shopBranchId: shopTable.branchId,
        tableCode: shopTable.code,
      };
      setOrderInput(orderInput);
    }
  }, [shopTable]);

  useEffect(() => {
    loadCart();
    loadVouchers();
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        draftOrder: draftOrder,
        orderInput,
        setOrderInput,
        generateOrder,
        generateDraftOrder,
        vouchers,
        selectedVoucher,
        setSelectedVoucher,
        discountItems,
        setDiscountItems,
        discountItemGroups,
        setDiscountItemGroups,
        updateDiscountItem,
        changeDiscountItemQuantity,
        openVoucherItemsDialog,
        setOpenVoucherItemsDialog,
        isDiscountItems,
        isGroup,
        isOffer,
        order,
        setOrder,
        isSubmitting,
        isSubmittingDraft,
        openDialog,
        setOpenDialog,
      }}
    >
      {props.children}
      <PaymentSuccessDialog isOpen={order ? true : false} order={order} />
    </PaymentContext.Provider>
  );
}

export const usePaymentContext = () => useContext(PaymentContext);
