import { useEffect, useState } from "react";
import { FaCheck, FaPencilAlt } from "react-icons/fa";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useLocation } from "../../../../lib/providers/location-provider";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button } from "../../../shared/utilities/form";
import { usePaymentContext } from "../providers/payment-provider";
import { InfoRow } from "./payment-delivery-info";

export function PaymentConfirmationInfoDialog(props: DialogProps) {
  const { generateOrder, orderInput, setOrderInput, isSubmittingDraft } = usePaymentContext();
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
    <Dialog
      extraDialogClass="rounded-t-3xl"
      {...props}
      title="Xác nhận thông tin địa chỉ giao hàng"
      width={500}
    >
      <Dialog.Body>
        <div className="flex px-4 mb-1 lg:px-0">
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
          className={`sm:text-base font-light text-sm flex-1 space-y-2 pb-4 px-4 lg:px-0 bg-white `}
        >
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

            <InfoRow
              title="Địa chỉ"
              isTextarea
              content={orderInput.buyerFullAddress}
              readOnly
              isEdit={isShowEdit}
              onClick={() => openLocation()}
            />
          </>

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
        </div>
        <Button
          text="Đặt hàng"
          primary
          className={`w-full h-12 rounded-lg mt-3`}
          onClick={async () => {
            if (isSubmittingDraft) return;
            await generateOrder();
            props.onClose();
          }}
        />
      </Dialog.Body>
    </Dialog>
  );
}
