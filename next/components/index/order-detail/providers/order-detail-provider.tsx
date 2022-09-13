import { createContext, useContext, useEffect, useState } from "react";
import { Order, OrderService, ORDER_STATUS, OrderItem } from "../../../../lib/repo/order.repo";
import cloneDeep from "lodash/cloneDeep";
import { useAlert } from "../../../../lib/providers/alert-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { useRouter } from "next/router";
import { ShopTag } from "../../../../lib/repo/shop-config.repo";
import { ShopCommentService } from "../../../../lib/repo/shop-comment.repo";
import { useCart, CartProduct } from "../../../../lib/providers/cart-provider";
import { useShopContext } from "../../../../lib/providers/shop-provider";

export const OrderDetailContext = createContext<
  Partial<{
    order: Order;
    status: Option;
    loading: boolean;
    setLoading: Function;
    isInterval: boolean;
    showComment: boolean;
    setShowComment: Function;
    tags: ShopTag[];
    listDiscount: OrderItem[];
    listItems: OrderItem[];
    discountByPoint: number;
    // cancelOrder: (id: string, note: string) => any;
    addTags: (tag: ShopTag) => any;
    commentOrder: (inputData: { message: string; rating: number; images: string[] }) => any;
    reOrderClick: () => any;
  }>
