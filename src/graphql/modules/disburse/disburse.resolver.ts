import _ from "lodash";
import moment from "moment";
import { Types } from "mongoose";

import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { MainConnection } from "../../../loaders/database";
import { Context } from "../../context";
import { CommissionLogModel, CommissionLogType } from "../commissionLog/commissionLog.model";
import { UserLoader } from "../user/user.model";
import { DisburseModel, DisburseStatus, IDisburse } from "./disburse.model";
import { disburseService } from "./disburse.service";
import {
  DisburseItemModel,
  DisburseItemStatus,
  IDisburseItem,
} from "./disburseItem/disburseItem.model";
import { DisbursePayoutModel } from "./disbursePayout/disbursePayout.model";

const Query = {
  getAllDisburse: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    return disburseService.fetch(args.q);
  },
  getOneDisburse: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await disburseService.findOne({ _id: id });
  },
};

const Mutation = {
  createDisburse: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { data } = args;

    if (context.isMember() || context.isStaff()) {
      data.memberId = context.sellerId;
    } else {
      data.ownerId = context.id;
    }

    const disburse: IDisburse = new DisburseModel(data);
    const startDate = moment(disburse.startDate).startOf("date").toDate();
    const endDate = moment(disburse.endDate).endOf("date").toDate();

    /** Kiểm tra có đợt giải ngân nào trung thời gian ko */
    const existedDisburse = await DisburseModel.findOne({
      memberId: data.memberId,
      $or: [
        { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
        { $and: [{ startDate: { $gte: startDate } }, { startDate: { $lte: endDate } }] },
      ],
    });

    if (existedDisburse) {
      throw Error(`Thời gian giải ngân trùng với đợt giải ngân "${existedDisburse.name}"`);
    }

    const query = [
      {
        $match: {
          memberId: Types.ObjectId(data.memberId),
          type: CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { type: "$type", customerId: "$customerId" },
          value: { $sum: "$value" },
          logIds: { $push: "$_id" },
        },
      },
      {
        $group: {
          _id: "$_id.customerId",
          value: { $sum: "$value" },
          types: { $push: { type: "$_id.type", value: "$value" } },
          logIds: { $push: "$logIds" },
        },
      },
      {
        $lookup: {
          from: "customers",
          let: { id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, code: 1, name: 1, phone: 1, idCard: 1 } },
          ],
          as: "c",
        },
      },
      { $unwind: "$c" },
    ];
    const result = await CommissionLogModel.aggregate(query);

    console.log("result", result.length, JSON.stringify(query, null, 2));

    const items: IDisburseItem[] = [];
    const session = await MainConnection.startSession();
    try {
      const bulk = CommissionLogModel.collection.initializeUnorderedBulkOp({ session });
      for (const i of result) {
        const disburseItem = new DisburseItemModel({
          disburseId: disburse._id,
          memberId: Types.ObjectId(data.memberId),
          customerId: i.c._id,
          customerCode: i.c.code,
          customerPhone: i.c.phone,
          customerName: i.c.name,
          value: i.value,
          status: DisburseItemStatus.pending,
          meta: { details: i.types },
        });
        items.push(disburseItem);
        const logIds = _.chain(i.logIds).flatten().map(Types.ObjectId).value();
        bulk
          .find({ _id: { $in: logIds } })
          .update({ $set: { disburseId: disburse._id, disburseItemId: disburseItem._id } });
      }
      if (items.length == 0) {
        throw Error("Không có danh sách người nhận trong khoảng thời gian này");
      }

      await session.withTransaction(async (session) => {
        await disburse.save({ session });
        await DisburseItemModel.insertMany(items, { session });
        await bulk.execute();
      });
      return disburse;
    } finally {
      session.endSession();
    }
  },
  updateDisburse: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await disburseService.updateOne(id, data);
  },
  deleteOneDisburse: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    const disburse = await DisburseModel.findById(id);
    if (disburse.status == DisburseStatus.closed) {
      throw Error("Đã kết thúc giải ngân, không thể xoá");
    }
    const completedItemCount = await DisburseItemModel.count({
      disburseId: disburse._id,
      status: DisburseItemStatus.completed,
    });

    if (completedItemCount > 0) {
      throw Error("Đã có dữ liệu giải ngân thành công, không thể xoá");
    }
    const payoutListCount = await DisbursePayoutModel.count({ disburseId: disburse._id });
    if (payoutListCount > 0) {
      throw Error("Đã có đợt chi, không thể xoá");
    }
    await DisburseItemModel.remove({ disburseId: disburse._id });
    await CommissionLogModel.updateMany(
      { disburseId: disburse._id },
      { $unset: { disburseId: 1, disburseItemId: 1 } }
    );
    return await disburseService.deleteOne(id);
  },
};

const Disburse = {
  owner: GraphQLHelper.loadById(UserLoader, "ownerId"),
  closeBy: GraphQLHelper.loadById(UserLoader, "closeById"),
};

export default {
  Query,
  Mutation,
  Disburse,
};
