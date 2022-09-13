import format from "date-fns/format";
import { useState } from "react";
import { RiEyeLine } from "react-icons/ri";
import { formatDate } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { MemberService } from "../../../../lib/repo/member.repo";
import { Order, OrderService, ORDER_STATUS, PICKUP_METHODS } from "../../../../lib/repo/order.repo";
import { OrderDetailsDialog } from "../../../shared/shop-layout/order-details-dialog";
import { Field } from "../../../shared/utilities/form/field";
import { Select } from "../../../shared/utilities/form/select";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { ExportOrderDialog } from "./components/export-orders-dialog";

export function OrdersPage(props) {
  const [orderId, setOrderId] = useState<string>("");
  const [openExportOrder, setOpenExportOrder] = useState(false);
  const { adminPermission } = useAuth();
  const hasExecutePermission = adminPermission("EXECUTE_ORDERS");

  return (
    <Card>
      <DataTable<Order> crudService={OrderService} order={{ createdAt: -1 }} autoRefresh={30000}>
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton refreshAfterTask />
            <DataTable.Button
              primary
              text="Xuất danh sách đơn hàng"
              onClick={() => setOpenExportOrder(true)}
              disabled={!hasExecutePermission}
            />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            <Field name="sellerId" noError>
              <Select
                className="min-w-2xs"
                placeholder="Lọc theo cửa hàng"
                hasImage
                clearable
                autocompletePromise={({ id, search }) =>
                  MemberService.getAllAutocompletePromise(
                    { id, search },
                    {
                      fragment: "id shopName shopLogo",
                      parseOption: (data) => ({
                        value: data.id,
                        label: data.shopName,
                        image: data.shopLogo,
                      }),
                    }
                  )
                }
              />
            </Field>
            {/* <Field name="pickupMethod" noError>
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
            <Field name="status" noError>
              <Select autosize clearable placeholder="Tất cả trạng thái" options={ORDER_STATUS} />
            </Field> */}
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
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
            label="Cửa hàng"
            render={(item: Order) => (
              <DataTable.CellText
                value={item.seller?.shopName}
                subText={item.seller?.code}
                image={item.seller?.shopLogo}
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
                    ? `${item.deliveryInfo?.statusText || ""} ${item.deliveryInfo?.orderId
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
            render={(item: Order) => <DataTable.CellText value={item.paymentMethod} />}
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

        <DataTable.Consumer>
          {({ filter }) => (
            <ExportOrderDialog
              isOpen={openExportOrder}
              onClose={() => {
                setOpenExportOrder(false);
              }}
              memberId={filter.sellerId}
            />
          )}
        </DataTable.Consumer>
      </DataTable>
      <OrderDetailsDialog
        orderId={orderId}
        isOpen={!!orderId}
        onClose={() => {
          setOrderId("");
        }}
      />
    </Card>
  );
}
