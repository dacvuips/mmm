import { useRouter } from "next/router";
import { useMemo } from "react";
import { parseNumber } from "../../../lib/helpers/parser";
import { Button } from "../../shared/utilities/form/button";

interface MoMoResult {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: string;
  orderInfo: string;
  orderType: string;
  payType: string;
  responseTime: string;
  resultCode: string;
  message: string;
}
export function PaymentCallbackMoMoPage(props: ReactProps) {
  const router = useRouter();

  const payment: MoMoResult = useMemo(() => {
    if (router.query) {
      if (typeof window !== "undefined") {
        document.title = router.query.message as string;
      }
      return { ...(router.query as any) };
    }
    return null;
  }, [router.query]);

  const isSuccess = useMemo(() => {
    return payment.resultCode == "0";
  }, [payment]);

  return (
    <div className="flex-center">
      <div className="flex flex-col items-center my-20 text-center">
        <img
          className="w-20 pb-4"
          src={isSuccess ? "/assets/img/checked.svg" : "/assets/img/error.svg"}
        />
        <h4 className={`font-bold text-2xl ${isSuccess ? "text-success" : "text-danger"}`}>
          {payment.message}
        </h4>
        <div className={`font-semibold text-gray-600 mt-1`}>{payment.orderInfo}</div>
        {payment.amount && (
          <div className={`text-gray-600 mt-1`}>
            Tiền thanh toán: <strong>{parseNumber(payment.amount, true)}</strong>
          </div>
        )}
        <Button
          success={isSuccess}
          danger={!isSuccess}
          className="px-6 mt-4 shadow-md h-11"
          href="/shop/settings/payment"
          text="Về trang thanh toán"
        />
      </div>
    </div>
  );
}
