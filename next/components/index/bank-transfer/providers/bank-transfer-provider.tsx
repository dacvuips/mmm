import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { Order, OrderService } from "../../../../lib/repo/order.repo";
import { useShopContext } from "../../../../lib/providers/shop-provider";

export const WaitingPayContext = createContext<
  Partial<{
    order?: Order;
    orders?: Order[];
    cancelOrder?: (id: string) => Promise<any>;
    redirectToWebApp?: () => void;
    loadAllOrder?: () => void;
    loadOneOrder?: () => void;
    redirectToOrder?: (code: string) => void;
    markTransferComplete?: () => Promise<any>;
  }>
>({});

export function BankTransferProvider(props) {
  const router = useRouter();
  const { id } = props;
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order>();
  const { customer, shopCode } = useShopContext();

  const loadOneOrder = async () => {
    if (id)
      await OrderService.getOne({
        id: id,
        cache: false,
      })
        .then((res) => {
          setOrder(res);
        })
        .catch((err) => {
          console.error(err);
        });
  };

  const markTransferComplete = () => {
    return OrderService.markTransferComplete();
  };

  useEffect(() => {
    loadOneOrder();
  }, [id]);
  // useEffect(() => {
  //   let pathname = router.pathname;
  //   if (
  //     orders &&
  //     orders[0]?.status == "PENDING" &&
  //     orders[0]?.paymentStatus == "pending" &&
  //     pathname !== `/[code]/waiting-pay`
  //   ) {
  //     redirectToWaitingPay();
  //   }
  // }, [orders || router.pathname]);
  const redirectToOrder = (code: string) => {
    router.push(`/${shopCode}/order/${code}`);
  };
  const redirectToWaitingPay = () => {
    router.push(`/${shopCode}/waiting-pay`);
  };
  const redirectToWebApp = () => {
    router.push(`/${shopCode}`);
  };

  const cancelOrder = (id: string, note?: string) => {
    return OrderService.cancelOrder(id, note);
  };

  return (
    <WaitingPayContext.Provider
      value={{
        order,
        orders,
        cancelOrder,
        redirectToWebApp,
        markTransferComplete,
        redirectToOrder,
        loadOneOrder,
      }}
    >
      {props.children}
    </WaitingPayContext.Provider>
  );
}

export const useBankTransfer = () => useContext(WaitingPayContext);
