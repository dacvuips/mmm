import React from "react";
import { formatDate, parseNumber } from "../../../../lib/helpers/parser";
import { useDevice } from "../../../../lib/hooks/useDevice";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { CommissionLog } from "../../../../lib/repo/commission.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { DatePicker } from "../../../shared/utilities/form/date";
import { Spinner } from "../../../shared/utilities/misc";
import { useCollaboratorContext } from "../providers/collaborator-provider";

interface HistoryDialogProps extends DialogProps {}
export function HistoryDialog(props: HistoryDialogProps) {
  const { commissions, setFromDate, setToDate, total, fromDate, toDate } = useCollaboratorContext();

  const { shopCode } = useShopContext();
  let screenSm = useScreen("sm");
  const { isMobile } = useDevice();
  return (
    <Dialog {...props} title={`Lịch sử hoa hồng (${commissions?.length || 0})`}>
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
              {parseNumber(total, true)}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-4">
          <DatePicker
            value={fromDate}
            onChange={(val) => setFromDate(val)}
            className="h-12"
            placeholder="Từ ngày"
          />
          <DatePicker
            value={toDate}
            onChange={(val) => setToDate(val)}
            className="h-12"
            placeholder="Đến ngày"
          />
        </div>
        {commissions ? (
          <>
            {commissions.length > 0 ? (
              <>
                {commissions.map((item: CommissionLog, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 ${index < commissions.length - 1 ? "border-b" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-success">
                        +{parseNumber(item.value)}
                      </span>
                      <span>{formatDate(item.createdAt, "dd-MM-yyyy hh:mm")}</span>
                    </div>
                    <div className="font-medium text-gray-600">{item.note || item.content}</div>
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
