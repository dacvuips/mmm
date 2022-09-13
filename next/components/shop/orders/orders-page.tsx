import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RiEyeLine } from 'react-icons/ri';

import { formatDate } from '../../../lib/helpers/parser';
import { useAlert } from '../../../lib/providers/alert-provider';
import { useAuth } from '../../../lib/providers/auth-provider';
import { useToast } from '../../../lib/providers/toast-provider';
import {
  FORM_RECEIPT,
  Order,
  ORDER_STATUS,
  OrderService,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PICKUP_METHODS,
} from '../../../lib/repo/order.repo';
import { ShopBranchService } from '../../../lib/repo/shop-branch.repo';
import { OrderDetailsDialog } from '../../shared/shop-layout/order-details-dialog';
import { ShopPageTitle } from '../../shared/shop-layout/shop-page-title';
import { Field } from '../../shared/utilities/form/field';
import { Form } from '../../shared/utilities/form/form';
import { Input } from '../../shared/utilities/form/input';
import { Select } from '../../shared/utilities/form/select';
import { Textarea } from '../../shared/utilities/form/textarea';
import { DataTable } from '../../shared/utilities/table/data-table';
import { DeliveryDialog } from './components/delivery-dialog';
import { ExportOrderDialog } from './components/export-orders-dialog';

