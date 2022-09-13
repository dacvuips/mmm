import React, { useEffect, useState } from "react";
import {
  FaChair,
  FaCheck,
  FaChevronRight,
  FaClock,
  FaPencilAlt,
  FaShippingFast,
  FaStore,
  FaUserAlt,
} from "react-icons/fa";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { PICKUP_METHODS } from "../../../../lib/repo/order.repo";
import { ProductNote } from "../../../shared/product-details/product-note";
import { Radio } from "../../../shared/utilities/form";
import { Button } from "../../../shared/utilities/form/button";
import { TabButtons } from "../../../shared/utilities/tab/tab-buttons";
import { ShopDetailsBranchesDialog } from "../../shop-details/components/shop-details-branches-dialog";
import { usePaymentContext } from "../providers/payment-provider";
import { PaymentTimeSelector } from "./payment-time-selector";

export const PaymentDeliveryInfo = () => {
  const { orderInput, setOrderInput } = usePaymentContext();
  const { selectedBranch, shopTable } = useShopContext();
  const [openShopBranches, setOpenShopBranches] = useState(false);
  const toast = useToast();
  const screenLg = useScreen("lg");

  return (
    <>
      {/* <TabButtons
        options={PICKUP_METHODS}
        value={orderInput.pickupMethod}
        onChange={(val) => {
          if (orderInput.tableCode && val === "DELIVERY") {
            toast.info("Chức năng này hiện không khả dụng");
            return;
          }

          setOrderInput({ ...orderInput, pickupMethod: val });
        }}
      /> */}
      <div
        className={`${screenLg ? "" : "px-4 my-2"
          } flex items-center text-sm font-semibold uppercase`}
      >
        <i className="pr-2 mb-0.5 text-lg text-primary">
          <FaShippingFast />
        </i>
        Phương thức vận chuyển - Thanh toán
      </div>
      <div className="px-4 py-3 bg-white lg:px-0">
        <Radio
          style={{ paddingLeft: "0px" }}
          cols={6}
          className="pl-0"
          options={PICKUP_METHODS}
          value={orderInput.pickupMethod}
          onChange={(val) => {
            if (orderInput.tableCode && val === "DELIVERY") {
              toast.info("Chức năng này hiện không khả dụng");
              return;
            }

            setOrderInput({ ...orderInput, pickupMethod: val });
          }}
        />

        <div
          className="flex items-center py-2 mt-2 bg-white border-t border-dashed cursor-pointer whitespace-nowrap"
          onClick={() => {
            if (orderInput.tableCode) {
              toast.info("Không thể đổi chi nhánh cửa hàng");
              return;
            }
            setOpenShopBranches(true);
          }}
        >
          {screenLg && (
            <i className="pr-2 text-lg text-primary">
              <FaStore />
            </i>
          )}
          <span className="font-medium text-ellipsis-1">
            {(!selectedBranch && "Chọn cửa hàng") || selectedBranch.name}
          </span>
          <i className="pl-2 ml-auto mr-0 text-base text-gray-500">
            <FaChevronRight />
          </i>
        </div>
      </div>
      <ShopDetailsBranchesDialog
        isOpen={openShopBranches}
        onClose={() => setOpenShopBranches(false)}
      />

      <DeliveryInfo />
    </>
  );
};
export function DeliveryInfo() {
  const { orderInput, setOrderInput } = usePaymentContext();
  const { openLocation, userLocation } = useLocation();
  const [isShowEdit, setIsShowEdit] = useState(false);
  const screenLg = useScreen("lg");

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
    <div className="py-2 lg:py-4 lg:border-b">
      <div className="flex px-4 mb-1 lg:px-0">
        <div className="flex items-center font-semibold uppercase">
          <i className="pr-2 mb-0.5 text-primary">
            <FaUserAlt />
          </i>
          Thông tin {orderInput.pickupMethod === "DELIVERY" ? "nhận" : "lấy"} hàng
        </div>
        {!isShowEdit && (
          <Button
            textPrimary
            onClick={() => setIsShowEdit(!isShowEdit)}
            text="Sửa"
            icon={<FaPencilAlt />}
            iconClassName="text-xs"
            className="h-8 pr-0 ml-auto mr-0 text-sm underline"
          />
        )}
      </div>
      <div
        className={`sm:text-base font-light text-sm flex-1 space-y-2 pb-4 px-4 lg:px-0 bg-white py-2 lg:py-0`}
      >
        {isShowEdit || screenLg ? (
          <>
            <InfoRow
              title="Họ và tên"
              content={orderInput.buyerName}
              isEdit={isShowEdit}
              onChange={(val) => setOrderInput({ ...orderInput, buyerName: val })}
            />
            <InfoRow
              title={"Điện thoại"}
              content={orderInput.buyerPhone}
              isEdit={isShowEdit}
              onChange={(val) => setOrderInput({ ...orderInput, buyerPhone: val })}
            />
            {orderInput.pickupMethod === "DELIVERY" && (
              <>
                <InfoRow
                  title="Địa chỉ"
                  isTextarea
                  content={orderInput.buyerFullAddress}
                  readOnly
                  isEdit={isShowEdit}
                  onClick={() => openLocation()}
                />
              </>
            )}
          </>
        ) : (
          <div className="">
            <div className="text-base font-semibold text-primary">
              {orderInput?.buyerName} - {orderInput.buyerPhone}{" "}
            </div>
            <div>
              {orderInput?.pickupMethod === "DELIVERY" && <div>{orderInput?.buyerFullAddress}</div>}
            </div>
          </div>
        )}
        {isShowEdit && (
          <div className={`flex justify-end`}>
            <Button
              outline
              primary
              icon={<FaCheck />}
              text="Xác nhận"
              small
              iconClassName="text-sm"
              onClick={() => setIsShowEdit(false)}
            />
          </div>
        )}
        {orderInput.pickupMethod === "DELIVERY" && (
          <ProductNote
            placeholder="Ghi chú cho tài xế..."
            value={orderInput.buyerAddressNote}
            onChange={(val) => setOrderInput({ ...orderInput, buyerAddressNote: val })}
          />
        )}
      </div>
      {orderInput.pickupMethod === "STORE" && (
        // <div className="flex flex-wrap items-center justify-between w-full pb-2 text-base">
        //   <span className="flex-1 mb-2">Thời gian lấy:</span>
        //   <PaymentTimeSelector />
        <div className="px-4 pb-4 bg-white lg:px-0 lg:pb-0">
          <div className="flex mb-1">
            <div className="flex items-center font-semibold uppercase">
              <i className="pr-2 mb-0.5 text-primary">
                <FaClock />
              </i>
              Thời gian lấy hàng
            </div>
          </div>
          <PaymentTimeSelector />
        </div>
      )}
      {orderInput.pickupMethod === "STORE" && !!orderInput.tableCode && (
        // <div className="flex flex-wrap items-center justify-between w-full pb-2 text-base">
        //   <span className="flex-1 mb-2">Thời gian lấy:</span>
        //   <PaymentTimeSelector />
        <>
          <div className="flex mt-4 mb-1">
            <div className="flex items-center font-semibold uppercase">
              <i className="pr-2 mb-0.5 text-primary">
                <FaChair />
              </i>
              Đặt tại bàn: <span className="pl-1 font-bold underline">{orderInput.tableCode}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export function InfoRow({
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
  const screenLg = useScreen("lg");
  return (
    <li className="flex">
      <div
        className={`${screenLg ? "text-left" : ""} font-medium w-28 pr-3  ${isEdit ? "pt-2" : ""}`}
      >
        {title}
      </div>
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
              {!isTextarea ? (
                <input
                  type="text"
                  placeholder={`Nhập ${title.toLowerCase()} của bạn`}
                  className={`animate-emerge bg-white w-full border-gray-300 ${isEdit ? "border p-2 rounded-sm" : "px-2 text-gray-800 whitespace-normal"
                    }`}
                  value={content}
                  onChange={(val) => props.onChange(val.target.value)}
                  disabled={props.readOnly ? props.readOnly : !isEdit}
                />
              ) : (
                <textarea
                  placeholder={`Nhập ${title.toLowerCase()} của bạn`}
                  className={`animate-emerge bg-white w-full border-gray-300 v-scrollbar focus:outline-none h-auto ${isEdit ? "border p-2 rounded-sm" : "px-2 text-gray-800"
                    }`}
                  rows={3}
                  value={content}
                  onChange={(val) => props.onChange(val.target.value)}
                  disabled={props.readOnly ? props.readOnly : !isEdit}
                  style={{ resize: "none" }}
                />
              )}
            </>
          ) : content ? (
            <div className="font-normal animate-emerge">{content}</div>
          ) : (
            <div className="italic text-gray-500 animate-emerge">Chưa có</div>
          )}
        </div>
      </div>
    </li>
  );
}
