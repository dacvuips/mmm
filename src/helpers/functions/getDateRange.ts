import moment from "moment-timezone";

export default function getDateRange(fromDate?: string, toDate?: string, timeUnit: string = "day") {
  let $gte: Date | undefined = undefined,
    $lte: Date | undefined = undefined;

  if (fromDate) {
    $gte = moment(fromDate, "YYYY-MM-DD")
      .startOf(timeUnit as any)
      .toDate();
  }

  if (toDate) {
    $lte = moment(toDate, "YYYY-MM-DD")
      .endOf(timeUnit as any)
      .toDate();
  }

  return {
    $gte,
    $lte,
  };
}