export function OrdersPage(props: ReactProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>("");
  const [openExportOrder, setOpenExportOrder] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<Order>(null);
  const [openDelivery, setOpenDelivery] = useState<string>("");
  const { staffPermission, staff, member } = useAuth();
  const toast = useToast();
  const hasWritePermission = staffPermission("WRITE_ORDERS");

  useEffect(() => {
    if (router.query.id) {
      setOrderId(router.query.id as string);
    } else {
      setOrderId("");
    }
  }, [router.query]);
  const alert = useAlert();
  const approveOrder = async (orderId: string, status: string, note?: string) => {
    try {
      await OrderService.approveOrder(orderId, status);
      alert.success("Đã hoàn tất đơn hàng");
    } catch (error) {
      alert.error("Hoàn tất đơn hàng thất bại");
    }
  };

  const confirmOrder = async (orderId: string, note: string) => {
    try {
      await OrderService.confirmOrder(orderId, note);
      alert.success("Đã duyệt đơn hàng");
    } catch (error) {
      alert.error("Duyệt đơn hàng thất bại " + error);
    }
  };

  const cancelOrder = async (orderId: string, note: string) => {
    try {
      await OrderService.cancelOrder(orderId, note);
      setCancelOrderId(null);
      alert.success("Đã hủy đơn hàng");
    } catch (error) {
      alert.error("Hủy đơn hàng thất bại " + error);
    }
  };

  return (
    <>
      <DataTable<Order>
        crudService={OrderService}
        order={{ createdAt: -1 }}
        autoRefresh={30000}
        updateItem={(item) => {
          const url = new URL(location.href);
          url.searchParams.append("id", item.id);
          router.push(url.toString(), null, { shallow: true });
        }}
      >
        <DataTable.Header>
          <ShopPageTitle title="Đơn hàng" subtitle="Kiểm tra trạng thái đơn hàng" />
          <DataTable.Buttons>
            <DataTable.Button
              primary
              className="h-12"
              text="Tạo đơn"
              onClick={() => { }}
              href={`/shop/pos`}
              targetBlank
            />
            <DataTable.Button
              primary
              className="h-12"
              text="Xuất danh sách đơn hàng"
              onClick={() =>
                !hasWritePermission
                  ? toast.info("Bạn không có quyền thực hiện xuất đơn hàng")
                  : setOpenExportOrder(true)
              }
            />
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
            <div className="flex flex-wrap justify-end gap-2">
              {staffPermission("EXECUTE_ORDERS") === true && (
                <Field name="shopBranchId" noError>
                  <Select
                    className="inline-grid h-12"
                    autosize
                    clearable
                    placeholder="Tất cả cửa hàng"
                    optionsPromise={() => ShopBranchService.getAllOptionsPromise()}
                  />
                </Field>
              )}
              <Field name="pickupMethod" noError>
                <Select
                  className="inline-grid h-12"
                  autosize
                  clearable
                  placeholder="Tất cả hình thức lấy hàng"
                  options={FORM_RECEIPT}
                />
              </Field>
              <Field name="paymentMethod" noError>
                <Select
                  className="inline-grid h-12"
                  autosize
                  clearable
                  placeholder="Tất cả hình thức thanh toán"
                  options={PAYMENT_METHODS}
                />
              </Field>
              <Field name="status" noError>
                <Select
                  className="inline-grid h-12"
                  autosize
                  clearable
                  placeholder="Tất cả trạng thái"
                  options={ORDER_STATUS}
                />
              </Field>
            </div>
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
                value={FORM_RECEIPT.find((x) => x.value == item.pickupMethod)?.label}
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
            render={(item: Order) => (
              <DataTable.CellText
                value={
                  PAYMENT_METHODS.find((x) => x.value || item.paymentMethod)?.label ||
                  item.paymentMethod
                }
                className="uppercase"
                subText={
                  item.paymentMethod == "COD" && item.status == "COMPLETED"
                    ? "Hoàn thành"
                    : PAYMENT_STATUS.find((x) => x.value == item.paymentStatus)?.label
                }
                subTextClassName={`text-sm font-semibold text-${PAYMENT_STATUS.find((x) => x.value == item.paymentStatus)?.color
                  }`}
              />
            )}
          />
          <DataTable.Column
            center
            label="Chi nhánh"
            render={(item: Order) => (
              <DataTable.CellText
                className="font-medium"
                value={item.shopBranch?.name}
                subText={formatDate(item.createdAt, "dd-MM-yyyy HH:mm")}
              />
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
                  isUpdateButton
                  tooltip="Xem chi tiết"
                />
                {staffPermission("EXECUTE_ORDERS") && (
                  <DataTable.CellButton
                    value={item}
                    disabled={
                      staffPermission("EXECUTE_ORDERS") == "partial" &&
                      staff.branchId != item.shopBranch?.id
                    }
                    moreItems={[
                      {
                        text: "Xác nhận",
                        disabled: item.status !== "PENDING",
                        onClick: async () => await confirmOrder(item.id, item.note),
                        refreshAfterTask: true,
                      },
                      {
                        text: "Giao hàng",
                        disabled: item.status !== "CONFIRMED" || item?.shipMethod === "AHAMOVE",
                        onClick: () => {
                          setOpenDelivery(item.id);
                        },
                      },
                      {
                        text: "Hoàn tất",
                        disabled: item.status !== "DELIVERING",
                        onClick: async () => await approveOrder(item.id, "COMPLETED", item.note),
                        refreshAfterTask: true,
                      },
                      {
                        text: "Hủy",
                        disabled: item.status === "CANCELED" || item.status == "COMPLETED",
                        onClick: () => setCancelOrderId(item),
                      },
                    ]}
                  />
                )}
                {/* <DataTable.CellButton hoverDanger value={item} isDeleteButton /> */}
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />

        <DataTable.Consumer>
          {({ filter, loadAll }) => (
            <>
              <ExportOrderDialog
                isOpen={openExportOrder}
                onClose={() => {
                  setOpenExportOrder(false);
                }}
                shopBranchId={filter.shopBranchId}
                pickupMethod={filter.pickupMethod}
                paymentMethod={filter.paymentMethod}
                status={filter.status}
              />
              <Form
                grid
                dialog
                width={400}
                isOpen={cancelOrderId ? true : false}
                onClose={() => setCancelOrderId(null)}
                onSubmit={async (data) => {
                  await cancelOrder(cancelOrderId.id, data.note);
                  loadAll(true);
                }}
                title="Hủy đơn hàng"
              >
                <Field label="Mã đơn hàng" cols={12}>
                  <Input value={cancelOrderId?.code} readOnly></Input>
                </Field>
                <Field label="Lý do hủy đơn" name="note" cols={12}>
                  <Textarea></Textarea>
                </Field>
                <Form.Footer />
              </Form>
              <DeliveryDialog
                isOpen={!!openDelivery}
                onClose={() => {
                  setOpenDelivery("");
                }}
                orderId={openDelivery}
                onConfirm={() => {
                  loadAll(true);
                }}
              />
            </>
          )}
        </DataTable.Consumer>
      </DataTable>

      <OrderDetailsDialog
        orderId={orderId}
        isOpen={!!orderId}
        onClose={() => {
          const url = new URL(location.href);
          url.searchParams.delete("id");
          router.replace(url.toString(), null, { shallow: true });
        }}
      />
    </>
  );
}
