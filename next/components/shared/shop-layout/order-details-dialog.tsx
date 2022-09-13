import { useEffect, useState } from "react";
import { RiCalendarTodoLine, RiHome6Line, RiStickyNoteLine, RiUser5Line } from "react-icons/ri";
import { formatDate, parseNumber } from "../../../lib/helpers/parser";
import { useAlert } from "../../../lib/providers/alert-provider";
import { DeliveryLog, DeliveryLogService } from "../../../lib/repo/delivery-log.repo";
import { OrderLog, OrderLogService } from "../../../lib/repo/order-log.repo";
import { Order, OrderService, ORDER_STATUS, PaymentLogs } from "../../../lib/repo/order.repo";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { Button } from "../utilities/form/button";
import { Img, Spinner } from "../utilities/misc";

interface PropsType extends DialogProps {
  orderId: string;
}
export function OrderDetailsDialog({ orderId, ...props }: PropsType) {
  const [order, setOrder] = useState<Order>(null);
  const ORDER_TABS: Option[] = [
    { value: "products", label: "Danh sách món" },
    { value: "order_history", label: "Lịch sử đơn hàng" },
    { value: "delivery_history", label: "Lịch sử giao hàng" },
    { value: "payment_history", label: "Lịch sử thanh toán" },
  ];
  const [selectedTab, setSelectedTab] = useState("products");
  const alert = useAlert();

  useEffect(() => {
    if (props.isOpen && orderId) {
      loadOrder(orderId);
    } else {
      setOrder(null);
    }
  }, [props.isOpen, orderId]);

  const loadOrder = (orderId: string) => {
    OrderService.getOne({ id: orderId })
      .then((res) => {
        setOrder(res);
      })
      .catch((err) => {
        console.error(err);
        alert.error("Xem chi tiết đơn hàng thất bại", err.message);
        props.onClose();
      });
  };

  return (
    <Dialog
      {...props}
      title="Chi tiết đơn hàng"
      extraDialogClass="bg-transparent"
      extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
      extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
      width="650px"
    >
      {!order ? (
        <Spinner />
      ) : (
        <Dialog.Body>
          <div className="flex justify-between">
            <div className="text-xl font-bold text-primary">{order.code}</div>
            <div
              className={`status-label self-center bg-${ORDER_STATUS.find((x) => x.value == order.status)?.color
                }`}
            >
              {ORDER_STATUS.find((x) => x.value == order.status)?.label}
            </div>
          </div>
          <div className="flex items-start mt-1 text-gray-700 gap-x-2">
            <i className="mt-1">
              <RiCalendarTodoLine />
            </i>
            <span>
              <strong className="font-semibold">Ngày đặt: </strong>
              {formatDate(order.createdAt, "dd-MM-yyyyy HH:mm")}
            </span>
          </div>
          <div className="flex items-start mt-1 text-gray-700 gap-x-2">
            <i className="mt-1">
              <RiUser5Line />
            </i>
            <span>
              <strong className="font-semibold">Khách hàng: </strong>
              {order.buyerName}【{order.buyerPhone}】
            </span>
          </div>
          {order.pickupMethod == "DELIVERY" && (
            <div className="flex items-start mt-1 text-gray-700 gap-x-2">
              <i className="mt-1">
                <RiHome6Line />
              </i>
              <span>
                <strong className="font-semibold">Địa chỉ: </strong>
                {order.buyerFullAddress}
              </span>
            </div>
          )}
          <div className="flex items-start mt-1 text-gray-700 gap-x-2">
            <i className="mt-1">
              <RiStickyNoteLine />
            </i>
            <span>
              <strong className="font-semibold">Ghi chú: </strong>
              {order.note || <span className="text-gray-400">Không có</span>}
            </span>
          </div>
          <hr className="my-3 border-gray-300" />
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div className="col-span-1 text-gray-700">
              <div className="font-semibold mb-0.5">Phương thức thanh toán</div>
              <div>{order.paymentMethodText}</div>
            </div>
            {order.paymentMethod == "BANK_TRANSFER" && (
              <div className="col-span-2 text-gray-700">
                <div className="font-semibold mb-0.5">Đã thanh toán</div>
                <div className="font-semibold text-success">
                  {parseNumber(order.paymentFilledAmount, true)}
                </div>
              </div>
            )}
            <div className="text-gray-700">
              <div className="font-semibold mb-0.5">Phương thức lấy hàng</div>
              <div>{order.pickupMethod == "DELIVERY" ? "Giao hàng" : "Nhận tại cửa hàng"}</div>
            </div>
            <div className="text-gray-700">
              <div className="font-semibold mb-0.5">Tình trạng giao hàng</div>
              <div>{order.deliveryInfo?.statusText || "[Không có]"}</div>
            </div>
            {order.pickupMethod == "STORE" && (
              <>
                <div className="text-gray-700">
                  <div className="font-semibold">Thời gian lấy hàng</div>
                  <div>【{formatDate(order.pickupTime, "HH:mm dd-MM-yyyy")}】</div>
                </div>
                <div className="text-gray-700">
                  <div className="font-semibold">Chi nhánh</div>
                  <div>{order.shopBranch?.name}</div>
                </div>
                {order.tableCode && (
                  <div className="text-gray-700">
                    <div className="font-semibold">Đặt tại bàn</div>
                    <div>{order.tableCode}</div>
                  </div>
                )}
              </>
            )}
          </div>
          {order.driverId && (
            <>
              <hr className="my-3 border-gray-300" />
              <div className="grid grid-cols-3 gap-2 mb-1">
                <div className="text-gray-700">
                  <div className="font-semibold">Tên tài xế</div>
                  <div>{order.driverName}</div>
                </div>
                <div className="text-gray-700">
                  <div className="font-semibold">SĐT tài xế</div>
                  <div>{order.driverPhone}</div>
                </div>
                <div className="text-gray-700">
                  <div className="font-semibold">Biển số xe tài xế</div>
                  <div>{order.driverLicense}</div>
                </div>
              </div>
            </>
          )}
          <div className="my-3 rounded-sm border-group">
            {ORDER_TABS.map((tab, index) => (
              <Button
                key={index}
                outline={selectedTab != tab.value}
                primary={selectedTab == tab.value}
                className="border"
                medium
                text={tab.label}
                onClick={() => setSelectedTab(tab.value)}
              />
            ))}
          </div>
          {
            {
              products: <ProductsTab order={order} />,
              order_history: <OrderHistoryTabs order={order} />,
              delivery_history: <DeliveryHistoryTabs order={order} />,
              payment_history: <PaymentHistoryTabs order={order} />,
            }[selectedTab]
          }
        </Dialog.Body>
      )}
    </Dialog>
  );
}

