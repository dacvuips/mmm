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

export function PromotionReport() {
  const [memberId, setMemberId] = useState<string>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [filterInited, setFilterInited] = useState(false);
  let [timeout] = useState<any>();
  const { promotionReport, loadPromotionReport, isAdmin } = useReportContext();
  const { member } = useAuth();

  useEffect(() => {
    initFilter();
  }, []);

  const initFilter = () => {
    let reportFilter: any = sessionStorage.getItem("promotion-report-filter");
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
        loadPromotionReport({ fromDate, toDate, memberId: isAdmin ? memberId : member.id });
        sessionStorage.setItem(
          "promotion-report-filter",
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
            label="C???a h??ng"
            noError
          >
            <Select
              placeholder="T???t c??? c???a h??ng thu???c h??? th???ng"
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
            label="C???a h??ng"
            noError
          >
            <Input readOnly value={member.shopName} />
          </Field>
        )}
        <div className="p-4 border-r border-gray-100 rounded border-group">
          <Button
            outline
            className="bg-gray-100 whitespace-nowrap mt-7"
            text="Th??ng tr?????c"
            onClick={() => {
              let date = new Date(fromDate.getTime());
              date.setMonth(date.getMonth() - 1);
              setFromDate(startOfMonth(date));
              setToDate(endOfMonth(date));
            }}
          />
          <Field label="T??? ng??y" noError>
            <DatePicker
              className="rounded-none w-36"
              value={fromDate}
              onChange={(val) => setFromDate(startOfDay(val))}
              clearable={false}
            />
          </Field>
          <Field label="?????n ng??y" noError>
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
            text="Th??ng sau"
            onClick={() => {
              let date = new Date(fromDate.getTime());
              date.setMonth(date.getMonth() + 1);
              setFromDate(startOfMonth(date));
              setToDate(endOfMonth(date));
            }}
          />
        </div>
      </Form>
      {promotionReport ? (
        <div className="flex flex-col gap-6 animate-emerge">
          <div className="flex flex-wrap gap-6">
            <Card className="self-start p-6">
              <ReportTitle text="S??? l?????ng m?? t???o m???i" />
              <ReportWidget image="/assets/img/voucher.svg">
                <div className="font-semibold text-primary">
                  T???o m???i:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(promotionReport.summary.filter)}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-center text-gray-800 border-t border-gray-500">
                  T???ng c???ng: {parseNumber(promotionReport.summary.total)}
                </div>
              </ReportWidget>
            </Card>
            <Card className="self-start p-6">
              <ReportTitle text="T???ng ??h ho??n th??nh d??ng m?? khuy???n m??i" />
              <ReportWidget image="/assets/img/revenue.svg">
                <div className="font-semibold text-primary">
                  T???ng ??H d??ng khuy???n m??i:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(promotionReport.order.total)}
                  </span>
                </div>
              </ReportWidget>
            </Card>
          </div>
          {!!promotionReport.category?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Th???ng k?? m?? khuy???n m??i c???a t???ng lo???i" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">Lo???i khuy???n m??i</th>
                    <th className="text-right">S??? l?????ng</th>
                  </tr>
                </thead>
                <tbody>
                  {promotionReport.category.map((category, index) => (
                    <tr key={category.name}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="min-w-lg">
                          <div className="font-semibold">{category.name}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(category.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {!!promotionReport.topIssue?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 khuy???n m??i d??ng nhi???u nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">Khuy???n m??i</th>
                    <th className="text-left">C???a h??ng</th>
                    <th className="text-right">S??? ????n h??ng</th>
                  </tr>
                </thead>
                <tbody>
                  {promotionReport.topIssue.map((promotion, index) => (
                    <tr key={promotion.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="">
                          <div className="font-semibold">{promotion.name}</div>
                          <div>{promotion.description}</div>
                        </div>
                      </td>
                      <td className="text-left">{promotion.shopName}</td>
                      <td className="text-right">{parseNumber(promotion.total)}</td>
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
