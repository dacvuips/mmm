import { useMemo, useState } from "react";
import { RiCheckDoubleFill, RiCloseFill } from "react-icons/ri";
import { useAdminLayoutContext } from "../../../../layouts/admin-layout/providers/admin-layout-provider";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useAlert } from "../../../../lib/providers/alert-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  WithdrawRequest,
  WithdrawRequestService,
  WITHDRAW_REQUEST_STATUS,
} from "../../../../lib/repo/withdraw-request.repo";
import { Form, Input, Textarea } from "../../../shared/utilities/form";
import { DatePicker } from "../../../shared/utilities/form/date";
import { Field } from "../../../shared/utilities/form/field";
import { Select } from "../../../shared/utilities/form/select";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";

export function WithdrawRequestsPage(props) {
  const { checkPendingWithdrawRequest } = useAdminLayoutContext();
  const [openDenyWithdrawRequest, setOpenDenyWithdrawRequest] = useState<WithdrawRequest>();

  const toast = useToast();
  const alert = useAlert();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

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
      <DataTable<WithdrawRequest>
        crudService={WithdrawRequestService}
        order={{ createdAt: -1 }}
        filter={filter}
      >
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton refreshAfterTask />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            <Field name="status" noError>
              <Select
                autosize
                clearable
                placeholder="Tất cả trạng thái"
                options={WITHDRAW_REQUEST_STATUS}
              />
            </Field>
            <Field noError>
              <DatePicker value={fromDate} onChange={setFromDate} placeholder="Từ ngày" />
            </Field>
            <Field noError>
              <DatePicker value={toDate} onChange={setToDate} placeholder="Đến ngày" />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            orderBy="memberId"
            label="Cửa hàng"
            render={(item: WithdrawRequest) => (
              <DataTable.CellText
                image={item.member.shopLogo}
                value={item.member.shopName}
                subText={item.member.code}
                className="font-semibold"
              />
            )}
          />
          <DataTable.Column
            label="Ngày yêu cầu"
            width={160}
            render={(item: WithdrawRequest) => (
              <DataTable.CellDate format="dd-MM-yyyy HH:mm" value={item.createdAt} />
            )}
          />
          <DataTable.Column
            label="Trạng thái"
            center
            width={140}
            render={(item: WithdrawRequest) => (
              <DataTable.CellStatus value={item.status} options={WITHDRAW_REQUEST_STATUS} />
            )}
          />
          <DataTable.Column
            label="Lý do từ chối (nếu có)"
            render={(item: WithdrawRequest) => (
              <DataTable.CellText value={item.rejectedReason} className="text-danger" />
            )}
          />
          <DataTable.Column
            label="Số tiền yêu cầu rút"
            right
            render={(item: WithdrawRequest) => (
              <DataTable.CellNumber value={item.value} currency className="font-semibold" />
            )}
          />
          <DataTable.Column
            right
            render={(item: WithdrawRequest) => (
              <DataTable.Consumer>
                {({ loadAll }) => (
                  <>
                    {item.status == "PENDING" && (
                      <>
                        <DataTable.CellButton
                          hoverSuccess
                          value={item}
                          tooltip="Duyệt yêu cầu rút tiền"
                          icon={<RiCheckDoubleFill />}
                          onClick={async () => {
                            await alert.question(
                              "Duyệt yêu cầu rút tiền",
                              `Yêu cầu rút tiền của cửa hàng "${
                                item.member.shopName
                              }" với số tiền ${parseNumber(item.value, true)} sẽ được duyệt.`,
                              "Duyệt yêu cầu",
                              async () =>
                                WithdrawRequestService.update({
                                  id: item.id,
                                  data: {
                                    status: "APPROVED",
                                  },
                                })
                                  .then(async (res) => {
                                    toast.success("Duyệt yêu cầu rút tiền thành công");
                                    await loadAll(true);
                                    await checkPendingWithdrawRequest();
                                    return true;
                                  })
                                  .catch((err) => {
                                    console.error(err);
                                    toast.error("Duyệt yêu cầu rút tiền thất bại. " + err.message);
                                    return false;
                                  })
                            );
                          }}
                        />
                        <DataTable.CellButton
                          hoverDanger
                          value={item}
                          tooltip="Từ chối yêu cầu rút tiền"
                          icon={<RiCloseFill />}
                          onClick={() => {
                            setOpenDenyWithdrawRequest(item);
                          }}
                        />
                      </>
                    )}
                  </>
                )}
              </DataTable.Consumer>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />
        <DataTable.Consumer>
          {({ loadAll }) => (
            <Form
              dialog
              title="Từ chối lệnh rút tiền"
              defaultValues={openDenyWithdrawRequest}
              allowResetDefaultValues
              isOpen={!!openDenyWithdrawRequest}
              onClose={() => setOpenDenyWithdrawRequest(null)}
              onSubmit={async (data) => {
                WithdrawRequestService.update({
                  id: openDenyWithdrawRequest.id,
                  data: {
                    status: "REJECTED",
                    rejectedReason: data.rejectedReason,
                  },
                })
                  .then(async (res) => {
                    toast.success("Từ chối yêu cầu rút tiền thành công");
                    await loadAll(true);
                    await checkPendingWithdrawRequest();
                    setOpenDenyWithdrawRequest(null);
                    return true;
                  })
                  .catch((err) => {
                    console.error(err);
                    toast.error("Từ chối yêu cầu rút tiền thất bại. " + err.message);
                    return false;
                  });
              }}
            >
              <Field label="Cửa hàng" readOnly>
                <Input value={openDenyWithdrawRequest?.member?.shopName} />
              </Field>
              <Field label="Số tiền rút" readOnly>
                <Input value={openDenyWithdrawRequest?.value} number />
              </Field>
              <Field name="rejectedReason" label="Lý do từ chối">
                <Textarea />
              </Field>
              <Form.Footer />
            </Form>
          )}
        </DataTable.Consumer>
      </DataTable>
    </Card>
  );
}
