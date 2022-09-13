import { useEffect, useMemo, useState } from "react";
import { RiPhoneLine, RiUserLine } from "react-icons/ri";
import { parseNumber } from "../../../lib/helpers/parser";
import { Order, OrderService, PAYMENT_METHODS } from "../../../lib/repo/order.repo";
import { ShopBranchService } from "../../../lib/repo/shop-branch.repo";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { DatePicker } from "../../shared/utilities/form/date";
import { Field } from "../../shared/utilities/form/field";
import { Select } from "../../shared/utilities/form/select";
import { DataTable } from "../../shared/utilities/table/data-table";

export function PaymentHistoryPage(props: ReactProps) {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [shopBranchId, setShopBranchesId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [total, setTotal] = useState(-1);

  const filter = useMemo(() => {
    let tempFilter = { status: "COMPLETED" };
    if (shopBranchId) {
      tempFilter["shopBranchId"] = shopBranchId;
    }
    if (paymentMethod) {
      tempFilter["paymentMethod"] = paymentMethod;
    }
    if (fromDate || toDate) {
      tempFilter["updatedAt"] = {};
      if (fromDate) {
        tempFilter["updatedAt"]["$gte"] = fromDate;
      }
      if (toDate) {
        tempFilter["updatedAt"]["$lte"] = toDate;
      }
    }
    return tempFilter;
  }, [fromDate, toDate, shopBranchId, paymentMethod]);

  useEffect(() => {
    if (filter["updatedAt"]) {
      setTotal(null);
      OrderService.getAll({
        query: {
          limit: 0,
          filter,
        },
        fragment: "id amount",
      }).then((res) => {
        setTotal(res.data.reduce((total, item) => total + item.amount, 0));
      });
    } else {
      setTotal(-1);
    }
  }, [filter]);

  return (
    <>
      <DataTable<Order> crudService={OrderService} order={{ updatedAt: -1 }} filter={filter}>
        <DataTable.Header>
          <ShopPageTitle title="Thanh toán" subtitle="Lịch sử thanh toán" />
          <DataTable.Buttons>
            <div
              className="h-12 px-3 py-1 mr-1 text-sm border rounded bg-primary-light border-primary"
              style={{ minWidth: 250 }}
            >
              <div className="font-semibold text-primary-dark text-xs mb-0.5">
                Tổng tiền theo bộ lọc
              </div>
              {total === null && (
                <div className="text-gray-600 loading-ellipsis animate-emerge">Đang tính</div>
              )}
              {total === -1 && (
                <div className="text-gray-600 animate-emerge">Hiển thị khi lọc theo ngày</div>
              )}
              {total !== null && total >= 0 && (
                <div className="font-semibold text-gray-700 animate-emerge">
                  {parseNumber(total, true)}
                </div>
              )}
            </div>
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search className="h-12" />
          <DataTable.Filter>
            <Field noError>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                className="h-12"
                placeholder="Từ ngày"
              />
            </Field>
            <Field noError>
              <DatePicker
                value={toDate}
                onChange={setToDate}
                className="h-12"
                placeholder="Đến ngày"
              />
            </Field>
            <Field noError>
              <Select
                value={shopBranchId}
                onChange={setShopBranchesId}
                className="inline-grid h-12"
                autosize
                clearable
                placeholder="Tất cả cửa hàng"
                optionsPromise={() => ShopBranchService.getAllOptionsPromise()}
              />
            </Field>
            <Field noError>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                className="inline-grid h-12"
                autosize
                clearable
                placeholder="Tất cả hình thức thanh toán"
                options={PAYMENT_METHODS}
              />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4 bg-white">
          <DataTable.Column
            label="Khách hàng"
            render={(item: Order) => (
              <DataTable.CellText
                value={
                  <div className="flex font-semibold">
                    <i className="mt-1 mr-1 text-lg">
                      <RiPhoneLine />
                    </i>
                    {item.buyerPhone}
                  </div>
                }
                subTextClassName="flex text-sm mt-1"
                subText={
                  <>
                    <i className="mt-0.5 mr-2">
                      <RiUserLine />
                    </i>
                    {item.buyerName || "Khách vãng lai"}
                  </>
                }
              />
            )}
          />
          <DataTable.Column
            label="Đơn hàng"
            render={(item: Order) => <DataTable.CellText value={item.code} />}
          />
          <DataTable.Column
            center
            label="Tiền vào"
            render={(item: Order) => <DataTable.CellNumber currency value={item.amount} />}
          />
          <DataTable.Column
            center
            label="Giờ vào"
            render={(item: Order) => (
              <DataTable.CellDate value={item.updatedAt} format="dd-MM-yyyy HH:mm" />
            )}
          />
          <DataTable.Column
            center
            label="Thanh toán"
            render={(item: Order) => (
              <DataTable.CellStatus options={PAYMENT_METHODS} value={item.paymentMethod} />
            )}
          />
          <DataTable.Column
            label="Ghi chú"
            render={(item: Order) => <DataTable.CellText value={item.note} />}
          />
        </DataTable.Table>
        <DataTable.Pagination />
      </DataTable>
    </>
  );
}
