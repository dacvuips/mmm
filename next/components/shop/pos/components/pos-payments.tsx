import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AiOutlinePhone, AiOutlinePlus, AiOutlineUser } from "react-icons/ai";
import { FaShippingFast } from "react-icons/fa";

import { parseNumber } from "../../../../lib/helpers/parser";
import { useCart } from "../../../../lib/providers/cart-provider";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { CustomerService } from "../../../../lib/repo/customer.repo";
import { ORDER_STATUS, PICKUP_METHODS_SHOP_ORDER } from "../../../../lib/repo/order.repo";
import { PaymentDiscountItems } from "../../../index/payment/components/payment-discount-items";
import { PaymentNote } from "../../../index/payment/components/payment-note";
import { PaymentVoucherItemsDialog } from "../../../index/payment/components/payment-voucher-items-dialog";
import { usePaymentContext } from "../../../index/payment/providers/payment-provider";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button, DatePicker, Field, Form, Input, Radio } from "../../../shared/utilities/form";
import { Img, NotFound, Spinner } from "../../../shared/utilities/misc";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";
import { VoucherListDialog } from "../../../shared/voucher/voucher-list-dialog";
import { PosPaymentFooter } from "./pos-payment-footer";

export function PaymentBilled() {
  const [openVoucherList, setOpenVoucherList] = useState(false);
  const { setSelectedVoucher, order, setOrder } = usePaymentContext();
  const [openVoucherDetails, setOpenVoucherDetails] = useState(null);
  const toast = useToast();

  let [countDown, setCountDown] = useState(3);
  let [interval] = useState<any>();
  useEffect(() => {
    if (order) {
      debugger
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
      }
    };
  }, [order]);

  return (
    <div className="sticky right-0 p-3 bg-white rounded-md top-20 w-96">
      {order && (
        <div className="text-sm">
          M?? ????n h??ng:
          <span className="text-primary ">[{order?.code}]</span>{" "}
          {ORDER_STATUS.filter((item) => item.value === order.status).map((e) => (
            <span
              className={`bg-${e.color} text-gray-600 font-medium px-2 py-1 rounded-md`}
              key={e.value}
            >
              {e.label}
            </span>
          ))}
        </div>
      )}
      {/* <div className="text-sm">
        ????n h??ng t???o b???i{" "}
        <span className="text-primary ">
          {staff?.name ? `[Nh??n vi??n ${staff?.name}]` : "[Ch??? shop]"}
        </span>{" "}
      </div> */}
      {order ? (
        <Spinner />
      ) : (
        <Form>
          <div className="flex flex-row items-center justify-start mt-3">
            <span className="text-lg text-primary">
              <FaShippingFast />
            </span>
            <div className="ml-3 text-sm font-medium">Ch???n h??nh th???c giao h??ng</div>
          </div>
          <PaymentDeliveryInfoBilled />
          <PaymentNote />
          <PaymentDiscountItems />
          <PaymentSummaryBilled />
          <PosPaymentFooter />
        </Form>
      )}
      <PaymentVoucherItemsDialog />

      {/* <div className="grid grid-cols-2 gap-5 mt-5 mb-3"> */}
      {/* <Button
            text="T???o ????n"
            className="border rounded-lg border-primary h-14"
            onClick={() => {
              toast.info("T??nh n??ng ??ang ph??t tri???n");
            }}
          /> */}
      {/* </div> */}

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
  );
}

