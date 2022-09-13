// import { Request, Response } from "express";
// import _ from "lodash";
// import moment from "moment-timezone";
// import { BaseError } from "../../base/error";
// import { MemberLoader } from "../../graphql/modules/member/member.model";
// import {
//   INotification,
//   InsertNotification,
//   NotificationTarget,
// } from "../../graphql/modules/notification/notification.model";
// import { NotificationBuilder } from "../../graphql/modules/notification/notificationBuilder";
// import { OrderModel, PaymentMethod } from "../../graphql/modules/order/order.model";
// import { staffService } from "../../graphql/modules/staff/staff.service";
// import { UtilsHelper } from "../../helpers";
// import { pubsub } from "../../helpers/pubsub";
// import { MainConnection } from "../../loaders/database";
// import { logger } from "../../loaders/logger";
export default [];
// export default [
//   {
//     method: "post",
//     path: "/api/paymentTracking/casso/:id",
//     midd: [],
//     action: async (req: Request, res: Response) => {
//       console.log({ headers: req.headers });
//       // Kiểm tra header có chưa secret token không
//       const secretToken = req.headers["secure-token"];
//       if (!secretToken) throw new BaseError(401, "casso-error", `Chưa xác thực`);
//       console.log({ secretToken });
//       // Kiểm tra thông tin chủ shop
//       const { id } = req.params;
//       console.log({ id });
//       const member = await MemberLoader.load(id);
//       if (!member) throw new BaseError(401, "casso-error", `Chưa xác thực`);

//       // Kiểm tra secret token có hợp lệ với mã chủ shop không
//       if (member.code != secretToken) throw new BaseError(401, "casso-error", `Không đủ quyền.`);

//       res.sendStatus(200);

//       try {
//         // Lưu data để debug
//         await MainConnection.collection("debug_casso_webhook").insertMany(req.body.data);

//         for (const transcation of req.body.data) {
//           // Xử lý từng transaction
//           let {
//             id, // 6785,        //mã định danh duy nhất của giao dịch (Casso quy định)
//             tid, // "BANK_REF_ID", //Mã giao dịch từ phía ngân hàng
//             description, // "giao dich thu nghiem", // nội dung giao dịch
//             amount, // 79000, // số tiền giao dịch
//             cusum_balance, // 20079000,  // số tiền còn lại sau giao dịch
//             when, // "2020-10-14 00:34:57",    // thời gian ghi có giao dịch ở ngân hàng
//             bank_sub_acc_id, // "123456789",   // Mã tài khoản ngân hàng mà giao dịch thuộc về
//           } = transcation;

//           amount = Number(amount);
//           cusum_balance = Number(cusum_balance);

//           logger.info(`Ghi nhận chuyển khoản`, { transcation });

//           // Kiểm tra mã đơn hàng từ nội dung thanh toán
//           const orderIdRegex = new RegExp("DH\\d+", "i");
//           const orderId = orderIdRegex.exec(description)[0];
//           if (_.isEmpty(orderId) == true) continue;

//           // Nếu có mã đơn hàng, kiểm tra thông tin đơn hàng
//           const order = await OrderModel.findOne({ code: orderId, fromMemberId: member._id });
//           if (!order) continue;

//           logger.info(`Cập nhật thanh toán đơn hàng ${order.code}`);

//           // Ghi log thanh toán cho đơn hàng
//           const log = {
//             message:
//               `Chuyển khoản ngân hàng\n` +
//               `Số tiền GD: ${UtilsHelper.toMoney(amount)}\n` +
//               `Đến tài khoản: ${bank_sub_acc_id}\n` +
//               `Mã giao dịch: ${tid}`,
//             createdAt: moment(when).toDate(),
//             updatedAt: new Date(),
//             meta: transcation,
//           };
//           // Cập nhật trạng thái thanh toán
//           let filledAmount = (order.paymentFilledAmount || 0) + amount;
//           let paymentStatus = order.paymentStatus;
//           if (filledAmount >= order.amount) {
//             // Nếu Đơn số tiền thanh toán nhiều hơn hoặc bằng thành tiền đơn hàng
//             // thì cập nhật đơn hàng đã thanh toán
//             paymentStatus = "filled";
//           } else {
//             // Ngược lại thì cập nhật thanh toán một phần
//             paymentStatus = "partially_filled";
//           }

//           // Cập nhật đơn hàng
//           await OrderModel.updateOne(
//             { _id: order._id },
//             {
//               $set: {
//                 paymentMethod: PaymentMethod.BANK_TRANSFER, // Chuyển khoản ngân hàng
//                 paymentStatus: paymentStatus,
//                 paymentFilledAmount: filledAmount,
//               },
//               $push: { paymentLogs: log },
//             }
//           );

//           // Gửi thông tin đơn hàng vào stream
//           pubsub.publish("order", order);

//           const notifies: INotification[] = [];
//           const title = `Đơn hàng #${order.code}`;
//           const body = `Chuyển khoản thành công. Số tiền: ${UtilsHelper.toMoney(amount)}`;
//           // Gửi thông báo tới người dùng
//           notifies.push(
//             new NotificationBuilder(title, body)
//               .order(order._id)
//               .sendTo(NotificationTarget.CUSTOMER, order.buyerId)
//               .build()
//           );
//           // Gửi thông báo tới nhân viên
//           const staffs = await staffService.getStaffByBranchAndScope(
//             order.fromMemberId,
//             order.shopBranchId
//           );
//           staffs.forEach((s) => {
//             notifies.push(
//               new NotificationBuilder(title, body)
//                 .order(order._id)
//                 .sendTo(NotificationTarget.STAFF, s._id)
//                 .build()
//             );
//           });
//           await InsertNotification(notifies);
//         }
//       } catch (err) {
//         logger.error(`payment-tracking-casso-error`, err);
//       }
//     },
//   },
// ];
