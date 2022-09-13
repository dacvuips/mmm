import React, { useState } from "react";
import { parseNumber } from "../../../../lib/helpers/parser";
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
import { MemberService } from "../../../../lib/repo/member.repo";
import { Dialog } from "../../../shared/utilities/dialog/dialog";
import { Field } from "../../../shared/utilities/form/field";
import { Select } from "../../../shared/utilities/form/select";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";

export function DisbursePayoutsPage(props) {
  const [selectDisburePayout, setSelectDisburePayout] = useState<DisbursePayout>(null);
  const toast = useToast();
  return (
    <Card>
      <DataTable<DisbursePayout>
        crudService={DisbursePayoutService}
        order={{ createdAt: -1 }}
        fragment={DisbursePayoutService.fullFragment}
        filter={{ status: { __nin: ["error"] } }}
        title="Đợt chi"
      >
        <DataTable.Divider />

        <DataTable.Header>
          <DataTable.Title />
          <div className="flex gap-x-2">
            <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white" />
          </div>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            <Field name="memberId">
              <Select
                placeholder="Lọc theo cửa hàng"
                hasImage
                clearable
                autosize
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
              <DataTable.CellText value={item.processingMsg} className="max-w-xs text-ellipsis-2" />
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
            render={(item: DisbursePayout) => <DataTable.CellText value={item.transactionCount} />}
          />
          <DataTable.Column
            center
            render={(item: DisbursePayout) => (
              <DataTable.CellButton
                value={item}
                moreItems={[
                  {
                    text: "Duyệt đợt chi",
                    disabled: item.status == "approved",
                    onClick: async () => {
                      try {
                        await DisbursePayoutService.approveDisbursePayout(item.id);
                        toast.success("Duyệt đợt chi thành công");
                      } catch (error) {
                        toast.error("Duyệt đợt chi thất bại " + error);
                      }
                    },
                    refreshAfterTask: true,
                  },
                  {
                    text: "Danh sách người nhận",
                    onClick: () => setSelectDisburePayout(item),
                  },
                ]}
              />
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />
        <Dialog
          isOpen={selectDisburePayout ? true : false}
          onClose={() => setSelectDisburePayout(null)}
          width="700px"
          title={"Danh sách người nhận"}
        >
          <div className="p-5">
            <DataTable<DisburseItem>
              crudService={DisburseItemService}
              order={{ createdAt: -1 }}
              fragment={DisburseItemService.fullFragment}
              filter={{ disburseId: selectDisburePayout?.disburseId }}
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
          </div>
        </Dialog>
      </DataTable>
    </Card>
  );
}
