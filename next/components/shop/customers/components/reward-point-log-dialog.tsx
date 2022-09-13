import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";
import { useEffect, useState } from "react";
import {
  RewardPointLog,
  RewardPointLogService,
  REWARD_POINT_STATUSES,
} from "../../../../lib/repo/reward-point-log";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { DatePicker } from "../../../shared/utilities/form/date";
import { Field } from "../../../shared/utilities/form/field";
import { DataTable } from "../../../shared/utilities/table/data-table";

interface PropsType extends DialogProps {
  filter: any;
}
export function RewardPointLogDialog({ filter, ...props }: PropsType) {
  const [startDate, setStartDate] = useState<Date>(null);
  const [endDate, setEndDate] = useState<Date>(null);
  const [dateFilter, setDateFilter] = useState<any>({});

  useEffect(() => {
    if (startDate || endDate) {
      let temp = { createdAt: {} };
      if (startDate) {
        temp.createdAt["$gte"] = startOfDay(startDate);
      }
      if (endDate) {
        temp.createdAt["$lte"] = endOfDay(endDate);
      }
      setDateFilter(temp);
    } else {
      setDateFilter({});
    }
  }, [startDate, endDate]);
  return (
    <Dialog width="800px" {...props}>
      <Dialog.Body>
        <DataTable<RewardPointLog>
          crudService={RewardPointLogService}
          order={{ createdAt: -1 }}
          fragment={RewardPointLogService.fullFragment}
          filter={{ ...filter, ...dateFilter }}
          fetchingCondition={!!filter}
        >
          <DataTable.Toolbar>
            <DataTable.Title>Lịch sử điểm thưởng</DataTable.Title>
            <DataTable.Filter>
              <DataTable.Button outline isRefreshButton refreshAfterTask />
              <Field noError>
                <DatePicker placeholder="Lọc từ ngày" value={startDate} onChange={setStartDate} />
              </Field>
              <Field noError>
                <DatePicker placeholder="Lọc đến ngày" value={endDate} onChange={setEndDate} />
              </Field>
            </DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              width={200}
              label="Thời điểm"
              render={(item: RewardPointLog) => (
                <DataTable.CellDate value={item.createdAt} format="dd-MM-yyyy HH:mm" />
              )}
            />
            <DataTable.Column
              center
              label="Trạng thái"
              render={(item: RewardPointLog) => (
                <DataTable.CellStatus value={item.type} options={REWARD_POINT_STATUSES} />
              )}
            />
            <DataTable.Column
              center
              label="Giá trị"
              render={(item: RewardPointLog) => <DataTable.CellText value={item.value} />}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
      </Dialog.Body>
    </Dialog>
  );
}
