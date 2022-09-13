import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { RiHistoryLine, RiShareForwardLine } from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { formatDate } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  Action,
  AdminNotification,
  AdminNotificationActionType,
  AdminNotificationService,
  ADMIN_NOTIFICATION_ACTION_TYPES,
  NotifySendLog,
} from "../../../../lib/repo/admin-notification.repo";
import { OrderService } from "../../../../lib/repo/order.repo";
import { ProductService } from "../../../../lib/repo/product.repo";
import { SupportTicketService } from "../../../../lib/repo/support-ticket.repo";
import { USER_ROLES } from "../../../../lib/repo/user.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import {
  DatePicker,
  Field,
  Form,
  FormProps,
  ImageInput,
  Input,
  Select,
  Textarea,
} from "../../../shared/utilities/form";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { Table } from "../../../shared/utilities/table/table";

export function AdminNotificationsPage(props) {
  const toast = useToast();
  const [openSendNotifyDialog, setOpenSendNotifyDialog] = useState<AdminNotification>();
  const [openLogHistory, setOpenLogHistory] = useState<AdminNotification>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const { adminPermission } = useAuth();
  const hasWritePermission = adminPermission("WRITE_NOTIFICATIONS");

  const filter = useMemo(() => {
    let tempFilter = {};
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
  }, [fromDate, toDate]);

  return (
    <Card>
      <DataTable<AdminNotification>
        crudService={AdminNotificationService}
        order={{ createdAt: -1 }}
        filter={filter}
      >
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton />
            <DataTable.Button primary isCreateButton disabled={!hasWritePermission} />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            <Field noError>
              <DatePicker value={fromDate} onChange={setFromDate} placeholder="Từ ngày" />
            </Field>
            <Field noError>
              <DatePicker value={toDate} onChange={setToDate} placeholder="Đến ngày" />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>
        <DataTable.Table className="mt-4 bg-white">
          <DataTable.Column
            label="Ảnh"
            center
            render={(item: AdminNotification) => (
              <DataTable.CellImage center value={item.image} className="w-12" />
            )}
          />
          <DataTable.Column
            label="Tiêu đề"
            center
            render={(item: AdminNotification) => (
              <DataTable.CellText value={item.title} className="max-w-sm text-ellipsis-2" />
            )}
          />
          <DataTable.Column
            label="Nội dung"
            center
            render={(item: AdminNotification) => (
              <DataTable.CellText value={item.body} className="max-w-md text-ellipsis-2" />
            )}
          />
          <DataTable.Column
            label="Đã gửi"
            center
            render={(item: AdminNotification) => (
              <DataTable.CellText value={item?.logs?.reduce((total, x) => total + x.sended, 0)} />
            )}
          />
          <DataTable.Column
            right
            render={(item: AdminNotification) => (
              <>
                <DataTable.CellButton value={item} isDeleteButton disabled={!hasWritePermission} />
                <DataTable.CellButton value={item} isUpdateButton />
                <DataTable.CellButton
                  tooltip="Lịch sử gửi thông báo"
                  value={item}
                  icon={<RiHistoryLine />}
                  onClick={() => {
                    setOpenLogHistory(item);
                  }}
                />
                <DataTable.CellButton
                  tooltip="Gửi thông báo"
                  value={item}
                  icon={<RiShareForwardLine />}
                  onClick={() => {
                    hasWritePermission
                      ? setOpenSendNotifyDialog(item)
                      : toast.info("Bạn không có quyền thực hiện tính năng này");
                  }}
                />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />
        <DataTable.Consumer>
          {({ formItem }) => (
            <>
              <NotificationForm notification={formItem} editDisabled={!hasWritePermission} />
            </>
          )}
        </DataTable.Consumer>
        <Form
          title="Gửi thông báo"
          dialog
          width={450}
          isOpen={!!openSendNotifyDialog}
          onClose={() => setOpenSendNotifyDialog(null)}
          onSubmit={async (data) => {
            try {
              await AdminNotificationService.sendAdminNotification(
                openSendNotifyDialog?.id,
                data.target
              );
              toast.success("Gửi thông báo thành công.");
              setOpenSendNotifyDialog(null);
            } catch (err) {
              toast.error("Gửi thông báo thất bại. " + err.message);
            }
          }}
        >
          <Field required name="target" label="Đối tượng">
            <Select options={[{ value: "MEMBER", label: "Chủ shop" }]} />
          </Field>
          <Form.Footer />
        </Form>
        <LogHistoryDialog
          adminNotification={openLogHistory}
          isOpen={!!openLogHistory}
          onClose={() => setOpenLogHistory(null)}
        />
      </DataTable>
    </Card>
  );
}
function LogHistoryDialog({
  adminNotification,
  ...props
}: {
  adminNotification: AdminNotification;
} & DialogProps) {
  const [adminNotificationLogs, setAdminNotificationLogs] = useState<NotifySendLog[]>();

  useEffect(() => {
    setAdminNotificationLogs(null);
    if (adminNotification) {
      AdminNotificationService.getOne({
        id: adminNotification.id,
      }).then((res) => {
        setAdminNotificationLogs(res.logs);
      });
    }
  }, [adminNotification]);

  return (
    <Dialog width="700px" title="Lịch sử gửi thông báo" {...props}>
      <Dialog.Body>
        <Table items={adminNotificationLogs}>
          <Table.Column
            label="Người gửi"
            center
            render={(item: NotifySendLog) => (
              <DataTable.CellText
                value={item.owner?.name}
                subText={item.owner?.phone}
                className="font-semibold"
              />
            )}
          />

          <Table.Column
            label="Ngày gửi"
            center
            render={(item: NotifySendLog) => <DataTable.CellDate value={item.createdAt} />}
          />

          <Table.Column
            label="Đối tượng"
            center
            render={(item: NotifySendLog) => (
              <DataTable.CellText
                value={item.targets
                  ?.map((x) => USER_ROLES.find((x) => x.value == x)?.label)
                  .join(", ")}
              />
            )}
          />

          <Table.Column
            label="Đã gửi"
            center
            render={(item: NotifySendLog) => <DataTable.CellBoolean value={item.sended} />}
          />
          <Table.Column
            label="Đã xem"
            center
            render={(item: NotifySendLog) => <DataTable.CellBoolean value={item.seen} />}
          />
        </Table>
      </Dialog.Body>
    </Dialog>
  );
}
interface PropsType extends FormProps {
  notification: AdminNotification;
  editDisabled: boolean;
}
function NotificationForm({ editDisabled, ...props }: PropsType) {
  return (
    <DataTable.Form
      grid
      footerProps={{
        submitProps: { disabled: editDisabled },
      }}
    >
      <Field
        label="Tiêu đề"
        name="title"
        cols={12}
        required
        validation={{ titleVal: (val) => validateKeyword(val) }}
      >
        <Input />
      </Field>
      <Field
        label="Nội dung"
        name="body"
        cols={12}
        required
        validation={{ bodyValid: (val) => validateKeyword(val) }}
      >
        <Textarea rows={2} />
      </Field>
      <Field label="Hình ảnh" name="image" cols={12}>
        <ImageInput />
      </Field>
      <Field name="action.type" label="Loại hành động" cols={12}>
        <Select options={ADMIN_NOTIFICATION_ACTION_TYPES}></Select>
      </Field>
      <ActionTypeFields />
    </DataTable.Form>
  );
}

function ActionTypeFields() {
  const { watch } = useFormContext();
  const actionType: AdminNotificationActionType = watch("action.type");

  return (
    <>
      {actionType == "WEBSITE" && (
        <Field
          label="Đường dẫn website"
          cols={12}
          name="action.link"
          required={actionType == "WEBSITE"}
        >
          <Input type="url" />
        </Field>
      )}
      {actionType == "PRODUCT" && (
        <Field
          label="Sản phẩm áp dụng"
          name="action.productId"
          cols={12}
          required={actionType == "PRODUCT"}
        >
          <Select
            optionsPromise={() =>
              ProductService.getAllOptionsPromise({
                query: {
                  limit: 0,
                },
                fragment: "id name basePrice",
                parseOption: (data) => ({
                  value: data.id,
                  label: data.name,
                }),
              })
            }
          />
        </Field>
      )}
      {actionType == "ORDER" && (
        <Field label="Đơn hàng" name="action.orderId" cols={12} required={actionType == "ORDER"}>
          <Select
            autocompletePromise={({ id, search }) =>
              OrderService.getAllAutocompletePromise(
                { id, search },
                {
                  fragment: "id code",
                  parseOption: (data) => ({
                    value: data.id,
                    label: `【${data.code}】`,
                  }),
                }
              )
            }
          />
        </Field>
      )}
      {actionType == "SUPPORT_TICKET" && (
        <Field
          label="Ticket"
          name="action.ticketId"
          cols={12}
          required={actionType == "SUPPORT_TICKET"}
        >
          <Select
            autocompletePromise={({ id, search }) =>
              SupportTicketService.getAllAutocompletePromise(
                { id, search },
                {
                  fragment: "id code",
                  parseOption: (data) => ({
                    value: data.id,
                    label: `【${data.code}】`,
                  }),
                }
              )
            }
          />
        </Field>
      )}
    </>
  );
}
