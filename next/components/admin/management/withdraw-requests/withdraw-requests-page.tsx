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
                placeholder="T???t c??? tr???ng th??i"
                options={WITHDRAW_REQUEST_STATUS}
              />
            </Field>
            <Field noError>
              <DatePicker value={fromDate} onChange={setFromDate} placeholder="T??? ng??y" />
            </Field>
            <Field noError>
              <DatePicker value={toDate} onChange={setToDate} placeholder="?????n ng??y" />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            orderBy="memberId"
            label="C???a h??ng"
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
            label="Ng??y y??u c???u"
            width={160}
            render={(item: WithdrawRequest) => (
              <DataTable.CellDate format="dd-MM-yyyy HH:mm" value={item.createdAt} />
            )}
          />
          <DataTable.Column
            label="Tr???ng th??i"
            center
            width={140}
            render={(item: WithdrawRequest) => (
              <DataTable.CellStatus value={item.status} options={WITHDRAW_REQUEST_STATUS} />
            )}
          />
          <DataTable.Column
            label="L?? do t??? ch???i (n???u c??)"
            render={(item: WithdrawRequest) => (
              <DataTable.CellText value={item.rejectedReason} className="text-danger" />
            )}
          />
          <DataTable.Column
            label="S??? ti???n y??u c???u r??t"
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
                          tooltip="Duy???t y??u c???u r??t ti???n"
                          icon={<RiCheckDoubleFill />}
                          onClick={async () => {
                            await alert.question(
                              "Duy???t y??u c???u r??t ti???n",
                              `Y??u c???u r??t ti???n c???a c???a h??ng "${
                                item.member.shopName
                              }" v???i s??? ti???n ${parseNumber(item.value, true)} s??? ???????c duy???t.`,
                              "Duy???t y??u c???u",
                              async () =>
                                WithdrawRequestService.update({
                                  id: item.id,
                                  data: {
                                    status: "APPROVED",
                                  },
                                })
                                  .then(async (res) => {
                                    toast.success("Duy???t y??u c???u r??t ti???n th??nh c??ng");
                                    await loadAll(true);
                                    await checkPendingWithdrawRequest();
                                    return true;
                                  })
                                  .catch((err) => {
                                    console.error(err);
                                    toast.error("Duy???t y??u c???u r??t ti???n th???t b???i. " + err.message);
                                    return false;
                                  })
                            );
                          }}
                        />
                        <DataTable.CellButton
                          hoverDanger
                          value={item}
                          tooltip="T??? ch???i y??u c???u r??t ti???n"
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
              title="T??? ch???i l???nh r??t ti???n"
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
                    toast.success("T??? ch???i y??u c???u r??t ti???n th??nh c??ng");
                    await loadAll(true);
                    await checkPendingWithdrawRequest();
                    setOpenDenyWithdrawRequest(null);
                    return true;
                  })
                  .catch((err) => {
                    console.error(err);
                    toast.error("T??? ch???i y??u c???u r??t ti???n th???t b???i. " + err.message);
                    return false;
                  });
              }}
            >
              <Field label="C???a h??ng" readOnly>
                <Input value={openDenyWithdrawRequest?.member?.shopName} />
              </Field>
              <Field label="S??? ti???n r??t" readOnly>
                <Input value={openDenyWithdrawRequest?.value} number />
              </Field>
              <Field name="rejectedReason" label="L?? do t??? ch???i">
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
