import _ from "lodash";
import { Types } from "mongoose";
import { UtilsHelper } from "../../helpers";

export namespace ReportAdminRouter {
  export function parseMatch(data: any) {
    const { filter } = data;
    const match = {
      dateRange: {},
      createdAt: {},
      member: {},
      fromMember: {},
      combined: {},
    };
    if (!_.isEmpty(filter)) {
      // Có điều kiện lọc
      const { fromDate, toDate, memberId } = filter;
      if (fromDate || toDate) {
        // Có lọc theo ngày bắt đầu hoặc ngày kết thúc
        match.dateRange = UtilsHelper.getDatesWithComparing(fromDate, toDate);
        match.createdAt = { createdAt: match.dateRange };
      }
      if (memberId) {
        // Có lọc theo chủ shop
        match.member = { memberId: Types.ObjectId(memberId) };
        match.fromMember = { fromMemberId: Types.ObjectId(memberId) };
      }
      match.combined = { ...match.createdAt, ...match.member };
    }
    data.match = match;
    return data;
  }
}
