import _ from "lodash";
import getDateRange from "../../helpers/functions/getDateRange";
export function parseMatchDateRange(query: any) {
  const { fromDate, toDate } = query;
  if (fromDate || toDate) {
    return getDateRange(fromDate, toDate);
  }
}
