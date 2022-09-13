import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import { useEffect, useState } from "react";
import { parseNumber } from "../../../../../lib/helpers/parser";
import { useAuth } from "../../../../../lib/providers/auth-provider";
import { MemberService } from "../../../../../lib/repo/member.repo";
import { Form } from "../../../../shared/utilities/form";
import { Button } from "../../../../shared/utilities/form/button";
import { DatePicker } from "../../../../shared/utilities/form/date";
import { Field } from "../../../../shared/utilities/form/field";
import { Input } from "../../../../shared/utilities/form/input";
import { Select } from "../../../../shared/utilities/form/select";
import { Card, Spinner } from "../../../../shared/utilities/misc";
import { useReportContext } from "../providers/report-providers";
import { ReportTitle } from "./report-title";
import { ReportWidget } from "./report-widget";

export function RewardPointReport() {
  const [memberId, setMemberId] = useState<string>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [filterInited, setFilterInited] = useState(false);
  let [timeout] = useState<any>();
  const { rewardPointReport, loadRewardReport, isAdmin } = useReportContext();
  const { member } = useAuth();

  useEffect(() => {
    initFilter();
  }, []);

  const initFilter = () => {
    let reportFilter: any = sessionStorage.getItem("reward-point-report-filter");
    if (reportFilter) {
      reportFilter = JSON.parse(reportFilter);
      setMemberId(reportFilter.memberId);
      setFromDate(reportFilter.startDate || startOfMonth(new Date()));
      setToDate(reportFilter.endDate || endOfMonth(new Date()));
    } else {
      setMemberId("");
      setFromDate(startOfMonth(new Date()));
      setToDate(endOfMonth(new Date()));
    }
    setFilterInited(true);
  };

  useEffect(() => {
    if (filterInited) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadRewardReport({ fromDate, toDate, memberId: isAdmin ? memberId : member.id });
        sessionStorage.setItem(
          "reward-point-report-filter",
          JSON.stringify({ fromDate, toDate, memberId })
        );
      }, 100);
    }
  }, [memberId, fromDate, toDate, filterInited]);

  return (
    <div className="flex flex-col gap-6">
      <Form className="flex bg-white shadow-md animate-emerge">
        {isAdmin ? (
          <Field
            className="p-4 border-r border-gray-100"
            style={{ width: 350 }}
            label="Cửa hàng"
            noError
          >
            <Select
              placeholder="Tất cả cửa hàng thuộc hệ thống"
              value={memberId}
              onChange={setMemberId}
              hasImage
              clearable={true}
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
        ) : (
          <Field
            className="p-4 border-r border-gray-100"
            style={{ width: 350 }}
            label="Cửa hàng"
            noError
          >
            <Input readOnly value={member.shopName} />
          </Field>
        )}
        <div className="p-4 border-r border-gray-100 rounded border-group">
          <Button
            outline
            className="bg-gray-100 whitespace-nowrap mt-7"
            text="Tháng trước"
            onClick={() => {
              let date = new Date(fromDate.getTime());
              date.setMonth(date.getMonth() - 1);
              setFromDate(startOfMonth(date));
              setToDate(endOfMonth(date));
            }}
          />
          <Field label="Từ ngày" noError>
            <DatePicker
              className="rounded-none w-36"
              value={fromDate}
              onChange={(val) => setFromDate(startOfDay(val))}
              clearable={false}
            />
          </Field>
          <Field label="Đến ngày" noError>
            <DatePicker
              className="rounded-none w-36"
              value={toDate}
              onChange={(val) => setToDate(endOfDay(val))}
              clearable={false}
            />
          </Field>
          <Button
            outline
            className="bg-gray-100 whitespace-nowrap mt-7"
            text="Tháng sau"
            onClick={() => {
              let date = new Date(fromDate.getTime());
              date.setMonth(date.getMonth() + 1);
              setFromDate(startOfMonth(date));
              setToDate(endOfMonth(date));
            }}
          />
        </div>
      </Form>
      {rewardPointReport ? (
        <div className="flex flex-col gap-6 animate-emerge">
          <div className="flex flex-wrap gap-6">
            <Card className="self-start p-6">
              <ReportTitle text="Thống kê điểm thưởng" />
              <ReportWidget image="/assets/img/voucher.svg">
                <div className="font-semibold text-primary">
                  Đã sử dụng:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(rewardPointReport.summary.used)}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-center text-gray-800 border-t border-gray-500">
                  Tổng cộng: {parseNumber(rewardPointReport.summary.issued)}
                </div>
              </ReportWidget>
            </Card>
          </div>
          {!!rewardPointReport.topCustomer.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 khách hàng có điểm thưởng" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">Cửa hàng</th>
                    <th className="text-left">Khách hàng</th>
                    <th className="text-left">Số điện thoại</th>
                    <th className="text-right">Tổng điểm thưởng</th>
                    <th className="text-right">Đã sử dụng</th>
                    <th className="text-right">Còn lại</th>
                  </tr>
                </thead>
                <tbody>
                  {rewardPointReport.topCustomer.map((reward, index) => (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td className="text-left">{reward.shopName}</td>
                      <td className="text-left">{reward.customerName}</td>
                      <td className="text-left">{reward.customerPhone}</td>
                      <td className="text-right">{parseNumber(reward.issued)}</td>
                      <td className="text-right">{parseNumber(reward.used)}</td>
                      <td className="text-right">{parseNumber(reward.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