function ProductsTab({ order }: { order: Order }) {
  return (
    <div className="animate-emerge">
      <table className="w-full border border-collapse border-gray-400 rounded">
        <thead>
          <tr className="font-semibold text-gray-700 border-b border-gray-400 whitespace-nowrap">
            <th className="w-6 p-2 text-center">STT</th>
            <th className="p-2 text-left">Sản phẩm</th>
            <th className="p-2 text-center">Số lượng</th>
            <th className="p-2 text-right">Giá</th>
            <th className="p-2 text-right">Tổng giá</th>
          </tr>
        </thead>
        <tbody>
          {!order.items.length && (
            <tr>
              <td colSpan={6} className="table-cell text-center text-gray-300">
                Không có sản phẩm
              </td>
            </tr>
          )}
          {order.items.map((item, index) => (
            <tr
              className={`text-gray-700 ${index != order.items.length - 1 ? "border-b border-gray-300" : ""
                }`}
              key={item.id}
            >
              <td className="w-6 p-2 text-center">{index + 1}</td>
              <td className="p-2 text-left">
                <div className="flex">
                  <Img
                    compress={200}
                    className="rounded w-14"
                    src={item.product.image}
                    showImageOnClick
                  />
                  <div className="flex-1 pl-2">
                    <div className="font-semibold">{item.productName}</div>
                    <div className="text-gray-500">
                      {item.toppings?.map((x) => x.optionName).join(", ")}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-2 text-center">{item.qty}</td>
              <td className="p-2 text-right">{parseNumber(item.basePrice, true)}</td>
              <td className="p-2 text-right">{parseNumber(item.amount, true)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid pr-1 mt-3 ml-auto font-semibold text-gray-800 w-72 gap-y-1">
        <div className="flex justify-between">
          <div>Tiền hàng</div>
          <div>{parseNumber(order.subtotal, true)}</div>
        </div>
        <div className="flex justify-between">
          <div>Phí ship</div>
          <div>{parseNumber(order.shipfee, true)}</div>
        </div>
        {order.deliveryInfo?.promotionCode && (
          <div className="flex justify-between">
            <div>
              Giảm ship: <span>[{order.deliveryInfo.promotionCode}]</span>
            </div>
            <div>{parseNumber(-order.deliveryInfo.partnerDiscount, true)}</div>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <div>Tổng tiền</div>
          <div className="text-danger">{parseNumber(order.amount, true)}</div>
        </div>
      </div>
    </div>
  );
}

function OrderHistoryTabs({ order }: { order: Order }) {
  const [orderLogs, setOrderLogs] = useState<OrderLog[]>(null);

  useEffect(() => {
    OrderLogService.getAll({ query: { limit: 0, filter: { orderId: order.id } } }).then((res) => {
      setOrderLogs(res.data);
    });
  }, []);

  if (!orderLogs) return <Spinner />;
  return (
    <div className="animate-emerge">
      <table className="w-full border border-collapse border-gray-400 rounded">
        <thead>
          <tr className="font-semibold text-gray-700 border-b border-gray-400 whitespace-nowrap">
            <th className="w-6 p-2 text-center">Thời điểm</th>
            <th className="p-2 text-left">Nội dung</th>
          </tr>
        </thead>
        <tbody>
          {!orderLogs.length ? (
            <tr>
              <td colSpan={6} className="table-cell h-32 text-center text-gray-300">
                Không có lịch sử đơn hàng
              </td>
            </tr>
          ) : (
            orderLogs.map((orderLog, index) => (
              <tr
                key={orderLog.id}
                className={`text-gray-700 ${index != orderLogs.length - 1 ? "border-b border-gray-300" : ""
                  }`}
              >
                <td className="p-2 text-center whitespace-nowrap">
                  {formatDate(orderLog.createdAt, "dd-MM-yyyy HH:mm")}
                </td>
                <td className="p-2 text-left">{orderLog.note}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DeliveryHistoryTabs({ order }: { order: Order }) {
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>(null);

  useEffect(() => {
    DeliveryLogService.getAll({ query: { limit: 0, filter: { orderId: order.id } } }).then(
      (res) => {
        setDeliveryLogs(res.data);
      }
    );
  }, []);

  if (!deliveryLogs) return <Spinner />;
  return (
    <div className="animate-emerge">
      <table className="w-full border border-collapse border-gray-400 rounded">
        <thead>
          <tr className="font-semibold text-gray-700 border-b border-gray-400 whitespace-nowrap">
            <th className="w-6 p-2 text-center">Thời điểm</th>
            <th className="p-2 text-left">Nội dung</th>
          </tr>
        </thead>
        <tbody>
          {!deliveryLogs.length ? (
            <tr>
              <td colSpan={6} className="table-cell h-32 text-center text-gray-300">
                Không có lịch sử giao hàng
              </td>
            </tr>
          ) : (
            deliveryLogs.map((deliveryLog, index) => (
              <tr
                key={deliveryLog.id}
                className={`text-gray-700 ${index != deliveryLogs.length - 1 ? "border-b border-gray-300" : ""
                  }`}
              >
                <td className="p-2 text-center whitespace-nowrap">
                  {formatDate(deliveryLog.createdAt, "dd-MM-yyyy HH:mm")}
                </td>
                <td className="p-2 text-left">
                  {deliveryLog.statusName}{" "}
                  {`${order?.deliveryInfo?.orderId ? `【MVD - ${order?.deliveryInfo?.orderId} 】` : ""
                    }`}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PaymentHistoryTabs({ order }: { order: Order }) {
  const [paymentLogs, setPaymentLogs] = useState<PaymentLogs[]>();

  useEffect(() => {
    setPaymentLogs(order?.paymentLogs);
  }, []);

  if (!paymentLogs) return <Spinner />;
  return (
    <div className="animate-emerge">
      <table className="w-full border border-collapse border-gray-400 rounded">
        <thead>
          <tr className="font-semibold text-gray-700 border-b border-gray-400 whitespace-nowrap">
            <th className="w-6 p-2 text-center">Thời điểm</th>
            <th className="p-2 text-left">Nội dung</th>
          </tr>
        </thead>
        <tbody>
          {!paymentLogs?.length ? (
            <tr>
              <td colSpan={6} className="table-cell h-32 text-center text-gray-300">
                Không có lịch sử giao hàng
              </td>
            </tr>
          ) : (
            paymentLogs?.map((log, index) => (
              <tr
                key={log?.meta?.id}
                className={`text-gray-700 ${index != paymentLogs?.length - 1 ? "border-b border-gray-300" : ""
                  }`}
              >
                <td className="p-2 text-center whitespace-nowrap">{log?.meta?.when}</td>
                <td className="p-2 text-left whitespace-pre-line">{log?.message}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