>({});
interface PropsType extends ReactProps {
  id: string;
}
export function OrderDetailProvider({ id, ...props }: PropsType) {
  const { shopCode, customer } = useShopContext();
  const { reOrder } = useCart();
  const [showComment, setShowComment] = useState(false);
  const [order, setOrder] = useState<Order>(null);
  const [discountByPoint, setDiscountByPoint] = useState(0);
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Option>(null);
  const [isInterval, setIsInterval] = useState(false);
  let [listDiscount, setListDiscount] = useState<OrderItem[]>([]);
  let [listItems, setListItems] = useState<OrderItem[]>([]);
  const [tags, setTags] = useState<ShopTag[]>([]);
  const toast = useToast();
  const router = useRouter();
  function addTags(tag: ShopTag) {
    let newTags = tags;
    let tI = newTags.findIndex((t) => t.name === tag.name);
    if (tI !== -1) {
      newTags.splice(tI, 1);
    } else {
      newTags.push({ name: tag.name, icon: tag.icon, qty: tag.qty });
    }
    setTags(cloneDeep(newTags));
  }
  function commentOrder(inputData: { message: string; rating: number; images: string[] }) {
    const { message, rating, images } = inputData;
    ShopCommentService.mutate({
      mutation: `
      commentOrder( orderId:$orderId
        message:$message
        rating:$rating
        tags:$tags
        images: $images
      )`,
      variablesParams: `( $orderId:ID!
        $message:String!
        $rating:Int!
        $tags:[ShopTagInput]!
        $images: [String])`,
      options: {
        variables: {
          orderId: order.id,
          message,
          rating,
          tags,
          images,
        },
      },
    }).then((res) => {
      toast.success(res.data.g0);
      loadOrder(id);
    });
  }
  const orderStream = OrderService.subscribeOrder();

  useEffect(() => {
    if (orderStream && orderStream.id == id) {
      const res = orderStream;
      if (res !== order) {
        setOrder(cloneDeep(res));
        if (
          res.pickupMethod === "DELIVERY" &&
          (res.status === "PENDING" || res.status === "CONFIRMED" || res.status === "DELIVERING")
        ) {
          setIsInterval(true);
        }
        let point = res.discountLogs.find((item) => item.type === "USE_REWARD_POINT");
        if (point) {
          setDiscountByPoint(point.discount);
        }
        listItems = [...res.items];
        listDiscount = [];
        res.discountLogs.forEach((item) => {
          let found = listItems.find(
            (od) => od.productId === item.productId && od.qty === item.offerQty
          );
          let last = listItems.lastIndexOf(found);
          if (found) {
            listDiscount.push(listItems[last]);
            listItems.splice(last, 1);
          }
        });
        setListDiscount(cloneDeep(listDiscount));
        setListItems(cloneDeep(listItems));
        setOrder(cloneDeep(res));
      }
    } else {
      loadOrder(id);
    }
  }, [orderStream]);

  // useEffect(() => {
  //   // loadOrder(id);
  //   // let interval = setInterval(() => {
  //   //   OrderService.getOne({ id, cache: false })
  //   //     .then((res) => {
  //   //       setOrder(cloneDeep(res));
  //   //       if (
  //   //         res.status !== "PENDING" &&
  //   //         res.status !== "CONFIRMED" &&
  //   //         res.status !== "DELIVERING"
  //   //       ) {
  //   //         setIsInterval(false);
  //   //         clearInterval(interval);
  //   //       } else {
  //   //         if (status && res.status !== status.value) {
  //   //           toast.info(res.statusText);
  //   //         }
  //   //       }
  //   //     })
  //   //     .catch(async (err) => {
  //   //       console.error(err);
  //   //       let res = await alert.error("Xem chi tiết đơn hàng thất bại", err.message);
  //   //       if (res) {
  //   //         setIsInterval(false);
  //   //         clearInterval(interval);
  //   //         if (customer) {
  //   //           router.replace("/order");
  //   //         } else {
  //   //           router.replace(`/${shopCode}`);
  //   //         }
  //   //       }
  //   //     });
  //   // }, 3000);
  //   // return () => {
  //   //   clearInterval(interval);
  //   // };
  //   let interval = setInterval(() => {
  //     OrderService.getOne({ id, cache: false })
  //       .then((res) => {
  //         if (res !== order) {
  //           setOrder(cloneDeep(res));
  //           if (
  //             res.pickupMethod === "DELIVERY" &&
  //             (res.status === "PENDING" ||
  //               res.status === "CONFIRMED" ||
  //               res.status === "DELIVERING")
  //           ) {
  //             setIsInterval(true);
  //           }
  //           let point = res.discountLogs.find((item) => item.type === "USE_REWARD_POINT");
  //           if (point) {
  //             setDiscountByPoint(point.discount);
  //           }
  //           listItems = [...res.items];
  //           listDiscount = [];
  //           res.discountLogs.forEach((item) => {
  //             let found = listItems.find(
  //               (od) => od.productId === item.productId && od.qty === item.offerQty
  //             );
  //             let last = listItems.lastIndexOf(found);
  //             if (found) {
  //               listDiscount.push(listItems[last]);
  //               listItems.splice(last, 1);
  //             }
  //           });
  //           setListDiscount(cloneDeep(listDiscount));
  //           setListItems(cloneDeep(listItems));
  //           setOrder(cloneDeep(res));
  //         }
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         alert.error("Xem chi tiết đơn hàng thất bại", err.message);
  //       });
  //   }, 3000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);
  useEffect(() => {
    if (order) {
      let sta = ORDER_STATUS.find((x) => x.value === order.status);
      if (sta) setStatus(cloneDeep(sta));
    }
  }, [order]);

  const loadOrder = (id: string) => {
    OrderService.getOne({ id, cache: false })
      .then((res) => {
        if (
          res.pickupMethod === "DELIVERY" &&
          (res.status === "PENDING" || res.status === "CONFIRMED" || res.status === "DELIVERING")
        ) {
          setIsInterval(true);
        }
        let point = res.discountLogs.find((item) => item.type === "USE_REWARD_POINT");
        if (point) {
          setDiscountByPoint(point.discount);
        }
        listItems = [...res.items];
        listDiscount = [];
        res.discountLogs.forEach((item) => {
          let found = listItems.find((od) => od.productId === item.productId);
          let last = listItems.lastIndexOf(found);
          if (found) {
            listDiscount.push(listItems[last]);
            listItems.splice(last, 1);
          }
        });
        setListDiscount(cloneDeep(listDiscount));
        setListItems(cloneDeep(listItems));
        setOrder(cloneDeep(res));
      })
      .catch((err) => {
        console.error(err);
        alert.error("Xem chi tiết đơn hàng thất bại", err.message);
      });
  };
  function reOrderClick() {
    const {
      promotionCode,
      buyerName,
      buyerPhone,
      pickupMethod,
      shopBranchId,
      pickupTime,
      buyerAddress,
      buyerProvinceId,
      buyerDistrictId,
      buyerWardId,
      buyerFullAddress,
      buyerAddressNote,
      latitude,
      longitude,
      discountByPoint,
      paymentMethod,
      note,
    } = order;

    // toppingId: string;
    // toppingName: string;
    // optionName: string;
    // price: number;
    reOrder(order.items, {
      promotionCode,
      buyerName,
      buyerPhone,
      pickupMethod,
      shopBranchId,
      pickupTime,
      buyerAddress,
      buyerProvinceId,
      buyerDistrictId,
      buyerWardId,
      buyerFullAddress,
      buyerAddressNote,
      latitude,
      longitude,
      paymentMethod,
      note,
    });
  }
  return (
    <OrderDetailContext.Provider
      value={{
        order,
        status,
        loading,
        setLoading,
        // cancelOrder,
        isInterval,
        tags,
        addTags,
        commentOrder,
        reOrderClick,
        showComment,
        setShowComment,
        listDiscount,
        listItems,
        discountByPoint,
      }}
    >
      {props.children}
    </OrderDetailContext.Provider>
  );
}

export const useOrderDetailContext = () => useContext(OrderDetailContext);
export const OrderConsumer = ({
  children,
}: {
  children: (props: Partial<{ order: Order }>) => any;
}) => {
  return <OrderDetailContext.Consumer>{children}</OrderDetailContext.Consumer>;
};
