import { gql } from "apollo-server-express";
import DataLoader from "dataloader";
import _, { keyBy } from "lodash";
import moment from "moment-timezone";
import { Types } from "mongoose";
import { Context } from "../../context";
import { LuckyWheelResultModel } from "../luckyWheelResult/luckyWheelResult.model";
import { ILuckyWheel } from "./luckyWheel.model";

export default {
  schema: gql`
    extend type LuckyWheel {
      turn: Int
      turnOfDay: Int
    }
  `,
  resolver: {
    LuckyWheel: {
      turn: async (root: ILuckyWheel, args: any, context: Context) => {
        if (!context.isCustomer()) return 0;
        return turnLoader.load([root._id.toString(), context.id].join("|"));
      },
      turnOfDay: async (root: ILuckyWheel, args: any, context: Context) => {
        if (!context.isCustomer()) return 0;
        return turnOfDayLoader.load([root._id.toString(), context.id].join("|"));
      },
    },
  },
};

const turnLoader = new DataLoader<string, number>(
  (ids: string[]) => {
    const splits = ids.map((id) => id.split("|"));
    const wheelIds = splits.map((s) => Types.ObjectId(s[0]));
    const customerIds = splits.map((s) => Types.ObjectId(s[1]));
    return LuckyWheelResultModel.aggregate([
      {
        $match: {
          customerId: { $in: customerIds },
          luckyWheelId: { $in: wheelIds },
        },
      },
      {
        $group: {
          _id: { luckyWheelId: "$luckyWheelId", customerId: "$customerId" },
          turn: { $sum: 1 },
        },
      },
    ]).then((list) => {
      const keyByIds = _.keyBy(
        list.map((l) => {
          l.id = [l._id.luckyWheelId, l._id.customerId].join("|");
          return l;
        }),
        "id"
      );
      return ids.map((id) => _.get(keyByIds, id + ".turn", 0));
    });
  },
  { cache: false }
);
const turnOfDayLoader = new DataLoader<string, number>(
  (ids: string[]) => {
    const splits = ids.map((id) => id.split("|"));
    const wheelIds = splits.map((s) => Types.ObjectId(s[0]));
    const customerIds = splits.map((s) => Types.ObjectId(s[1]));
    const startDate = moment().startOf("day").toDate();
    const endDate = moment().endOf("day").toDate();
    return LuckyWheelResultModel.aggregate([
      {
        $match: {
          customerId: { $in: customerIds },
          luckyWheelId: { $in: wheelIds },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { luckyWheelId: "$luckyWheelId", customerId: "$customerId" },
          turn: { $sum: 1 },
        },
      },
    ]).then((list) => {
      const keyByIds = _.keyBy(
        list.map((l) => {
          l.id = [l._id.luckyWheelId, l._id.customerId].join("|");
          return l;
        }),
        "id"
      );
      return ids.map((id) => _.get(keyByIds, id + ".turn", 0));
    });
  },
  { cache: false }
);
