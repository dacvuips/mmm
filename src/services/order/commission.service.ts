import { Context, ServiceBroker, ServiceSchema } from "moleculer";

import { CustomerCommissionLoader } from "../../batch/customerCommission.loader";
import { EstimateCommissionFromCustomerLoader } from "../../batch/estimateCommissionFromCustomer.loader";
import { CollaboratorLoader } from "../../graphql/modules/collaborator/collaborator.model";
import {
  CommissionLogModel,
  CommissionLogType,
} from "../../graphql/modules/commissionLog/commissionLog.model";
import { CustomerLoader, CustomerModel } from "../../graphql/modules/customer/customer.model";
import { OrderLoader } from "../../graphql/modules/order/order.model";
import { CommissionBy, IShopConfig } from "../../graphql/modules/shop/shopConfig/shopConfig.model";
import { DiscountUnit } from "../../graphql/modules/shop/shopVoucher/types/discountItem.schema";
import { triggerService } from "../../graphql/modules/trigger/trigger.service";
import { MainConnection } from "../../loaders/database";

export default {
  name: "commission",
  actions: {
    estimateCustomer: {
      params: { id: { type: "string" } },
      async handler(ctx) {
        const { id } = ctx.params;
        return await CustomerCommissionLoader.load(id);
      },
    },
    estimateFromCustomer: {
      params: { id: { type: "string" }, from: { type: "string" } },
      async handler(ctx) {
        const { id, from } = ctx.params;
        return EstimateCommissionFromCustomerLoader.load([id, from].join("|"));
      },
    },
  },
  methods: {
    async addToCustomerFromOrder(props: { orderId: string; customerId: string; value: number }) {
      const { orderId, customerId, value } = props;
      const [order, customer, log] = await Promise.all([
        OrderLoader.load(orderId),
        CustomerLoader.load(customerId),
        CommissionLogModel.findOne({
          customerId,
          orderId,
          type: CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER,
        }),
      ]);
      if (!order || !customer) throw Error("Dữ liệu không hợp lệ");
      if (log) return { error: null, data: log };
      const session = await MainConnection.startSession();
      try {
        let result;
        await session.withTransaction(async (session) => {
          const log = new CommissionLogModel({
            customerId: customerId,
            memberId: order.sellerId,
            type: CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER,
            value: value,
            orderId: order._id,
          });

          await log.save({ session });
          triggerService.emitEvent("collaborator:add-commission", order.sellerId, {
            ...order,
            sellerId: order.sellerId,
            buyerId: customer.id,
          });
          await CustomerModel.updateOne(
            { _id: customerId },
            { $inc: { commission: value } },
            { session }
          ).exec();
          result = { error: null, data: log };
        });
        return result;
      } catch (err) {
        return { error: err.message, data: null };
      } finally {
        await session.endSession();
      }
    },
  },
  events: {
    "order.completed": {
      params: {
        orderId: { type: "string" },
      },
      async handler(ctx: Context<{ orderId: string }>) {
        const { orderId } = ctx.params;
        const order = await OrderLoader.load(orderId);
        let { commission2, collaboratorId, buyerId } = order;
        if (!collaboratorId) return;
        const broker = this.broker as ServiceBroker;
        const [shopConfig, collaborator] = await Promise.all([
          broker.call<IShopConfig, { id: string }>("shopConfig.get", {
            id: order.sellerId.toString(),
          }),
          CollaboratorLoader.load(collaboratorId),
        ]);
        if (!collaborator) return;
        if (shopConfig.colCommissionBy == CommissionBy.ORDER) {
          if (shopConfig.colCommissionUnit == DiscountUnit.VND) {
            commission2 = shopConfig.colCommissionValue;
          } else {
            const baseValue = order.subtotal - order.discount;
            commission2 = (baseValue * shopConfig.colCommissionValue) / 100;
          }
        }
        if (commission2 <= 0) return;

        await this.addToCustomerFromOrder({
          orderId: orderId.toString(),
          customerId: collaborator.customerId.toString(),
          value: commission2,
        });
      },
    },
  },
} as ServiceSchema;
