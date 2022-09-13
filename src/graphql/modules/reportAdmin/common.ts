import { Types } from "mongoose";
import { UtilsHelper } from "../../../helpers/utils.helper";

export namespace ReportAdmin {
  export function parseMatch(data: any) {
    const {
      filter: { fromDate, toDate, memberId, timeUnit = "day" },
    } = data;
    const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate, timeUnit);
    data.match = { loggedAt: { $gte, $lte } };
    data.memberMatch = {};
    data.filterKey = `${fromDate}_${toDate}`;
    if (memberId) {
      data.filterKey += ":" + memberId;
      data.match.fromMemberId = Types.ObjectId(memberId);
      data.memberMatch = { memberId: Types.ObjectId(memberId) };
    }
  }
}
