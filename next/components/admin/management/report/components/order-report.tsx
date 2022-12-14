import { useEffect, useState } from "react";
import { MemberService } from "../../../../../lib/repo/member.repo";
import { Field, Select, Button, DatePicker, Form } from "../../../../shared/utilities/form";
import { Img, Spinner } from "../../../../shared/utilities/misc";
import { TimeUnit, TIME_UNITS, useReportContext } from "../providers/report-providers";
import { ReportTitle } from "./report-title";
import { ReportWidget } from "./report-widget";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import startOfDay from "date-fns/startOfDay";
import endOfDay from "date-fns/endOfDay";
import { Bar } from "react-chartjs-2";
import { Card } from "../../../../shared/utilities/misc";
import { parseNumber } from "../../../../../lib/helpers/parser";

export function OrderReport({ isAdmin }: { isAdmin: boolean }) {
  const [memberId, setMemberId] = useState<string>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [timeUnit, setTimeUnit] = useState<TimeUnit>();
  const [filterInited, setFilterInited] = useState(false);
  let [timeout] = useState<any>();
  const { orderReport, loadOrderReport, color, accent } = useReportContext();

  useEffect(() => {
    initFilter();
  }, []);

  const initFilter = () => {
    let reportFilter: any = sessionStorage.getItem("order-report-filter");
    if (reportFilter) {
      reportFilter = JSON.parse(reportFilter);
      setMemberId(reportFilter.memberId);
      setFromDate(reportFilter.startDate || startOfMonth(new Date()));
      setToDate(reportFilter.endDate || endOfMonth(new Date()));
      setTimeUnit(reportFilter.timeUnit);
    } else {
      setMemberId("");
      setFromDate(startOfMonth(new Date()));
      setToDate(endOfMonth(new Date()));
      setTimeUnit("day");
    }
    setFilterInited(true);
  };

  useEffect(() => {
    if (filterInited) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadOrderReport({ fromDate, toDate, memberId, timeUnit });
        sessionStorage.setItem(
          "order-report-filter",
          JSON.stringify({ fromDate, toDate, memberId, timeUnit })
        );
      }, 100);
    }
  }, [memberId, fromDate, toDate, timeUnit, filterInited]);

  return (
    <div className="flex flex-col gap-6">
      <Form className="flex bg-white shadow-md animate-emerge">
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
        <Field className="p-4" label="????n v???" noError>
          <Select className="w-32" value={timeUnit} onChange={setTimeUnit} options={TIME_UNITS} />
        </Field>
      </Form>
      {orderReport ? (
        <div className="flex flex-col gap-6 animate-emerge">
          <Card className="self-start p-6">
            <ReportTitle text="Th???ng k?? s??? l?????ng ????n h??ng" />
            <ReportWidget image="/assets/img/receipt.svg">
              <div className="font-semibold text-primary">
                T???ng ????n ??ang ?????t:{" "}
                <span className="text-xl font-bold">
                  {parseNumber(orderReport.summary.processing)}
                </span>
              </div>
              <div>
                T???ng ????n th??nh c??ng:{" "}
                <span className="text-xl font-bold">
                  {parseNumber(orderReport.summary.completed)}
                </span>
              </div>
              <div>
                T???ng ????n th???t b???i:{" "}
                <span className="text-xl font-bold">
                  {parseNumber(orderReport.summary.canceled)}
                </span>
              </div>
            </ReportWidget>
          </Card>
          {!!orderReport.topShops?.length && isAdmin && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 c???a h??ng c?? ????n h??ng nhi???u nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">C???a h??ng</th>
                    <th className="text-right">????n h??ng</th>
                  </tr>
                </thead>
                <tbody>
                  {orderReport.topShops.map((shop, index) => (
                    <tr key={shop.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="flex items-center justify-start min-w-lg">
                          <Img rounded className="w-8 mr-1" src={shop.shopLogo} />
                          <div className="font-semibold">{shop.shopName}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(shop.order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {!!orderReport.topRevenue?.length && isAdmin && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 c???a h??ng c?? doanh thu cao nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">C???a h??ng</th>
                    <th className="text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {orderReport.topRevenue.map((shop, index) => (
                    <tr key={shop.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="flex items-center justify-start min-w-lg">
                          <Img rounded className="w-8 mr-1" src={shop.shopLogo} />
                          <div className="font-semibold">{shop.shopName}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(shop.revenue, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {!!orderReport.topProducts?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 s???n ph???m b??n ch???y nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">S???n ph???m</th>
                    <th className="text-center">S??? l?????ng</th>
                    <th className="text-right">T???ng ti???n</th>
                  </tr>
                </thead>
                <tbody>
                  {orderReport.topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="flex items-center justify-start min-w-lg">
                          <div className="font-semibold">{product.name}</div>
                        </div>
                      </td>
                      <td className="text-center">{parseNumber(product.qty)}</td>
                      <td className="text-right">{parseNumber(product.amount, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {orderReport.chart && (
            <Card>
              <ReportTitle text="Th???ng k?? ????n h??ng" />
              <Bar
                data={{
                  datasets: [
                    {
                      order: 1,
                      data: [...orderReport.chart.datasets[0].data],
                      backgroundColor: color,
                      borderColor: color,
                      borderWidth: 2,
                      label: orderReport.chart.datasets[0].label,
                      type: "bar",
                      yAxisID: "A",
                    },
                    {
                      data: [...orderReport.chart.datasets[1].data],
                      backgroundColor: "transparent",
                      borderColor: accent,
                      borderWidth: 2,
                      label: orderReport.chart.datasets[1].label,
                      type: "line",
                      order: 0,
                      yAxisID: "B",
                    },
                  ],
                  labels: orderReport.chart.labels,
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom", align: "start" } },
                  scales: {
                    yAxes: [
                      {
                        id: "A",
                        type: "linear",
                        position: "left",
                      },
                      {
                        id: "B",
                        type: "linear",
                        position: "right",
                      },
                    ],
                  },
                }}
              />
            </Card>
          )}
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
