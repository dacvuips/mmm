import { useEffect, useRef, useState } from "react";
import { Select } from "../../../shared/utilities/form/select";
import { useDashboardContext } from "../provider/dashboard-provider";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import { Bar, Line } from "react-chartjs-2";
import { Spinner } from "../../../shared/utilities/misc";

export function BusinessChart() {
  const [timeRange, setTimeRange] = useState<string>("currentMonth");
  const { loadReportChart, shopOrderChartData } = useDashboardContext();
  const titleRef = useRef<HTMLHeadingElement>();
  const [color, setColor] = useState("#666");

  useEffect(() => {
    let date = new Date();
    switch (timeRange) {
      case "currentMonth": {
        break;
      }
      case "lastMonth": {
        date.setMonth(date.getMonth() - 1);
        break;
      }
    }
    loadReportChart(startOfMonth(date), endOfMonth(date));
  }, [timeRange]);

  useEffect(() => {
    setTimeout(() => {
      setColor(getComputedStyle(titleRef.current).color);
    }, 100);
  }, [titleRef.current]);

  return (
    <div className="mt-4">
      <h1 ref={titleRef} className="pt-4 pb-2 text-primary-dark text-lg font-bold">
        Tình trạng kinh doanh
      </h1>
      <div className="bg-white rounded shadow">
        <div className="flex justify-between items-center font-semibold border-b border-gray-300 h-16 px-4">
          <span className="text-gray-700 text-lg">Doanh thu</span>
          <div>
            <Select
              className="w-56"
              options={TIMERANGES}
              value={timeRange}
              onChange={setTimeRange}
            />
          </div>
        </div>
        <div className="flex w-full">
          {shopOrderChartData && color ? (
            <>
              <div className="p-6 flex-1">
                <Line
                  data={{
                    datasets: [
                      {
                        data: [...shopOrderChartData.datasets[1].data],
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 2,
                        label: shopOrderChartData.datasets[1].label,
                      },
                    ],
                    labels: shopOrderChartData.labels,
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom", align: "start" } },
                  }}
                />
              </div>
              <div className="p-6 flex-1">
                <Bar
                  data={{
                    datasets: [
                      {
                        data: [...shopOrderChartData.datasets[0].data],
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 2,
                        label: shopOrderChartData.datasets[0].label,
                      },
                    ],
                    labels: shopOrderChartData.labels,
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom", align: "start" } },
                  }}
                />
              </div>
            </>
          ) : (
            <Spinner />
          )}
        </div>
      </div>
    </div>
  );
}

const TIMERANGES: Option[] = [
  { value: "currentMonth", label: "Tháng này" },
  { value: "lastMonth", label: "Tháng trước" },
];
