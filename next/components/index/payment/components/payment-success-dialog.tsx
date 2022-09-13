import { useEffect, useState } from "react";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Img } from "../../../shared/utilities/misc";
import { useRouter } from "next/router";
import { Button } from "../../../shared/utilities/form/button";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { usePaymentContext } from "../providers/payment-provider";
import { useCart } from "../../../../lib/providers/cart-provider";
import { Order } from "../../../../lib/repo/order.repo";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";
interface Propstype extends DialogProps {
  order: Order;
}

export function PaymentSuccessDialog({ order, ...props }: Propstype) {
  const { shopCode, getCustomer } = useShopContext();
  const { clearCartProducts } = useCart();
  const { orderInput, setOrderInput, openDialog, setOpenDialog, setOrder } = usePaymentContext();
  let [countDown, setCountDown] = useState(3);
  let [interval] = useState<any>();
  const router = useRouter();
  const toast = useToast();
  const handleConfirmSuccess = () => {
    let pathname = "";
    if (orderInput.paymentMethod == "BANK_TRANSFER") {
      pathname = `/${shopCode}/order/bank-transfer/${order.code}`;
    } else if (orderInput.paymentMethod == "MOMO") {
      pathname = order?.paymentMeta?.payUrl;
    }
    else {
      pathname = `/${shopCode}/order/${order.code}`;
    }
    router.push(pathname);
  };

  useEffect(() => {
    if (order) {
      setCountDown(3);
      interval = setInterval(() => {
        countDown -= 1;
        setCountDown(countDown);
        if (countDown === 0) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (order) {
        clearInterval(interval);
        setOrderInput({ ...orderInput, note: "", promotionCode: "" });
        clearCartProducts();
      }
    };
  }, [order]);

  useEffect(() => {
    if (countDown === 1) {
      if (location.pathname.startsWith("/shop/pos")) {
        setOpenDialog(true)
        toast.success("Tạo đơn hàng thành công!, chuyển về trang quản lý đơn hàng");
        clearCartProducts();
        setCountDown(3);
        setOrder(null)
      } else {
        handleConfirmSuccess();
        getCustomer();
      }
    }
  }, [countDown]);

  return (
    <Dialog
      {...props}
      isOpen={order ? true : false}
      onClose={() => { }}
      width="400px"
      slideFromBottom="none"
      dialogClass="rounded-3xl overflow-hidden relative bg-white"
    >
      <Dialog.Body>
        <div className="flex flex-col items-center sm:p-2">
          <Img src="/assets/img/icon-success.png" className="w-2/4 rounded-full sm:m-4" />
          <h3 className="p-2 text-lg font-bold text-center text-green-500 ">Đặt hàng thành công</h3>
          <div className="text-center text-green-500">
            Bạn đã đặt thành công đơn hàng trị giá{" "}
            <span className="font-semibold">{parseNumber(order?.amount)}đ</span>
          </div>
          <div className="text-center text-green-500">
            {" "}
            Hình thức Thanh toán khi nhận hàng {orderInput?.paymentMethod}
          </div>
          <div className="text-center text-green-500">
            Mã đơn hàng: <span className="font-semibold">{order?.code}</span>
          </div>
          {
            !location.pathname.startsWith("/shop/pos") && (
              <Button
                text={`${orderInput.paymentMethod == "BANK_TRANSFER"
                  ? "Đi đến chuyển khoản"
                  : orderInput.paymentMethod == "MOMO"
                    ? "Đi đến thanh toán Momo"
                    : "Đi đến đơn hàng"
                  } (${countDown})`}
                className="my-3 font-medium rounded-full"
                primary
                onClick={() => handleConfirmSuccess()}
              />
            )
          }
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
