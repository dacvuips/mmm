import React, { useEffect, useState } from "react";
import { RiRefreshLine } from "react-icons/ri";
import { formatDate, parseNumber } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  DisburseItem,
  DisburseItemService,
  DISBURSE_ITEM_STATUS,
} from "../../../../lib/repo/disburse-item.repo";
import {
  DisbursePayout,
  DisbursePayoutService,
  DISBURSE_PAYOUT_STATUS,
} from "../../../../lib/repo/disburse-payout.repo";
import { Disburse, DisburseService, DISBURSE_STATUS } from "../../../../lib/repo/disburse.repo";
import { DatePicker } from "../../../shared/utilities/form/date";
import { Field } from "../../../shared/utilities/form/field";
import { Input } from "../../../shared/utilities/form/input";
import { Select } from "../../../shared/utilities/form/select";
import { Textarea } from "../../../shared/utilities/form/textarea";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";

export function DisbursePage(props) {
  const [openExportVoucher, setOpenExportVoucher] = useState(false);
  const [selectDisbure, setSelectDisbure] = useState(null);
  const toast = useToast();
  const { member } = useAuth();
  return (
    <Card>
      <div className="flex min-h-screen gap-x-4">
        <div className="flex flex-col w-96">
          <DataTable<Disburse>
            crudService={DisburseService}
            onSelectItems={(items) => setSelectDisbure(items[0])}
            order={{ createdAt: -1 }}
            filter={{ memberId: member.id }}
            fragment={DisburseService.fullFragment}
            title="Giải ngân"
          >
            <DataTable.Header>
              <DataTable.Title />

              <div className="flex items-center gap-2">
                <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white" />
                <DataTable.Button primary isCreateButton />
              </div>
            </DataTable.Header>

            <DataTable.Divider />

            <DataTable.Toolbar className="ml-auto mr-2">
              <DataTable.Filter>
                <Field name="status" noError>
                  <Select
                    placeholder="Lọc trạng thái"
                    clearable
                    autosize
                    options={DISBURSE_STATUS}
                  />
                </Field>
              </DataTable.Filter>
            </DataTable.Toolbar>
            <DataTable.Table className="mt-4 bg-white">
              <DataTable.Column
                label="Đợt giải ngân"
                render={(item: Disburse) => (
                  <DataTable.CellText
                    value={item.name}
                    subText={`${formatDate(item.startDate, "dd-MM-yyyy")} đến ${formatDate(
                      item.endDate,
                      "dd-MM-yyyy"
                    )} `}
                  />
                )}
              />
              <DataTable.Column
                label="Trạng thái"
                center
                render={(item: Disburse) => (
                  <DataTable.CellStatus value={item.status} options={DISBURSE_STATUS} />
                )}
              />
              <DataTable.Column
                right
                render={(item: Disburse) => <DataTable.CellButton value={item} isUpdateButton />}
              />
            </DataTable.Table>

            <DataTable.Consumer>
              {({ formItem }) => (
                <DataTable.Form
                  beforeSubmit={(data) => ({
                    ...data,
                    memberId: member?.id,
                  })}
                >
                  <Field name="name" label="Tên đợt giải ngân" required>
                    <Input></Input>
                  </Field>
                  <Field
                    name="startDate"
                    label="Ngày bắt đầu"
                    required
                    readOnly={formItem?.id ? true : false}
                  >
                    <DatePicker startOfDay />
                  </Field>
                  <Field
                    name="endDate"
                    label="Ngày kết thúc"
                    required
                    readOnly={formItem?.id ? true : false}
                  >
                    <DatePicker endOfDay />
                  </Field>
                  <Field name="note" label="Nội dung">
                    <Textarea />
                  </Field>
                </DataTable.Form>
              )}
            </DataTable.Consumer>
            <div className="mt-auto mb-0">
              <DataTable.Pagination />
            </div>
          </DataTable>
        </div>
        {selectDisbure && (
          <div className="flex flex-col flex-1">
            <DataTable<DisburseItem>
              crudService={DisburseItemService}
              order={{ createdAt: -1 }}
              fragment={DisburseItemService.fullFragment}
              filter={{ disburseId: selectDisbure?.id }}
              title="Người nhận"
            >
              <DataTable.Header>
                <DataTable.Title />
                <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white" />
              </DataTable.Header>

              <DataTable.Divider />

              <DataTable.Toolbar>
                <DataTable.Search />
                <DataTable.Filter>
                  <Field name="status" noError>
                    <Select
                      placeholder="Lọc trạng thái"
                      clearable
                      autosize
                      options={DISBURSE_ITEM_STATUS}
                    />
                  </Field>
                </DataTable.Filter>
              </DataTable.Toolbar>
              <DataTable.Table className="mt-4 bg-white">
                <DataTable.Column
                  label="Người nhận"
                  render={(item: DisburseItem) => (
                    <DataTable.CellText
                      value={`${item.customerName} [${item.member.name}]`}
                      subText={item.customerPhone}
                    />
                  )}
                />
                <DataTable.Column
                  label="Nội dung trạng thái"
                  center
                  render={(item: DisburseItem) => (
                    <DataTable.CellText
                      value={item.meta.statusName}
                      className="max-w-xs text-ellipsis-2"
                    />
                  )}
                />

                <DataTable.Column
                  label="Trạng thái"
                  center
                  render={(item: DisburseItem) => (
                    <DataTable.CellStatus value={item.status} options={DISBURSE_ITEM_STATUS} />
                  )}
                />
                <DataTable.Column
                  label="Giá trị"
                  right
                  render={(item: DisburseItem) => (
                    <DataTable.CellText value={parseNumber(item.value, true)} />
                  )}
                />
              </DataTable.Table>
              <DataTable.Pagination />
            </DataTable>
            <DataTable<DisbursePayout>
              crudService={DisbursePayoutService}
              order={{ createdAt: -1 }}
              fragment={DisbursePayoutService.fullFragment}
              filter={{ disburseId: selectDisbure?.id }}
              title="Đợt chi"
            >
              <DataTable.Divider />

              <DataTable.Header>
                <DataTable.Title />
                <div className="flex gap-x-2">
                  <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white" />
                  <DataTable.Button primary isCreateButton />
                </div>
              </DataTable.Header>

              <DataTable.Divider />

              <DataTable.Toolbar>
                <DataTable.Search />
                <DataTable.Filter>
                  <Field name="status" noError>
                    <Select
                      placeholder="Lọc trạng thái"
                      clearable
                      autosize
                      options={DISBURSE_PAYOUT_STATUS}
                    />
                  </Field>
                </DataTable.Filter>
              </DataTable.Toolbar>
              <DataTable.Table className="mt-4 bg-white">
                <DataTable.Column
                  label="Đợt chi"
                  render={(item: DisbursePayout) => <DataTable.CellText value={item.name} />}
                />
                <DataTable.Column
                  label="Nội dung"
                  center
                  render={(item: DisbursePayout) => (
                    <DataTable.CellText
                      value={item.processingMsg}
                      className="max-w-xs text-ellipsis-2"
                    />
                  )}
                />
                <DataTable.Column
                  label="Trạng thái"
                  center
                  render={(item: DisbursePayout) => (
                    <DataTable.CellStatus value={item.status} options={DISBURSE_PAYOUT_STATUS} />
                  )}
                />
                <DataTable.Column
                  label="Tổng chi"
                  center
                  render={(item: DisbursePayout) => (
                    <DataTable.CellText value={parseNumber(item.amount)} />
                  )}
                />
                <DataTable.Column
                  label="Thống kê"
                  center
                  render={(item: DisbursePayout) => (
                    <DataTable.CellText
                      value={
                        <div>
                          <span>{item.successAmount + " thành công"}</span> <br />
                          <span>{item.failedCount + " thất bại"}</span>
                        </div>
                      }
                    />
                  )}
                />
                <DataTable.Column
                  label="Giao dịch"
                  center
                  render={(item: DisbursePayout) => (
                    <DataTable.CellText value={item.transactionCount} />
                  )}
                />
                <DataTable.Column
                  center
                  render={(item: DisbursePayout) => (
                    <DataTable.CellButton
                      refreshAfterTask={true}
                      value={item}
                      icon={<RiRefreshLine />}
                      tooltip="Kiểm tra lại đợt chi"
                      onClick={async () => {
                        try {
                          await DisbursePayoutService.recheckPayout(item.id);
                          toast.success("Yêu cầu kiểm tra lại thành công");
                        } catch (error) {
                          toast.error("Yêu cầu kiểm tra lại thất bại " + error);
                        }
                      }}
                    />
                  )}
                />
              </DataTable.Table>
              <DataTable.Pagination />
              <DataTable.Form
                beforeSubmit={(data) => ({
                  ...data,
                  disburseId: selectDisbure?.id,
                })}
              >
                <Field name="name" label="Tên đợt chi" required>
                  <Input></Input>
                </Field>
              </DataTable.Form>
            </DataTable>
          </div>
        )}
      </div>
    </Card>
  );
}
