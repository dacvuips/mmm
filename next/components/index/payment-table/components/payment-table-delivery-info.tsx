import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AiFillCreditCard, AiOutlineRight } from "react-icons/ai";
import { FaClock, FaRegUser, FaShippingFast, FaUser } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import { RiMapPinLine } from "react-icons/ri";
import { useLocation } from "../../../../lib/providers/location-provider";

import { useShopContext } from "../../../../lib/providers/shop-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { TABLE_PICKUP_METHODS } from "../../../../lib/repo/order.repo";
import { Button, Field, Input, Radio, Switch, Textarea } from "../../../shared/utilities/form";
import { PaymentSelectionDialog } from "../../payment/components/payment-footer";
import { PaymentTimeSelector } from "../../payment/components/payment-time-selector";
import { usePaymentContext } from "../../payment/providers/payment-provider";
import { PaymentTablePickupMethod } from "./payment-table-pickup-method";

type Props = {};

export function PaymentTableDeliveryInfo({ }: Props) {
  const { orderInput, setOrderInput } = usePaymentContext();
  const [pickupMethod, setPickupMethod] = useState<"DELIVERY" | "STORE" | "SALE">("DELIVERY");
  const { selectedBranch, shopTable } = useShopContext();

  return (
    <div className="">
      <div className="flex items-center px-4 pb-2 mt-4 font-semibold">
        <i className="pr-2 mb-0.5 text-lg text-primary">
          <FaShippingFast />
        </i>
        Chọn phương thức giao hàng
      </div>
      <div className="px-4 py-3 bg-white ">
        <Radio
          style={{ paddingLeft: "0px" }}
          cols={12}
          className="pl-0"
          options={TABLE_PICKUP_METHODS}
          // value={orderInput.pickupMethod}
          value={pickupMethod}
          onChange={(val) => {
            // if (orderInput.tableCode && val === "DELIVERY") {
            //   toast.info("Chức năng này hiện không khả dụng");
            //   return;
            // }

            // setOrderInput({ ...orderInput, pickupMethod: val });
            setPickupMethod(val);
          }}
        />
      </div>
      <div className="flex flex-row items-center justify-between px-4 pb-2 mt-4">
        <div className="flex items-center font-semibold ">
          <i className="pr-2 mb-0.5 text-lg text-primary">
            <FaUser />
          </i>
          Thông tin nhận hàng
        </div>
        {/* {
          orderInput.pickupMethod === "STORE" || orderInput.pickupMethod === "SALE" ? (
            <Switch
              className=''
              name='retail'
              onChange={(val) => { }}
              placeholder='Khách lẻ'
            />
          ) : null
        } */}
        {pickupMethod === "STORE" || pickupMethod === "SALE" ? (
          <Switch className="" name="retail" onChange={(val) => { }} placeholder="Khách lẻ" />
        ) : null}
      </div>
      <DeliveryInfoTable pickupMethod={pickupMethod} />
      {pickupMethod === "STORE" && (
        <div className="pb-2 mt-4">
          <div className="flex items-center px-4 mb-2 font-semibold ">
            <i className="pr-2 mb-0.5 text-lg text-primary">
              <FaClock />
            </i>
            Thời gian nhận hàng
          </div>
          <div className="p-2 bg-white ">
            <PaymentTimeSelector />
          </div>
        </div>
      )}
      <PaymentTablePickupMethod />
    </div>
  );
}

function DeliveryInfoTable({ pickupMethod, ...props }) {
  const { orderInput, setOrderInput } = usePaymentContext();
  const { openLocation, userLocation } = useLocation();
  const { setValue } = useFormContext();
  useEffect(() => {
    if (userLocation) {
      setOrderInput({
        ...orderInput,
        buyerFullAddress: userLocation.fullAddress,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });
      setValue("buyerFullAddress", userLocation.fullAddress);

    }
  }, [userLocation]);

  return (
    <div className="px-4 pt-3 bg-white ">
      {pickupMethod === "DELIVERY" && (
        <>
          <Field name="buyerName" label="" className="rounded-2xl" required>
            <Input
              prefix={<FaRegUser />}
              placeholder="Tên người nhận"
              prefixClassName="text-gray-300"
              inputClassName="h-12 rounded-2xl"
              value={orderInput.buyerName}
              onChange={(val) => {
                setOrderInput({ ...orderInput, buyerName: val });
              }}
            />
          </Field>
          <Field name="buyerPhone" label="" required validation={{ phone: true }}>
            <Input
              prefix={<FiPhoneCall />}
              prefixClassName="text-gray-300"
              inputClassName="h-12"
              placeholder="Số điện thoại nhận hàng"
              value={orderInput.buyerPhone}
              onChange={(val) => {
                setOrderInput({ ...orderInput, buyerPhone: val });
              }}
            />
          </Field>
          <Field
            name="buyerFullAddress"
            label=""
            required
            onClick={() => {
              openLocation();
            }}
          >
            <Input
              prefix={<RiMapPinLine />}
              prefixClassName="text-gray-300"
              inputClassName="h-12"
              placeholder="Địa chỉ nhận hàng"
              value={orderInput.buyerFullAddress}
            />
            <Textarea />
          </Field>
        </>
      )}
      {pickupMethod === "STORE" && (
        <Field name="buyerPhoneStore" label="" required validation={{ phone: true }}>
          <Input
            prefix={<FiPhoneCall />}
            prefixClassName="text-gray-300"
            inputClassName="h-12"
            placeholder="Số điện thoại nhận hàng"
            value={orderInput.buyerPhone}
            onChange={(val) => {
              setOrderInput({ ...orderInput, buyerPhone: val });
            }}
          />
        </Field>
      )}
      {pickupMethod === "SALE" && (
        <Field name="buyerPhoneSale" label="" required validation={{ phone: true }}>
          <Input
            prefix={<FiPhoneCall />}
            prefixClassName="text-gray-300"
            inputClassName="h-12"
            placeholder="Số điện thoại nhận hàng"
            value={orderInput.buyerPhone}
            onChange={(val) => {
              setOrderInput({ ...orderInput, buyerPhone: val });
            }}
          />
        </Field>
      )}
    </div>
  );
}
