import { useEffect, useMemo, useState } from "react";
import { DialogProps, Dialog } from "../../../shared/utilities/dialog/dialog";
import { useDevice } from "../../../../lib/hooks/useDevice";
import { Spinner } from "../../../shared/utilities/misc";
import { Field } from "../../../shared/utilities/form/field";
import { DatePicker } from "../../../shared/utilities/form/date";
import { RewardPointLog, RewardPointLogService } from "../../../../lib/repo/reward-point-log";
import { cloneDeep } from "lodash";
import { formatDate, parseNumber } from "../../../../lib/helpers/parser";

interface RewardPointDialogProps extends DialogProps {}
export function RewardPointDialog(props: RewardPointDialogProps) {
  const [rewardLogs, setRewardLogs] = useState<RewardPointLog[]>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [total, setTotal] = useState(-1);
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
  useEffect(() => {
    if (!filter) return;
    if (filter["updatedAt"]) {
      setTotal(null);
      RewardPointLogService.getAll({
        query: {
          limit: 0,
          filter,
        },
      }).then((res) => {
        setRewardLogs(cloneDeep(res.data));
        setTotal(res.data.reduce((total, item) => total + item.value, 0));
      });
    } else {
      setTotal(-1);
    }
  }, [filter]);
  async function getCommissions() {
    RewardPointLogService.getAll({ query: { order: { createdAt: -1 } }, cache: false })
      .then((res) => setRewardLogs(res.data))
      .catch((err) => console.error(err));
  }
  useEffect(() => {
    getCommissions();
  }, []);
  const { isMobile } = useDevice();
  return (
    <Dialog {...props} title={`Lịch sử điểm thưởng (${rewardLogs?.length || 0})`}>
      <div
        className={`bg-white shadow relative rounded-md w-full v-scrollbar ${
          isMobile ? "pb-12" : ""
        }`}
        style={{ maxHeight: `calc(96vh - 150px)`, minHeight: `calc(96vh - 350px)` }}
      >
        <div
          className="h-12 px-3 py-1 mx-4 mt-4 mb-3 text-sm border rounded bg-primary-light border-primary"
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
              {parseNumber(total, false)}
            </div>
          )}
        </div>
        <div className="grid grid-cols-12 gap-3 px-4">
          <Field noError cols={6}>
            <DatePicker
              value={fromDate}
              onChange={(val) => setFromDate(val)}
              className="h-12"
              placeholder="Từ ngày"
            />
          </Field>
          <Field noError cols={6}>
            <DatePicker
              value={toDate}
              onChange={(val) => setToDate(val)}
              className="h-12"
              placeholder="Đến ngày"
            />
          </Field>
        </div>
        {rewardLogs ? (
          <>
            {rewardLogs.length > 0 ? (
              <>
                {rewardLogs.map((item: RewardPointLog, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 flex items-center justify-between ${
                      index < rewardLogs.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <span>{formatDate(item.createdAt, "dd-MM-yyyy hh:mm")}</span>
                    <span
                      className={`font-bold text-lg ${
                        item.value > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {item.value > 0 && "+"}
                      {parseNumber(item.value, false)}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="px-4 mt-10 text-center">Chưa có lịch sử hoa hồng</div>
            )}
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </Dialog>
  );
}
