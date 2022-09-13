import {
  LuckyWheelResult,
  LuckyWheelResultService,
} from "../../../../lib/repo/lucky-wheel-result.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { DataTable } from "../../../shared/utilities/table/data-table";

interface PropsType extends DialogProps {
  luckyWheelId: string;
}
export function LuckyWheelResultsDialog({ luckyWheelId = "", ...props }: PropsType) {
  return (
    <Dialog width="800px" {...props}>
      <Dialog.Body>
        <DataTable<LuckyWheelResult>
          crudService={LuckyWheelResultService}
          order={{ createdAt: -1 }}
          filter={{ luckyWheelId }}
          fetchingCondition={!!luckyWheelId}
        >
          <DataTable.Header>
            <DataTable.Title />
            <DataTable.Buttons>
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
            <DataTable.Filter></DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              label="Khách hàng"
              render={(item: LuckyWheelResult) => (
                <DataTable.CellText
                  value={
                    <>
                      <div className="font-bold text-gray-800">{item.customer?.name}</div>
                      <div className="text-sm text-gray-600">{item.customer?.phone}</div>
                    </>
                  }
                />
              )}
            />
            <DataTable.Column
              label="Phần thưởng"
              render={(item: LuckyWheelResult) => (
                <DataTable.CellText
                  value={
                    <>
                      <div className="font-semibold text-gray-700">{item.gift?.name}</div>
                      {item.voucher && (
                        <div className="text-sm text-gray-600">
                          Mã voucher: {item.voucher.voucherCode}{" "}
                          {item.voucher.status == "STILL_ALIVE" ? (
                            <span className="ml-2 text-info">Chưa sử dụng</span>
                          ) : (
                            <span className="ml-2 text-danger">Hết hạn</span>
                          )}
                        </div>
                      )}
                    </>
                  }
                />
              )}
            />
            <DataTable.Column
              center
              label="Ngày quay"
              render={(item: LuckyWheelResult) => (
                <DataTable.CellDate value={item.createdAt} format="dd-MM-yyyy HH:mm" />
              )}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
      </Dialog.Body>
    </Dialog>
  );
}
