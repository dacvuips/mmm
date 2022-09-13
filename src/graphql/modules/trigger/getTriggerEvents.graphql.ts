import { gql } from "apollo-server-express";
import { Context } from "../../context";

export default {
  schema: gql`
    extend type Query {
      getTriggerEvents: Mixed
    }
  `,
  resolver: {
    Query: {
      getTriggerEvents: async (root: any, args: any, context: Context) => {
        return [
          {
            id: "order",
            name: "Đơn hàng",
            events: [
              { id: "order:new", name: "Đơn hàng mới" },
              { id: "order:confirmed", name: "Đang làm món" },
              { id: "order:delivering", name: "Đang giao hàng" },
              { id: "order:completed", name: "Đơn hàng hoàn thành" },
              { id: "order:canceled", name: "Đơn hàng huỷ" },
            ],
            context: [
              { id: "buyerName", name: "Tên khách hàng" },
              { id: "buyerPhone", name: "Điện thoại khách hàng" },
              { id: "amount", name: "Tổng tiền hóa đơn" },
              { id: "subtotal", name: "Tổng tiền hàng" },
              { id: "promotionCode", name: "Mã khuyến mãi" },
              { id: "discount", name: "Giảm giá" },
              { id: "buyerFullAddress", name: "Địa chỉ khách hàng" },
              { id: "shipfee", name: "Phí ship" },
              { id: "code", name: "Mã đơn hàng" },
              { id: "shopBranchAddress", name: "Địa chỉ chi nhánh đang đặt" },
              { id: "itemCount", name: "Số lượng sản phẩm" },
              { id: "confirmNote", name: "Ghi chú làm món" },
              { id: "buyerAddressNote", name: "Ghi chú địa chỉ" },
              { id: "rewardPoint", name: "Điểm Thưởng cho đơn hàng" },
              { id: "discountPoint", name: "Số điểm đã sử dụng" },
              { id: "itemText", name: "Nội dung đơn hàng" },
              { id: "remainRewardPoint", name: "Điểm thưởng còn lại" },
            ],
          },
          {
            id: "collaborator",
            name: "Cộng tác viên",
            events: [
              { id: "collaborator:registered", name: "Đăng ký thành công" },
              { id: "collaborator:add-commission", name: "Cộng hoa hồng" },
            ],
            context: [
              { id: "code", name: "Mã cộng tác viên" },
              { id: "name", name: "Tên cộng tác viên" },
              { id: "phone", name: "Số điện thoại" },
              { id: "memberId", name: "Chủ shop" },
              { id: "customerId", name: "Khách hàng" },
              { id: "shortCode", name: "Mã giới thiệu" },
              { id: "clickCount", name: "Lượt click" },
              { id: "likeCount", name: "Lượt like" },
              { id: "shareCount", name: "Lượt share" },
              { id: "commentCount", name: "Lượt comment" },
              { id: "engagementCount", name: "Lượt tương tác" },
              { id: "status", name: "Trạng thái" },
            ],
          },
          {
            id: "customer",
            name: "Khách hàng",
            events: [{ id: "customer:birthday", name: "Ngày sinh nhật" }],
            context: [
              { id: "code", name: "Mã khách hàng" },
              { id: "name", name: "Tên khách hàng" },
              { id: "phone", name: "Số điện thoại" },
              { id: "email", name: "Email" },
              { id: "idCard", name: "Số chứng minh nhân dân" },
              { id: "avatar", name: "Avatar" },
              { id: "gender", name: "Giới tính" },
              { id: "birthday", name: "Ngày sinh" },
              { id: "address", name: "Địa chỉ" },
              { id: "fullAddress", name: "Full địa chỉ" },
              { id: "addressNote", name: "Ghi chú địa chỉ" },
              { id: "province", name: "Tỉnh / thành" },
              { id: "district", name: "Quận / huyện" },
              { id: "ward", name: "Phường / xã" },
            ],
          },
        ];
      },
    },
  },
};
