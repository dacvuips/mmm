import React, { useEffect, useState } from "react";
import { FaCcVisa, FaChevronRight, FaMoneyBillAlt, FaTimes } from "react-icons/fa";
import { RiCouponFill } from "react-icons/ri";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useCart } from "../../../../lib/providers/cart-provider";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { OrderService } from "../../../../lib/repo/order.repo";
import { Momo } from "../../../../public/assets/svg/svg";
import { DialogHeader } from "../../../shared/default-layout/dialog-header";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Checkbox, Switch } from "../../../shared/utilities/form";
import { Button } from "../../../shared/utilities/form/button";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";
import { VoucherListDialog } from "../../../shared/voucher/voucher-list-dialog";
import { usePaymentContext } from "../providers/payment-provider";
import { PaymentConfirmationInfoDialog } from "./payment-confirmation-info-dialog";

interface Props extends ReactProps { }
export function PaymentFooter(props: Props) {
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
    <div className={`${screenLg ? "" : "fixed bottom-0 left-0 z-50 flex w-full"}`}>
      <div className="w-full pb-6 mx-auto text-sm bg-white border-t shadow-2xl">
        <div className={`${screenLg ? "py-4" : "p-4"} pb-0 grid grid-cols-12`}>
          <button
            className="flex items-center h-12 col-span-5 px-0 py-2 border-r-2 xs:col-span-6 group focus:outline-none"
            onClick={() => setOpenPaymenMethods(true)}
          >
            <i className="flex items-center w-5 h-5 ml-2 text-xl text-primary">
              {(orderInput.paymentMethod == "COD" && <FaMoneyBillAlt />) ||
                (orderInput.paymentMethod == "MOMO" && <Momo />) || <FaCcVisa />}
            </i>
            <div className="px-2 text-sm font-semibold text-primary whitespace-nowrap sm:text-base group-hover:text-primary">
              {orderInput.paymentMethod == "COD"
                ? "Ti???n m???t"
                : orderInput.paymentMethod == "MOMO"
                  ? "V?? MoMo"
                  : "Chuy???n kho???n"}
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
            {/* <img src="/assets/img/tag.png" alt="" className="object-contain w-5 ml-2" /> */}
            <span className="mx-3">
              <RiCouponFill className="text-xl text-primary" />
            </span>
            <div
              className={`px-1 text-sm  font-semibold text-primary xs:text-base whitespace-nowrap text-ellipsis-1 ${selectedVoucher
                ? "text-accent underline hover:text-accent-dark"
                : "text-gray-700 group-hover:text-primary"
                }`}
            >
              {selectedVoucher?.code || "M?? khuy???n m??i"}
            </div>
            {
              selectedVoucher ? (
                <i
                  className="absolute right-0 h-12 px-2 ml-auto text-sm text-gray-500 top-4 hover:text-danger sm:text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVoucher(null);
                  }}
                >
                  <FaTimes />
                </i>
              ) : null
              // <i className="pr-2 ml-auto text-sm text-gray-400 group-hover:text-primary sm:text-base">
              //   <FaChevronRight />
              // </i>
            }
          </button>
        </div>
        <div className={`${screenLg ? "" : "px-4"} w-full  pt-1.5`}>
          {shop?.config?.rewardPointConfig?.active && (
            <div className="flex items-center justify-center">
              <Checkbox
                // placeholder={`S??? d???ng ??i???m th?????ng (${parseNumber(50000)})`}
                style={{ color: "#004790", borderRadius: "30px" }}
                placeholder={`S??? d???ng ??i???m th?????ng`}
                className="text-primary"
                onChange={(val) => setOrderInput({ ...orderInput, useRewardPoint: val })}
              />
            </div>
            // <Switch
            //   onChange={(val) => setOrderInput({ ...orderInput, useRewardPoint: val })}
            //   placeholder="S??? d???ng ??i???m th?????ng"
            //   className="mb-1.5 font-medium"
            // />
          )}
          <Button
            disabled={draftOrder.invalid || !!order}
            text={
              !isSubmittingDraft
                ? draftOrder.order
                  ? `Ho??n th??nh - ${parseNumber(draftOrder?.order?.amount)}??`
                  : "Ho??n th??nh -"
                : "??ang t??nh"
            }
            primary
            className={`w-full h-12 border-b-4 rounded-lg border-primary-dark ${isSubmittingDraft ? "loading-ellipsis" : ""
              }`}
            onClick={async () => {
              if (orderInput.pickupMethod === "DELIVERY") {
                setOpenPaymentConfirmInfoDialog(true);
              } else {
                if (isSubmittingDraft) return;
                await generateOrder();
              }
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
        <PaymentConfirmationInfoDialog
          isOpen={openPaymentConfirmInfoDialog}
          onClose={() => setOpenPaymentConfirmInfoDialog(false)}
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
        return "Ti???n m???t";
      case "MOMO":
        return "V?? MoMo";
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
      title="Ch???n ph????ng th???c thanh to??n"
      headerClass=" "
      extraDialogClass="rounded-t-3xl lg:rounded-t"
      width={400}
    >
      <DialogHeader title="Ch???n ph????ng th???c thanh to??n" onClose={props.onClose} />
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
          text="X??c nh???n"
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
