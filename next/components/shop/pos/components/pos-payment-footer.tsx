import React, { useEffect, useState } from "react";
import { FaCcVisa, FaMoneyBillAlt, FaRegCreditCard, FaTimes } from "react-icons/fa";
import { RiCouponFill } from "react-icons/ri";

import { parseNumber } from "../../../../lib/helpers/parser";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { OrderService } from "../../../../lib/repo/order.repo";
import { Momo } from "../../../../public/assets/svg/svg";
import { usePaymentContext } from "../../../index/payment/providers/payment-provider";
import { DialogHeader } from "../../../shared/default-layout/dialog-header";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Checkbox } from "../../../shared/utilities/form";
import { Button } from "../../../shared/utilities/form/button";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";
import { VoucherListDialog } from "../../../shared/voucher/voucher-list-dialog";

interface Props extends ReactProps { }
export function PosPaymentFooter(props: Props) {
  const {
    generateOrder,
    orderInput,
    draftOrder,
    setOrderInput,
    selectedVoucher,
    setSelectedVoucher,
    order,
    isSubmittingDraft,
  } = usePaymentContext();
  const { shop } = useShopContext();
  const screenLg = useScreen("lg");

  const [openVoucherList, setOpenVoucherList] = useState(false);
  const [openPaymenMethods, setOpenPaymenMethods] = useState(false);
  const [openVoucherDetails, setOpenVoucherDetails] = useState(null);
  const [openPaymentConfirmInfoDialog, setOpenPaymentConfirmInfoDialog] = useState(false);

  return (
    <div className={`flex flex-col w-full`}>
      <div className="flex flex-row items-center justify-start mt-2 mb-3">
        <span className="text-lg text-primary">
          <FaRegCreditCard />
        </span>
        <div className="ml-3 font-semibold">Phương thức thanh toán</div>
      </div>
      <div className="w-full mx-auto text-sm">
        <div className={`pt-1 grid grid-cols-12`}>
          <button
            className="flex items-center justify-start col-span-5 px-0 py-1 border-r-2 xs:col-span-6 group focus:outline-none"
            onClick={() => setOpenPaymenMethods(true)}
          >
            <i className="flex items-center w-5 h-5 ml-1 text-lg text-primary">
              {(orderInput.paymentMethod == "COD" && <FaMoneyBillAlt />) ||
                (orderInput.paymentMethod == "MOMO" && <Momo />) || <FaCcVisa />}
            </i>
            <div className="px-1 text-sm font-medium text-primary whitespace-nowrap group-hover:text-primary">
              {orderInput.paymentMethod == "COD"
                ? "Tiền mặt"
                : orderInput.paymentMethod == "MOMO"
                  ? "Ví MoMo"
                  : "Chuyển khoản"}
            </div>
            {/* <i className="pr-2 ml-auto text-sm text-gray-400 group-hover:text-primary sm:text-base">
              <FaChevronRight />
            </i> */}
          </button>

          <button
            className="relative flex items-center justify-center h-12 col-span-7 px-0 py-2 xs:col-span-6 focus:outline-none group"
            onClick={() =>
              selectedVoucher ? setOpenVoucherDetails(selectedVoucher) : setOpenVoucherList(true)
            }
          >
            <span className="mx-3">
              <RiCouponFill className="text-xl text-primary" />
            </span>
            <div
              className={`px-1 text-sm font-medium text-primary whitespace-nowrap text-ellipsis-1 ${selectedVoucher
                ? "text-accent underline hover:text-accent-dark"
                : "text-gray-700 group-hover:text-primary"
                }`}
            >
              {selectedVoucher?.code || "Mã khuyến mãi"}
            </div>
            {selectedVoucher ? (
              <i
                className="absolute right-0 h-12 px-2 ml-auto text-sm text-gray-500 top-4 hover:text-danger sm:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVoucher(null);
                }}
              >
                <FaTimes />
              </i>
            ) : null}
          </button>
        </div>
        <div className={`${screenLg ? "" : "px-4"} w-full  pt-1.5`}>
          <Button
            disabled={draftOrder.invalid || !!order}
            text={
              !isSubmittingDraft
                ? draftOrder.order
                  ? `Hoàn tất và in bill`
                  : "Hoàn tất và in bill"
                : "Đang tính"
            }
            primary
            className={`w-full h-12 border-b-4 rounded-lg border-primary-dark ${isSubmittingDraft ? "loading-ellipsis" : ""
              }`}
            onClick={async () => {
              if (isSubmittingDraft) return;
              await generateOrder();
            }}
          />
        </div>
        <PaymentSelectionDialog
          isOpen={openPaymenMethods}
          onClose={() => setOpenPaymenMethods(false)}
        />
        <VoucherListDialog
          isOpen={openVoucherList}
          onClose={() => setOpenVoucherList(false)}
          onApply={(voucher) => {
            setSelectedVoucher(voucher);
          }}
        />
        <VoucherDetailsDialog
          voucher={openVoucherDetails}
          isOpen={openVoucherDetails ? true : false}
          onClose={() => {
            setOpenVoucherDetails(null);
          }}
        />
      </div>
    </div>
  );
}

export function PaymentSelectionDialog({ ...props }: DialogProps) {
  const { orderInput, setOrderInput } = usePaymentContext();
  const [paymentMethod, setPaymentMethod] = useState(orderInput.paymentMethod);
  const [paymentMethods, setPaymentMethods] = useState<
    { value: string; label: string; icon: JSX.Element }[]
  >([]);
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "COD":
        return <FaMoneyBillAlt />;
      case "MOMO":
        return <Momo />;
      default:
        return <FaCcVisa />;
    }
  };
  const getPaymentLabel = (method) => {
    switch (method) {
      case "COD":
        return "Tiền mặt";
      case "MOMO":
        return "Ví MoMo";
      default:
        return "";
    }
  };

  useEffect(() => {
    OrderService.getAllPaymentMethod().then((res) => {
      setPaymentMethods(
        res.map((x) => ({
          value: x.value,
          label: getPaymentLabel(x.value) || x.label,
          icon: getPaymentMethodIcon(x.value),
        }))
      );
    });
  }, []);

  return (
    <Dialog
      {...props}
      title="Chọn phương thức thanh toán"
      headerClass=" "
      extraDialogClass="rounded-t-3xl lg:rounded-t"
      width={400}
    >
      <DialogHeader title="Chọn phương thức thanh toán" onClose={props.onClose} />
      <div className="flex flex-col w-full gap-3 p-3">
        {paymentMethods.map((item, index) => (
          <div
            key={item.value}
            className={`p-3 flex items-center justify-center rounded-lg bg-gray-50 cursor-pointer border ${paymentMethod == item.value
              ? "bg-primary-light text-primary border-primary"
              : "hover:bg-gray-100 border-gray-200 text-gray-700"
              }`}
            onClick={() => {
              // setOrderInput({ ...orderInput, paymentMethod: item.value });
              setPaymentMethod(item.value);
            }}
          >
            <i className="w-8 h-8 text-3xl flex-center text-primary">{item.icon}</i>
            <div className="pl-3 font-bold">{item.label}</div>
          </div>
        ))}
        <Button
          text="Xác nhận"
          primary
          className="w-full h-12 rounded-xl"
          onClick={() => {
            setOrderInput({ ...orderInput, paymentMethod: paymentMethod });
            props.onClose();
          }}
        />
      </div>
    </Dialog>
  );
}
