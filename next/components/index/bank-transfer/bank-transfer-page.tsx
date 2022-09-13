import copy from "copy-to-clipboard";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaRegCopy } from "react-icons/fa";
import { parseNumber } from "../../../lib/helpers/parser";
import { useAlert } from "../../../lib/providers/alert-provider";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { Button } from "../../shared/utilities/form/button";
import { Select } from "../../shared/utilities/form/select";
import { Spinner } from "../../shared/utilities/misc";
import { useBankTransfer } from "./providers/bank-transfer-provider";

export function BankTransferPage() {
  const {
    order,
    cancelOrder,
    redirectToWebApp,
    loadOneOrder,
    markTransferComplete,
  } = useBankTransfer();
  const { shop, shopCode } = useShopContext();
  const [blockButton, setBlockButton] = useState(false);
  const ref = useRef(null);
  const markTransfer = async () => {
    await markTransferComplete()
      .then((res) => {
        toast.success(res);
      })
      .catch((err) => toast.error("Xác nhận chuyển tiền thất bại. " + err.message));
  };

  useEffect(() => {
    setTimeout(() => {
      if (blockButton) setBlockButton(false);
    }, 200000);
  }, [blockButton]);
  useEffect(() => {
    ref.current = setInterval(() => loadOneOrder(), 5000);
    return () => clearInterval(ref.current);
  }, []);

  const toast = useToast();
  const alert = useAlert();
  if (!order || shop?.config?.banks?.length < 1) return <Spinner />;
  else
    return (
      <>
        <div className="flex flex-col w-full min-h-screen p-4 bg-white">
          <div className="flex items-center w-full p-4 py-1">
            <Button
              icon={<FaChevronLeft />}
              iconClassName="text-xl text-gray-400"
              className="w-10 pl-0"
              tooltip={"Trang chủ"}
              href={`/${shopCode}`}
            />
            <h2 className="flex-1 text-lg font-semibold text-center">Thông tin thanh toán</h2>
            <div className="w-10"></div>
          </div>
          <div className="mt-4">
            <InforPay />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {order &&
              (order?.paymentStatus == "partially_filled" || order?.paymentStatus == "filled") && (
                <div className="w-full font-medium text-info">
                  {`Hệ thống đã nhận ${parseNumber(order?.paymentFilledAmount, true)}. ${order?.paymentStatus == "partially_filled"
                    ? "Bạn vui lòng thanh toán số tiền còn lại. Nếu không thanh toán đủ thì giao dịch sẽ bị hủy."
                    : ""
                    }. ${order?.paymentStatus == "filled"
                      ? "Đơn hàng đã thanh toán hoàn tất. Món ăn của bạn đang được làm."
                      : ""
                    }`}
                </div>
              )}
            <div className="flex flex-col items-center w-full mt-10">
              {order?.status !== "CANCELED" && order?.paymentFilledAmount < order?.amount && (
                <Button
                  className="h-12 rounded-full"
                  disabled={blockButton}
                  isLoading={blockButton}
                  text={
                    !blockButton
                      ? `Xác nhận đã chuyển tiền ${order?.paymentStatus === "partially_filled"
                        ? `(Còn lại ${parseNumber(
                          order?.amount - order?.paymentFilledAmount,
                          true
                        )})`
                        : ""
                      }`
                      : "Đang xác nhận quá trình có thể mất vài phút"
                  }
                  onClick={async () => {
                    setBlockButton(true);
                    markTransfer();
                  }}
                  primary
                />
              )}
            </div>
            <div className="flex justify-between w-full border-group">
              <Button
                text="Trở về trang đặt hàng"
                outline
                onClick={() => redirectToWebApp()}
                className="flex-1 border-r-0 rounded-full"
              />
              {order?.status !== "CANCELED" && order?.paymentStatus == "pending" ? (
                <Button
                  text="Hủy đơn hàng"
                  outline
                  className="flex-1 rounded-full"
                  onClick={async () => {
                    const confirm = await alert.question(
                      "Xác nhận hủy đơn",
                      "Bạn có chắc chắn muốn hủy đơn?"
                    );
                    if (confirm)
                      await cancelOrder(order?.id)
                        .then((res) => {
                          toast.success("Hủy đơn hàng thành công.");
                          redirectToWebApp();
                        })
                        .catch((err) => toast.error("Hủy đơn hàng thất bại. " + err.message));
                  }}
                />
              ) : order?.status == "CANCELED" && order?.paymentStatus == "pending" ? (
                <div className="w-full font-semibold text-center text-warning">
                  Đơn hàng đã bị hủy.
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </>
    );
}
function InfoRow({
  title = "",
  content = "",
  ...props
}: {
  onClick?: Function;
  title: string;
  content: string;
} & FormControlProps) {
  const toast = useToast();
  const copyClipboard = (text) => {
    copy(text);
    toast.success("Đã sao chép!");
  };
  return (
    <div className={`flex items-center border-gray-200 py-2 ${props.className || ""}`}>
      <div className="w-1/3 font-medium whitespace-nowrap">{title}:</div>
      <div className={`w-full flex-1`}>
        <span className={`text-ellipsis-1 w-full font-light `}>{content}</span>
      </div>
      <Button className="pr-0" icon={<FaRegCopy />} onClick={() => copyClipboard(content)} />
    </div>
  );
}

function InforPay() {
  const toast = useToast();
  const router = useRouter();
  const { orders, order } = useBankTransfer();
  const { shop, shopCode } = useShopContext();
  const [bankSelected, setBankSelected] = useState<string>();
  const copyClipboard = (text) => {
    copy(text);
    toast.success("Copied!");
  };
  useEffect(() => {
    if (shop?.config?.banks.length > 0) setBankSelected(shop.config.banks[0].bankName);
  }, [shop]);
  if (!order || !shop?.config?.banks) return <Spinner />;
  else
    return (
      <div className="">
        <Select
          className="mb-4 border-gray-200"
          native
          options={shop?.config?.banks.map((item) => ({
            label: item.bankName,
            value: item.bankName,
          }))}
          value={shop?.config?.banks[0].bankName}
          onChange={(data) => setBankSelected(data)}
        />
        <span className="font-medium whitespace-nowrap">Thông tin người nhận</span>
        <InfoRow
          title="Số tài khoản"
          className="border-b"
          content={
            shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.bankNumber
          }
        />
        <InfoRow
          title="Tên tài khoản"
          className="border-b"
          content={
            shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.ownerName
          }
        />
        <InfoRow
          title="Cửa hàng"
          className="border-b"
          content={`${shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.bankName
            } ${shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.branch != null
              ? shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.branch
              : ""
            }`}
        />
        <InfoRow title="Nội dung chuyển" content={order.code} />
        {/* <Field label="Tài khoản người nhận">
          <Input
            className="h-12 rounded-full"
            value={
              shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.bankNumber
            }
            suffix={
              <Button
                icon={<FaRegCopy />}
                onClick={() =>
                  copyClipboard(
                    shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]
                      ?.bankNumber
                  )
                }
              />
            }
            readOnly
          />
        </Field>
        <Field label="Tên người nhận">
          <Input
            className="h-12 rounded-full"
            value={
              shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.ownerName
            }
            suffix={
              <Button
                icon={<FaRegCopy />}
                onClick={() =>
                  copyClipboard(
                    shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]
                      ?.ownerName
                  )
                }
              />
            }
            readOnly
          />
        </Field>
        <Field label="Cửa hàng">
          <Input
            className="h-12 rounded-full"
            value={`${
              shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.bankName
            } ${
              shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.branch != null
                ? shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]?.branch
                : ""
            }`}
            suffix={
              <Button
                icon={<FaRegCopy />}
                onClick={() =>
                  copyClipboard(
                    `${
                      shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]
                        ?.bankName
                    } ${
                      shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]
                        ?.branch != null
                        ? shop?.config?.banks.filter((item) => item.bankName == bankSelected)[0]
                            ?.branch
                        : ""
                    }`
                  )
                }
              />
            }
            readOnly
          />
        </Field>
        <Field label="Nội dung chuyển khoản">
          <Input
            className="h-12 rounded-full"
            value={`${order?.code}`}
            suffix={<Button icon={<FaRegCopy />} onClick={() => copyClipboard(`${order?.code}`)} />}
            readOnly
          />
        </Field> */}
        <div className="mt-1 font-medium text-yellow-500">
          Lưu ý: Vui lòng nhập chính xác thông tin trước khi giao dịch. Sau khi chuyển tiền vui lòng
          nhấn xác nhận đã chuyển. Nên chọn chuyển nhanh 24/7 để hệ thống có thể xác nhận trong thời
          gian nhanh nhất.
        </div>
        <div className="py-2 mt-6 font-medium border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div className="">
              Tổng: <span className="">{order?.itemCount} sản phẩm</span>
            </div>
            <div className="">{parseNumber(order?.amount, true)}</div>
          </div>
        </div>
      </div>
    );
}
