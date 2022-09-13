import { gql } from "apollo-server-express";
import { DiscountUnit } from "../shopVoucher/types/discountItem.schema";
import { CommissionBy } from "./shopConfig.model";

const schema = gql`
  extend type Mutation {
    updateShopConfig(id: ID!, data: UpdateShopConfigInput!): ShopConfig
    # Add Mutation
  }

  input UpdateShopConfigInput {
    "Thời gian chuẩn bị"
    shipPreparationTime: String
    "Khoản cách giao hàng mặc định"
    shipDefaultDistance: Int
    "Phí giao hàng mặc định"
    shipDefaultFee: Float
    "Phí ship cộng thêm mỗi km"
    shipNextFee: Float
    "Phí ship dưới 1 km"
    shipOneKmFee: Float
    "Bật phí ship dưới 1 km"
    shipUseOneKmFee: Boolean
    "Ghi chú cho shipper"
    shipNote: String
    "Đánh giá sao"
    rating: Float
    "Số lượng đánh giá"
    ratingQty: Int
    "Số lượng đã bán"
    soldQty: Int
    "Tiêu đề Upsale"
    upsaleTitle: String
    "Màu primary"
    primaryColor: String
    "Màu accent"
    accentColor: String
    "Bật tin nhắn đơn hàng"
    smsOrder: Boolean
    "Bạt tin nhắn OTP"
    smsOtp: Boolean
    "Bật tin nhắn CTV"
    smsCol: Boolean
    "Bật / tắt cộng tác viên"
    collaborator: Boolean
    "Yêu cầu duyệt cộng tác viên"
    colApprove: Boolean
    "Yêu cầu CTV có số đơn tối thiểu"
    colMinOrder: Int
    "Tính hoa hồng dựa trên điệu kiên gì ${Object.values(CommissionBy)}"
    colCommissionBy: String
    "Hoa hồng cố định theo % hoặc VND ${Object.values(DiscountUnit)}"
    colCommissionUnit: String
    "Giá trị hoa hồng trên từng đơn hàng"
    colCommissionValue: Float
    "Điều khoản cộng tác viên"
    colTerm: String
    "Bật / tắt chuyển khoản ngân hàng qua casso"
    cassoEnabled: Boolean
    "Bật / tắt thanh toán khi nhận hàng"
    codEnabled: Boolean
    "Bật / tắt thanh toán momo"
    momoEnabled: Boolean
    "Bật / tắt thanh toán vnpay"
    vnpayEnabled: Boolean
    "Bật / tắt thanh toán zalo"
    zalopayEnabled: Boolean

    "Giới hạn số đơn được đặt cùng 1 lúc"
    limitOpenOrder: Int
    "Giới hạn số sản phẩm trong 1 đơn hàng"
    limitItem: Int

    "Danh sách tài khoản ngân hàng"
    banks: [BankInput]

    "Thông tin chung"
    intro: String
  }

  type ShopConfig {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: ID
    "Mã CRM VNPost"
    vnpostCode: String
    "Điện thoại VNPost"
    vnpostPhone: String
    "Tên người dùng VNPost"
    vnpostName: String
    "Thời gian chuẩn bị"
    shipPreparationTime: String
    "Khoản cách giao hàng mặc định"
    shipDefaultDistance: Int
    "Phí giao hàng mặc định"
    shipDefaultFee: Float
    "Phí ship cộng thêm mỗi km"
    shipNextFee: Float
    "Phí ship dưới 1 km"
    shipOneKmFee: Float
    "Bật phí ship dưới 1 km"
    shipUseOneKmFee: Boolean
    "Ghi chú cho shipper"
    shipNote: String
    "Đánh giá sao"
    rating: Float
    "Số lượng đánh giá"
    ratingQty: Int
    "Số lượng đã bán"
    soldQty: Int
    "Tiêu đề Upsale"
    upsaleTitle: String
    "Màu primary"
    primaryColor: String
    "Màu accent"
    accentColor: String
    "Bật tin nhắn đơn hàng"
    smsOrder: Boolean
    "Bạt tin nhắn OTP"
    smsOtp: Boolean
    "Bật tin nhắn CTV"
    smsCol: Boolean
    "Bật / tắt cộng tác viên"
    collaborator: Boolean
    "Yêu cầu duyệt cộng tác viên"
    colApprove: Boolean
    "Yêu cầu CTV có số đơn tối thiểu"
    colMinOrder: Int
    "Tính hoa hồng dựa trên điệu kiên gì ${Object.values(CommissionBy)}"
    colCommissionBy: String
    "Hoa hồng cố định theo % hoặc VND ${Object.values(DiscountUnit)}"
    colCommissionUnit: String
    "Giá trị hoa hồng trên từng đơn hàng"
    colCommissionValue: Float
    "Điều khoản cộng tác viên"
    colTerm: String

    "Trạng thái kết nối"
    cassoStatus: String
    "Tài khoản Casso"
    cassoUser: Mixed
    "Bật / tắt chuyển khoản ngân hàng qua casso"
    cassoEnabled: Boolean
    "Danh sách tài khoản ngân hàng"
    banks: [Bank]

    "Bật / tắt thanh toán khi nhận hàng"
    codEnabled: Boolean
    "Bật / tắt thanh toán momo"
    momoEnabled: Boolean
    "Bật / tắt thanh toán vnpay"
    vnpayEnabled: Boolean
    "Bật / tắt thanh toán zalo"
    zalopayEnabled: Boolean
    "Giới hạn số đơn được đặt cùng 1 lúc"
    limitOpenOrder: Int
    "Giới hạn số sản phẩm trong 1 đơn hàng"
    limitItem: Int

    "Thông tin chung"
    intro: String
  }
`;

export default schema;
