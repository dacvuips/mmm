import {
  CommissionLog,
  CommissionLogService,
  COMMISSION_TYPES,
} from "../../../../lib/repo/commission.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { Field } from "../../../shared/utilities/form/field";
import { useEffect, useMemo, useState } from "react";
import { DatePicker } from "../../../shared/utilities/form/date";
import { parseNumber } from "../../../../lib/helpers/parser";
import { Select } from "../../../shared/utilities/form";

interface PropsType extends DialogProps {
  filter: any;
}
export function CollaboratorCommissionDialog({ filter, ...props }: PropsType) {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [total, setTotal] = useState(-1);
  const [type, setType] = useState("");

  const filterMore = useMemo(() => {
    let tempFilter;
    if (filter) {
      tempFilter = {};
      const { customerId } = filter;
      tempFilter = { ...tempFilter, customerId };
      if (fromDate || toDate) {
        tempFilter["updatedAt"] = {};
        if (fromDate) {
          tempFilter["updatedAt"]["$gte"] = fromDate;
        }
        if (toDate) {
          tempFilter["updatedAt"]["$lte"] = toDate;
        }
      }
      if (type) {
        if (type == "in") {
          tempFilter["value"] = { $gt: 0 };
        } else {
          tempFilter["value"] = { $lt: 0 };
        }
      }
    }
    return tempFilter;
  }, [fromDate, toDate, filter, type]);

  useEffect(() => {
    if (!filterMore) return;
    if (filterMore["updatedAt"]) {
      setTotal(null);
      CommissionLogService.getAll({
        query: {
          limit: 0,
          filter: filterMore,
        },
        fragment: "id value",
      }).then((res) => {
        setTotal(res.data.reduce((total, item) => total + item.value, 0));
      });
    } else {
      setTotal(-1);
    }
  }, [filterMore]);

  return (
    <Dialog width="800px" {...props}>
      <Dialog.Body>
        <DataTable<CommissionLog>
          crudService={CommissionLogService}
          order={{ createdAt: -1 }}
          filter={filterMore}
          fetchingCondition={!!filterMore}
        >
          <DataTable.Header>
            <DataTable.Title />
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
                {total >= 0 && (
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
            {/* <DataTable.Search className="h-12" /> */}
            <DataTable.Filter>
              <Field noError>
                <Select
                  className="inline-grid h-12"
                  value={type}
                  onChange={setType}
                  autosize
                  options={[
                    { value: "", label: "Tất cả loại tiền" },
                    { value: "in", label: "Tiền vào" },
                    { value: "out", label: "Tiền ra" },
                  ]}
                />
              </Field>
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
            </DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              width={160}
              label="Thời điểm"
              render={(item: CommissionLog) => (
                <DataTable.CellDate format="dd/MM/yyyy HH:mm" value={item.createdAt} />
              )}
            />
            <DataTable.Column
              label="Nội dung"
              render={(item: CommissionLog) => (
                <DataTable.CellText value={item.note || item.content} />
              )}
            />
            <DataTable.Column
              right
              label="Hoa hồng"
              render={(item: CommissionLog) => <DataTable.CellNumber currency value={item.value} />}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
      </Dialog.Body>
    </Dialog>
  );
}
