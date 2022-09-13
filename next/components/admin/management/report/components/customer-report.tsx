import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import { useEffect, useState } from "react";
import { parseNumber } from "../../../../../lib/helpers/parser";
import { Form } from "../../../../shared/utilities/form";
import { Button } from "../../../../shared/utilities/form/button";
import { DatePicker } from "../../../../shared/utilities/form/date";
import { Field } from "../../../../shared/utilities/form/field";
import { Card, Spinner } from "../../../../shared/utilities/misc";
import { useReportContext } from "../providers/report-providers";
import { ReportTitle } from "./report-title";
import { ReportWidget } from "./report-widget";

export function CustomerReport() {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [filterInited, setFilterInited] = useState(false);
  let [timeout] = useState<any>();
  const { customerReport, loadCustomerReport } = useReportContext();

  useEffect(() => {
    initFilter();
  }, []);

  const initFilter = () => {
    let reportFilter: any = sessionStorage.getItem("customer-report-filter");
    if (reportFilter) {
      reportFilter = JSON.parse(reportFilter);
      setFromDate(reportFilter.startDate || startOfMonth(new Date()));
      setToDate(reportFilter.endDate || endOfMonth(new Date()));
    } else {
      setFromDate(startOfMonth(new Date()));
      setToDate(endOfMonth(new Date()));
    }
    setFilterInited(true);
  };

  useEffect(() => {
    if (filterInited) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadCustomerReport({ fromDate, toDate });
        sessionStorage.setItem("order-report-filter", JSON.stringify({ fromDate, toDate }));
      }, 100);
    }
  }, [fromDate, toDate, filterInited]);

  return (
    <div className="flex flex-col gap-6">
      <Form className="flex bg-white shadow-md animate-emerge">
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
      {customerReport ? (
        <div className="flex flex-col gap-6 animate-emerge">
          <Card className="self-start p-6">
            <ReportTitle text="Thống kê số lượng khách hàng" />
            <ReportWidget image="/assets/img/customer.svg">
              <div className="font-semibold text-primary">
                Số khách hàng:{" "}
                <span className="text-xl font-bold">
                  {parseNumber(customerReport.summary.filter)}
                </span>
              </div>
              <div className="mt-1 font-semibold text-center text-gray-800 border-t border-gray-500">
                {parseNumber(customerReport.summary.total)} tổng khách hàng
              </div>
            </ReportWidget>
          </Card>
          <Card className="self-start w-full max-w-3xl p-6">
            <ReportTitle text="Top 10 khách hàng đặt nhiều đơn nhất" />
            <table className="simple-table">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Khách hàng</th>
                  <th className="text-right">Đơn hàng</th>
                </tr>
              </thead>
              <tbody>
                {customerReport.topOrder.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className=" min-w-lg">
                        <div className="font-semibold">{customer.customerName}</div>
                        <div>{customer.customerPhone}</div>
                      </div>
                    </td>
                    <td className="text-right">{parseNumber(customer.order)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="self-start w-full max-w-3xl p-6">
            <ReportTitle text="Top 10 khách hàng chi nhiều tiền nhất" />
            <table className="simple-table">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">Khách hàng</th>
                  <th className="text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {customerReport.topRevenue.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="min-w-lg">
                        <div className="font-semibold">{customer.customerName}</div>
                        <div>{customer.customerPhone}</div>
                      </div>
                    </td>
                    <td className="text-right">{parseNumber(customer.revenue, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