function PaymentDeliveryInfoBilled() {
  const toast = useToast();
  const { orderInput, setOrderInput } = usePaymentContext();
  const [openCreateCustomerFormDialog, setOpenCreateCustomerFormDialog] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState("");
  const [customerActive, setCustomerActive] = useState(null);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (buyerPhone != "") {
      CustomerService.getAll({
        query: { limit: 10, filter: { phone: buyerPhone } },
      }).then((res) => {
        setCustomers(res.data);
      });
    }
  }, [buyerPhone, customerActive]);
  const handleCreateCustomer = (data) => {
    setCustomerActive(data);
  };

  useEffect(() => {
    if (customerActive) {
      setOrderInput({
        ...orderInput,
        buyerAddress: customerActive?.fullAddress,
        buyerFullAddress: customerActive?.fullAddress,
        buyerPhone: customerActive?.phone,
        buyerName: customerActive?.name,
        latitude: customerActive?.latitude,
        longitude: customerActive?.longitude,
      });
    } else {
      setOrderInput({
        ...orderInput,
        buyerAddress: "",
        buyerPhone: "",
        buyerName: "",
        buyerFullAddress: "",
        latitude: 0,
        longitude: 0,
      });
    }
  }, [customerActive]);

  return (
    <>
      <div className="py-2 border-b border-dashed">
        <Radio
          style={{ paddingLeft: "0px" }}
          cols={6}
          className="pl-0 text-sm whitespace-nowrap"
          options={PICKUP_METHODS_SHOP_ORDER}
          value={orderInput.pickupMethod}
          onChange={(val) => {
            if (orderInput.tableCode && val === "DELIVERY") {
              toast.info("Ch???c n??ng n??y hi???n kh??ng kh??? d???ng");
              return;
            }

            setOrderInput({ ...orderInput, pickupMethod: val });
          }}
        />
        {customerActive && (
          <div className="flex items-center justify-between ">
            <div className="flex-1">
              <div className="flex items-center justify-start gap-2">
                <Img
                  src={
                    customerActive?.avatar ? customerActive?.avatar : "/assets/default/avatar.png"
                  }
                  className="w-10 rounded-full"
                />
                <span>
                  <div className="font-semibold text-primary">{customerActive?.name}</div>
                  <div className="text-xs text-gray-400 text-ellipsis-2">
                    {customerActive?.fullAddress
                      ? customerActive?.fullAddress
                      : `[Ch??a c?? ?????a ch???]`}
                  </div>
                </span>
              </div>
            </div>
            <Button
              text="X??a"
              className="px-2 text-xs border rounded-lg h-7 border-primary"
              hoverAccent
              onClick={() => {
                setCustomerActive(null);
                setCustomers([]);
              }}
            />
          </div>
        )}
        <div className="relative">
          {customerActive == null && (
            <div className="flex flex-row items-center justify-between my-1 w-80">
              <Input
                prefix={<AiOutlineUser />}
                placeholder="Nh???p s??? ??i???n tho???i"
                prefixClassName="text-sm"
                clearable
                debounce
                value={buyerPhone}
                onChange={(val) => {
                  setBuyerPhone(val);
                }}
              />
              <Button
                icon={<AiOutlinePlus />}
                iconClassName="text-xl"
                iconPosition="start"
                className="px-1 py-0 ml-3 bg-gray-200"
                onClick={() => {
                  setOpenCreateCustomerFormDialog(true);
                }}
                tooltip="T???o kh??ch h??ng m???i"
              />
            </div>
          )}
          {customers && buyerPhone && (
            <div className="absolute left-0 right-0 z-50 p-3 bg-white shadow-lg">
              {customers?.length > 0 ? (
                <div className="mt-1 ">
                  {customers?.map((customer, index) => (
                    <div
                      key={index}
                      className="flex flex-row items-center gap-3 pb-1 my-1 border-b border-dashed cursor-pointer"
                      onClick={() => {
                        setCustomerActive(customer);
                        setBuyerPhone("");
                      }}
                    >
                      <Img
                        src={customer?.avatar ? customer?.avatar : "/assets/default/avatar.png"}
                        className="w-10 rounded-full"
                      />
                      <span>
                        <div className="font-semibold text-primary">{customer?.name}</div>
                        <div className="text-sm text-gray-400">
                          {customer?.fullAddress ? customer?.fullAddress : `[Ch??a c?? ?????a ch???]`}
                        </div>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3">
                  <div className="flex items-center justify-between">
                    <span>Kh??ch h??ng</span>
                    <span
                      className="font-medium cursor-pointer text-primary"
                      onClick={() => {
                        setOpenCreateCustomerFormDialog(true);
                        setBuyerPhone("");
                      }}
                    >
                      Th??m kh??ch h??ng
                    </span>
                  </div>
                  <NotFound text="kh??ng t??m th???y kh??ch h??ng trong h??? th???ng" className="py-0" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <CreateCustomerFormDialog
        isOpen={openCreateCustomerFormDialog}
        onClose={() => {
          setOpenCreateCustomerFormDialog(false);
        }}
        handleSubmit={handleCreateCustomer}
      />
    </>
  );
}

function CreateCustomerFormDialog({ handleSubmit, ...props }: { handleSubmit: any } & DialogProps) {
  const { orderInput, setOrderInput } = usePaymentContext();

  const { setValue, watch, getValues, register } = useFormContext();
  const { openLocation, userLocation } = useLocation();
  register("latitude");
  register("longitude");

  useEffect(() => {
    if (userLocation) {
      setOrderInput({
        ...orderInput,
        buyerFullAddress: userLocation.fullAddress,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });
    }
  }, [userLocation]);

  return (
    <Dialog
      {...props}
      width={500}
      extraDialogClass="lg:rounded-xl"
      title="Th??m th??ng tin kh??ch h??ng m???i"
    >
      <Dialog.Body>
        <Form
          onSubmit={(data) => {
            console.log("data form", data);
            handleSubmit({
              ...data,
              fullAddress: orderInput.buyerFullAddress,
              latitude: orderInput.latitude,
              longitude: orderInput.longitude,
            });
            props.onClose();
          }}
        >
          <Field label="H??? t??n" name="name" required>
            <Input
              prefix={<AiOutlineUser />}
              prefixClassName="text-gray-300"
              placeholder="Nh???p t??n kh??ch h??ng"
              className="py-2 border border-gray-400 rounded-md"
            />
          </Field>
          <Field label="S??? di???n tho???i" name="phone" required>
            <Input
              prefix={<AiOutlinePhone />}
              prefixClassName="text-gray-300"
              placeholder="Nh???p s??? ??i???n tho???i"
              className="py-2 border border-gray-400 rounded-md"
            />
          </Field>
          <Field label="Ng??y sinh" name="">
            <DatePicker />
          </Field>

          <InfoFiledForm
            title="?????a ch???"
            isTextarea
            content={orderInput.buyerFullAddress}
            readOnly
            isEdit={true}
            onClick={() => openLocation()}
          />

          <Form.Footer
            onCancel={() => {
              props.onClose();
            }}
            cancelText="B??? qua"
            submitText="Th??m m???i"
            cancelProps={{
              className: "bg-gray-50 rounded-lg border border-primary",
            }}
            submitProps={{
              className: "bg-primary text-white rounded-lg",
            }}
          />
        </Form>
      </Dialog.Body>
    </Dialog>
  );
}
function InfoFiledForm({
  title = "",
  content = "",
  isEdit = false,
  isTextarea = false,
  ...props
}: {
  onClick?: Function;
  title: string;
  content: string;
  isEdit?: boolean;
  isTextarea?: boolean;
} & FormControlProps) {
  return (
    <li className="flex flex-col">
      <div className={`font-medium w-28 pr-3  ${isEdit ? "pt-2" : ""}`}>{title}</div>
      <div className="flex-1">
        <div
          className={`w-full`}
          onClick={() => {
            if (props.onClick && isEdit) {
              props.onClick();
            }
          }}
        >
          {isEdit ? (
            <>
              <textarea
                placeholder={`Nh???p ${title.toLowerCase()} c???a b???n`}
                className={`animate-emerge bg-white w-full rounded-lg border-gray-300 v-scrollbar focus:outline-none h-auto ${isEdit ? "border p-2" : "px-2 text-gray-800"
                  }`}
                rows={3}
                value={content}
                onChange={(val) => props.onChange(val.target.value)}
                disabled={props.readOnly ? props.readOnly : !isEdit}
                style={{ resize: "none" }}
              />
            </>
          ) : content ? (
            <div className="font-normal animate-emerge">{content}</div>
          ) : (
            <div className="italic text-gray-500 animate-emerge">Ch??a c??</div>
          )}
        </div>
      </div>
    </li>
  );
}

function AmountRow({
  label,
  subtext,
  value,
  className = "",
}: { label: string; subtext?: string; value: number } & ReactProps) {
  return (
    <div className="flex items-center justify-between text-gray-700">
      <div className="">
        {label} {subtext && <span className="text-sm font-medium">({subtext})</span>}
      </div>
      <div className={`font-medium ${className}`}>{parseNumber(value, true)}</div>
    </div>
  );
}
function PaymentSummaryBilled() {
  const { draftOrder, isSubmittingDraft, discountItems, orderInput } = usePaymentContext();
  const { totalQty, totalAmount, cartProducts } = useCart();

  const finalTotalQty = useMemo(
    () =>
      discountItems?.filter((x) => x.selected).reduce((total, item) => total + item.qty, 0) || 0,
    [discountItems, totalQty, cartProducts]
  );

  if (!draftOrder?.order) {
    return (
      <div className="py-4 font-medium text-primary flex-center loading-ellipsis animate-emerge">
        ??ang t??nh
      </div>
    );
  }
  return (
    <div className={`${isSubmittingDraft ? "opacity-50 " : ""} py-3`}>
      <AmountRow
        label="T???m t??nh"
        subtext={`${draftOrder?.order?.itemCount || finalTotalQty} s???n ph???m`}
        value={draftOrder?.order?.subtotal}
        className=""
      />
      <AmountRow
        label="Ph?? giao h??ng"
        subtext={draftOrder?.order?.shipDistance ? `${draftOrder?.order?.shipDistance} km` : ""}
        value={draftOrder?.order?.shipfee}
        className=""
      />
      {draftOrder?.order?.discount > 0 &&
        draftOrder?.order?.discount !== draftOrder?.order?.discountPoint && (
          <AmountRow
            label="Gi???m gi?? khuy???n m??i"
            value={
              draftOrder?.order?.discount > 0
                ? -(draftOrder.order.discount - draftOrder.order.discountPoint)
                : 0
            }
            className="text-danger"
          />
        )}
      {draftOrder?.order?.rewardPoint > 0 && (
        <AmountRow
          label="??i???m th?????ng t??? ????n h??ng"
          value={draftOrder?.order?.rewardPoint || 0}
          className="text-success "
        />
      )}

      <div className="flex flex-row items-center justify-between p-2 mt-4 mb-2 rounded-md bg-blue-50 text-primary">
        <span>T???ng ti???n</span>
        <span className="font-semibold text-primary">
          {parseNumber(draftOrder?.order?.amount || totalAmount, true)}
        </span>
      </div>
      {/* <div className="flex flex-row items-center justify-between p-2 mt-4 mb-2 rounded-md bg-blue-50 text-primary" >
        <span>Kh??ch ph???i tr???</span>
        <span className="font-semibold text-primary" >{parseNumber(495000)}??</span>
      </div>
      <div className="flex flex-row items-center justify-between p-2 my-2 rounded-md bg-blue-50 text-primary" >
        <span>Ti???n kh??ch ????a</span>
        <span className="font-semibold text-primary" >{parseNumber(5000000)}??</span>
      </div> */}
      {((draftOrder && draftOrder.invalid) ||
        (orderInput && orderInput.pickupMethod == "DELIVERY" && !orderInput.buyerFullAddress)) && (
          <div className="p-2 mt-2 font-medium rounded bg-danger-light text-danger">
            {draftOrder.invalidReason ? draftOrder.invalidReason : "Vui l??ng ch???n ??ia ch??? giao h??ng"}
          </div>
        )}
    </div>
  );
}

export const PAYMENT_METHODS = [
  { value: "COD", label: "Ti???n m???t" },
  { value: "WALLET", label: "V?? ??i???n t???" },
  { value: "BANK", label: "Ng??n h??ng" },
];
