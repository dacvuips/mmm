import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import { useEffect, useState } from "react";
import { parseNumber } from "../../../../../lib/helpers/parser";
import { MemberService } from "../../../../../lib/repo/member.repo";
import { Form } from "../../../../shared/utilities/form";
import { Button } from "../../../../shared/utilities/form/button";
import { DatePicker } from "../../../../shared/utilities/form/date";
import { Field } from "../../../../shared/utilities/form/field";
import { Select } from "../../../../shared/utilities/form/select";
import { Card, Spinner } from "../../../../shared/utilities/misc";
import { useReportContext } from "../providers/report-providers";
import { ReportTitle } from "./report-title";
import { ReportWidget } from "./report-widget";

export function CollaboratorReport() {
  const [memberId, setMemberId] = useState<string>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [filterInited, setFilterInited] = useState(false);
  let [timeout] = useState<any>();
  const { collaboratorReport, loadCollaboratorReport } = useReportContext();

  useEffect(() => {
    initFilter();
  }, []);

  const initFilter = () => {
    let reportFilter: any = sessionStorage.getItem("collaborator-report-filter");
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
        loadCollaboratorReport({ fromDate, toDate, memberId });
        sessionStorage.setItem(
          "collaborator-report-filter",
          JSON.stringify({ fromDate, toDate, memberId })
        );
      }, 100);
    }
  }, [memberId, fromDate, toDate, filterInited]);

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
      </Form>
      {collaboratorReport ? (
        <div className="flex flex-col gap-6 animate-emerge">
          <div className="flex flex-wrap gap-6">
            <Card className="self-start p-6">
              <ReportTitle text="S??? l?????ng c???ng t??c vi??n" />
              <ReportWidget image="/assets/img/collaborator.svg">
                <div className="font-semibold text-primary">
                  S??? c???ng t??c vi??n:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(collaboratorReport.summary.filter)}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-center text-gray-800 border-t border-gray-500">
                  {parseNumber(collaboratorReport.summary.total)} t???ng CTV
                </div>
              </ReportWidget>
            </Card>
            <Card className="self-start p-6">
              <ReportTitle text="S??? ng?????i ???????c c???ng t??c vi??n gi???i thi???u" />
              <ReportWidget image="/assets/img/collaborator.svg">
                <div className="font-semibold text-primary">
                  S??? ng?????i ???????c gi???i thi???u:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(collaboratorReport.invite.filter)}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-center text-gray-800 border-t border-gray-500">
                  {parseNumber(collaboratorReport.invite.total)} t???ng ng?????i ???????c gi???i thi???u
                </div>
              </ReportWidget>
            </Card>
            <Card className="self-start p-6">
              <ReportTitle text="T???ng s??? ????n h??ng" />
              <ReportWidget image="/assets/img/revenue.svg">
                <div className="font-semibold text-primary">
                  T???ng ????n h??ng:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(collaboratorReport.order.order)}
                  </span>
                </div>
                <div>
                  T???ng doanh thu:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(collaboratorReport.order.revenue, true)}
                  </span>
                </div>
                <div>
                  T???ng hoa h???ng:{" "}
                  <span className="text-xl font-bold">
                    {parseNumber(collaboratorReport.commission.commission, true)}
                  </span>
                </div>
              </ReportWidget>
            </Card>
          </div>
          {!!collaboratorReport.topInvite?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 c???ng t??c vi??n gi???i thi???u nhi???u nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">C???ng t??c vi??n</th>
                    <th className="text-right">S??? gi???i thi???u</th>
                  </tr>
                </thead>
                <tbody>
                  {collaboratorReport.topInvite.map((collaborator, index) => (
                    <tr key={collaborator.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="min-w-lg">
                          <div className="font-semibold">{collaborator.customerName}</div>
                          <div>{collaborator.customerPhone}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(collaborator.invite)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {!!collaboratorReport.topEngagement?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 c???ng t??c vi??n c?? l?????t ti???p c???n cao nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">C???ng t??c vi??n</th>
                    <th className="text-right">L?????t ti???p c???n</th>
                  </tr>
                </thead>
                <tbody>
                  {collaboratorReport.topEngagement.map((collaborator, index) => (
                    <tr key={collaborator.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="min-w-lg">
                          <div className="font-semibold">{collaborator.customerName}</div>
                          <div>{collaborator.customerPhone}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(collaborator.engagementCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {!!collaboratorReport.topOrder?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 c???ng t??c vi??n c?? nhi???u ????n h??ng nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">C???ng t??c vi??n</th>
                    <th className="text-right">????n h??ng</th>
                  </tr>
                </thead>
                <tbody>
                  {collaboratorReport.topOrder.map((collaborator, index) => (
                    <tr key={collaborator.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="min-w-lg">
                          <div className="font-semibold">{collaborator.customerName}</div>
                          <div>{collaborator.customerPhone}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(collaborator.order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {!!collaboratorReport.topRevenue?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 c???ng t??c vi??n c?? doanh thu nhi???u nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">C???ng t??c vi??n</th>
                    <th className="text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {collaboratorReport.topRevenue.map((collaborator, index) => (
                    <tr key={collaborator.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="min-w-lg">
                          <div className="font-semibold">{collaborator.customerName}</div>
                          <div>{collaborator.customerPhone}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(collaborator.revenue, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {!!collaboratorReport.topCommission?.length && (
            <Card className="self-start w-full max-w-3xl p-6">
              <ReportTitle text="Top 10 c???ng t??c vi??n c?? hoa h???ng nhi???u nh???t" />
              <table className="simple-table">
                <thead>
                  <tr>
                    <th className="text-left">#</th>
                    <th className="text-left">C???ng t??c vi??n</th>
                    <th className="text-right">Hoa h???ng</th>
                  </tr>
                </thead>
                <tbody>
                  {collaboratorReport.topCommission.map((collaborator, index) => (
                    <tr key={collaborator.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="min-w-lg">
                          <div className="font-semibold">{collaborator.customerName}</div>
                          <div>{collaborator.customerPhone}</div>
                        </div>
                      </td>
                      <td className="text-right">{parseNumber(collaborator.commission, true)}</td>
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
