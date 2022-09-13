import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";
import { useEffect, useState } from "react";
import { RiEyeLine } from "react-icons/ri";
import { formatDate } from "../../../lib/helpers/parser";
import {
  Order,
  OrderService,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PICKUP_METHODS,
} from "../../../lib/repo/order.repo";
import { ShopBranchService } from "../../../lib/repo/shop-branch.repo";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { DatePicker } from "../utilities/form/date";
import { Field } from "../utilities/form/field";
import { Select } from "../utilities/form/select";
import { DataTable } from "../utilities/table/data-table";
import { OrderDetailsDialog } from "./order-details-dialog";

interface PropsType extends DialogProps {
  filter: any;
  mode?: "driver" | "customer" | "admin";
}
export function OrdersDialog({ filter, mode = "customer", ...props }: PropsType) {
  const [orderId, setOrderId] = useState("");
  const [startDate, setStartDate] = useState<Date>(null);
  const [endDate, setEndDate] = useState<Date>(null);
  const [dateFilter, setDateFilter] = useState<any>({});

  useEffect(() => {
    if (startDate || endDate) {
      let temp = { createdAt: {} };
      if (startDate) {
        temp.createdAt["$gte"] = startOfDay(startDate);
      }
      if (endDate) {
        temp.createdAt["$lte"] = endOfDay(endDate);
      }
      setDateFilter(temp);
    } else {
      setDateFilter({});
    }
  }, [startDate, endDate]);

  return (
    <Dialog width="1280px" {...props}>
      <Dialog.Body>
        <DataTable<Order>
          crudService={OrderService}
          order={{ createdAt: -1 }}
          filter={{ ...filter, ...dateFilter }}
          fetchingCondition={!!filter}
        >
          <DataTable.Header>
            <DataTable.Title />
            <DataTable.Buttons>
              <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white" />
            </DataTable.Buttons>
          </DataTable.Header>

          <DataTable.Divider />

          <DataTable.Toolbar>
            <DataTable.Search />
            <DataTable.Filter>
              {mode == "driver" && (
                <>
                  <Field noError>
                    <DatePicker
                      placeholder="Lọc từ ngày"
                      value={startDate}
                      onChange={setStartDate}
                    />
                  </Field>
                  <Field noError>
                    <DatePicker placeholder="Lọc đến ngày" value={endDate} onChange={setEndDate} />
                  </Field>
                </>
              )}
              {mode !== "admin" && (
                <Field name="shopBranchId" noError>
                  <Select
                    autosize
                    clearable
                    placeholder="Tất cả cửa hàng"
                    optionsPromise={() => ShopBranchService.getAllOptionsPromise()}
                  />
                </Field>
              )}
              {(mode == "customer" || mode == "admin") && (
                <>
                  <Field name="pickupMethod" noError>
                    <Select
                      autosize
                      clearable
                      placeholder="Tất cả hình thức lấy hàng"
                      options={PICKUP_METHODS}
                    />
                  </Field>
                  <Field name="paymentMethod" noError>
                    <Select
                      autosize
                      clearable
                      placeholder="Tất cả hình thức thanh toán"
                      options={PAYMENT_METHODS}
                    />
                  </Field>
                </>
              )}
              <Field name="status" noError>
                <Select autosize clearable placeholder="Tất cả trạng thái" options={ORDER_STATUS} />
              </Field>
            </DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              label="Đơn hàng"
              render={(item: Order) => (
                <DataTable.CellText
                  value={
                    <>
                      <div className="font-bold text-primary">{item.code}</div>
                      <div className="text-sm text-gray-600">{item.itemCount} món</div>
                    </>
                  }
                />
              )}
            />
            <DataTable.Column
              label="Khách hàng"
              render={(item: Order) => (
                <DataTable.CellText
                  value={
                    <>
                      <div className="font-semibold text-gray-800">{item.buyerName}</div>
                      <div className="text-sm text-gray-600">{item.buyerPhone}</div>
                    </>
                  }
                />
              )}
            />
            <DataTable.Column
              center
              label="Hình thức lấy hàng"
              render={(item: Order) => (
                <DataTable.CellText
                  className="font-semibold"
                  value={PICKUP_METHODS.find((x) => x.value == item.pickupMethod)?.label}
                  subText={
                    item.pickupMethod == "DELIVERY"
                      ? `${item.deliveryInfo?.statusText || ""} ${
                          item.deliveryInfo?.orderId
                            ? `【MVD - ${item.deliveryInfo?.orderId || ""}】`
                            : ""
                        }`
                      : `【${formatDate(item.pickupTime, "HH:mm dd-MM")}】`
                  }
                />
              )}
            />
            <DataTable.Column
              center
              label="Thanh toán"
              render={(item: Order) => (
                <DataTable.CellText
                  value={
                    PAYMENT_METHODS.find((x) => x.value || item.paymentMethod)?.label ||
                    item.paymentMethod
                  }
                  className="uppercase"
                  subText={PAYMENT_STATUS.find((x) => x.value == item.paymentStatus)?.label}
                  subTextClassName={`text-sm font-semibold text-${
                    PAYMENT_STATUS.find((x) => x.value == item.paymentStatus)?.color
                  }`}
                />
              )}
            />
            <DataTable.Column
              center
              label="Ngày tạo"
              render={(item: Order) => (
                <DataTable.CellDate value={item.createdAt} format="dd-MM-yyyy HH:mm" />
              )}
            />
            <DataTable.Column
              center
              label="Trạng thái"
              render={(item: Order) => (
                <DataTable.CellStatus value={item.status} options={ORDER_STATUS} />
              )}
            />
            <DataTable.Column
              right
              label="Tổng tiền"
              render={(item: Order) => <DataTable.CellNumber currency value={item.amount} />}
            />
            <DataTable.Column
              right
              render={(item: Order) => (
                <>
                  <DataTable.CellButton
                    value={item}
                    icon={<RiEyeLine />}
                    tooltip="Xem chi tiết"
                    onClick={() => {
                      setOrderId(item.id);
                    }}
                  />
                </>
              )}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
        <OrderDetailsDialog
          orderId={orderId}
          isOpen={!!orderId}
          onClose={() => {
            setOrderId("");
          }}
        />
      </Dialog.Body>
    </Dialog>
  );
}
