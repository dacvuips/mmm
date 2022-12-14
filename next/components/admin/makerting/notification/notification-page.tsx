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
              <DatePicker value={fromDate} onChange={setFromDate} placeholder="T??? ng??y" />
            </Field>
            <Field noError>
              <DatePicker value={toDate} onChange={setToDate} placeholder="?????n ng??y" />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>
        <DataTable.Table className="mt-4 bg-white">
          <DataTable.Column
            label="???nh"
            center
            render={(item: AdminNotification) => (
              <DataTable.CellImage center value={item.image} className="w-12" />
            )}
          />
          <DataTable.Column
            label="Ti??u ?????"
            center
            render={(item: AdminNotification) => (
              <DataTable.CellText value={item.title} className="max-w-sm text-ellipsis-2" />
            )}
          />
          <DataTable.Column
            label="N???i dung"
            center
            render={(item: AdminNotification) => (
              <DataTable.CellText value={item.body} className="max-w-md text-ellipsis-2" />
            )}
          />
          <DataTable.Column
            label="???? g???i"
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
                  tooltip="L???ch s??? g???i th??ng b??o"
                  value={item}
                  icon={<RiHistoryLine />}
                  onClick={() => {
                    setOpenLogHistory(item);
                  }}
                />
                <DataTable.CellButton
                  tooltip="G???i th??ng b??o"
                  value={item}
                  icon={<RiShareForwardLine />}
                  onClick={() => {
                    hasWritePermission
                      ? setOpenSendNotifyDialog(item)
                      : toast.info("B???n kh??ng c?? quy???n th???c hi???n t??nh n??ng n??y");
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
          title="G???i th??ng b??o"
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
              toast.success("G???i th??ng b??o th??nh c??ng.");
              setOpenSendNotifyDialog(null);
            } catch (err) {
              toast.error("G???i th??ng b??o th???t b???i. " + err.message);
            }
          }}
        >
          <Field required name="target" label="?????i t?????ng">
            <Select options={[{ value: "MEMBER", label: "Ch??? shop" }]} />
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
    <Dialog width="700px" title="L???ch s??? g???i th??ng b??o" {...props}>
      <Dialog.Body>
        <Table items={adminNotificationLogs}>
          <Table.Column
            label="Ng?????i g???i"
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
            label="Ng??y g???i"
            center
            render={(item: NotifySendLog) => <DataTable.CellDate value={item.createdAt} />}
          />

          <Table.Column
            label="?????i t?????ng"
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
            label="???? g???i"
            center
            render={(item: NotifySendLog) => <DataTable.CellBoolean value={item.sended} />}
          />
          <Table.Column
            label="???? xem"
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
        label="Ti??u ?????"
        name="title"
        cols={12}
        required
        validation={{ titleVal: (val) => validateKeyword(val) }}
      >
        <Input />
      </Field>
      <Field
        label="N???i dung"
        name="body"
        cols={12}
        required
        validation={{ bodyValid: (val) => validateKeyword(val) }}
      >
        <Textarea rows={2} />
      </Field>
      <Field label="H??nh ???nh" name="image" cols={12}>
        <ImageInput />
      </Field>
      <Field name="action.type" label="Lo???i h??nh ?????ng" cols={12}>
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
          label="???????ng d???n website"
          cols={12}
          name="action.link"
          required={actionType == "WEBSITE"}
        >
          <Input type="url" />
        </Field>
      )}
      {actionType == "PRODUCT" && (
        <Field
          label="S???n ph???m ??p d???ng"
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
        <Field label="????n h??ng" name="action.orderId" cols={12} required={actionType == "ORDER"}>
          <Select
            autocompletePromise={({ id, search }) =>
              OrderService.getAllAutocompletePromise(
                { id, search },
                {
                  fragment: "id code",
                  parseOption: (data) => ({
                    value: data.id,
                    label: `???${data.code}???`,
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
                    label: `???${data.code}???`,
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
