import { gql } from "apollo-server-express";
import { ShopVoucherType } from "./shopVoucher.model";
import { DiscountUnit } from "./types/discountItem.schema";

const schema = gql`
  extend type Query {
    getAllShopVoucher(q: QueryGetListInput): ShopVoucherPageData
    getOneShopVoucher(id: ID!): ShopVoucher
    # Add Query
  }

  extend type Mutation {
    createShopVoucher(data: CreateShopVoucherInput!): ShopVoucher
    updateShopVoucher(id: ID!, data: UpdateShopVoucherInput!): ShopVoucher
    deleteOneShopVoucher(id: ID!): ShopVoucher
    # Add Mutation
  }

  input CreateShopVoucherInput {

    "Mã khuyến mãi"
    code: String!
    "Loại giảm giá ${Object.values(ShopVoucherType)}"
    type: String!
    "Mô tả"
    description: String!
    "Kích hoạt"
    isActive: Boolean
    "Số lượng phát hành"
    issueNumber: Int
    "Phát hành mỗi ngày"
    issueByDate: Boolean
    "Số lượng sử dụng / mỗi khách"
    useLimit: Int
    "Số lượng sử dụng theo ngày"
    useLimitByDate: Boolean
    "Đơn vị giảm giá"
    discountUnit: String
    "Giá trị giảm giá"
    discountValue: Float
    "Giảm giá tối đa"
    maxDiscount: Float
    "Sản phẩm quà tặng"
    offerItems: [OfferItemInput]
    "Sản phẩm quà tặng"
    offerItemGroups: [[OfferItemInput]]
    "Sản phẩm theo nhóm 2"
    offerItemGroups2: [OfferItemGroupInput]
    "Sản phẩm giảm giá"
    discountItems: [DiscountItemInput]
    "Các sản phẩm áp dụng"
    applyItemIds: [String]
    "Bắt buốc phải có hết sản phẩm áp dụng"
    requireAllApplyItem: Boolean
    "Chỉ áp dụng sản phẩm trong danh sách áp dụng"
    onlyApplyItem: Boolean
    "Các sản phẩm không áp dụng"
    exceptItemIds: [String]
    "Tổng tiền hàng tối thiểu"
    minSubtotal: Float
    "Phương thức thanh toán áp dụng"
    applyPaymentMethods: [String]
    "Số lượng sản phẩm tối thiểu"
    minItemQty: Int
    "Ngày bắt đầu"
    startDate: DateTime
    "Ngày kết thúc"
    endDate: DateTime
    "Mã giảm giá riêng tư"
    isPrivate: Boolean
    "Mã giảm giá chỉ dành cho tặng cá nhân"
    isPersonal: Boolean
    "Hình ảnh"
    image: String
    "Nội dung html"
    content: String
    "Đồng giá"
    samePrice: Float
    "Áp dụng tất cả sản phẩm"
    offerAllItem: Boolean
    "Số lượng tặng"
    offerQty: Int
    "Ưu tiên sản phầm giá cao"
    offerHighestPrice: Boolean
    "Tụ động thêm sản phẩm ưu đãi"
    autoAddOfferItem: Boolean

    "Ngày trong tuần áp dụng : từ 1-7 với 1= Chủ nhật, 7 = Thứ bảy"
    applyISODayOfWeek: [Int]
    "Khung giờ áp dụng, [ ['HH:mm:ss','HH:mm:ss'] ]"
    applyTimeOfDay: [[String]]
  }

  input UpdateShopVoucherInput {
    "Loại giảm giá ${Object.values(ShopVoucherType)}"
    type: String
    "Mô tả"
    description: String
    "Kích hoạt"
    isActive: Boolean
    "Số lượng phát hành"
    issueNumber: Int
    "Phát hành mỗi ngày"
    issueByDate: Boolean
    "Số lượng sử dụng / mỗi khách"
    useLimit: Int
    "Số lượng sử dụng theo ngày"
    useLimitByDate: Boolean
    "Đơn vị giảm giá"
    discountUnit: String
    "Giá trị giảm giá"
    discountValue: Float
    "Giảm giá tối đa"
    maxDiscount: Float
    "Sản phẩm quà tặng"
    offerItems: [OfferItemInput]
    "Sản phẩm quà tặng"
    offerItemGroups: [[OfferItemInput]]
    "Sản phẩm theo nhóm 2"
    offerItemGroups2: [OfferItemGroupInput]
    "Sản phẩm giảm giá"
    discountItems: [DiscountItemInput]
    "Các sản phẩm áp dụng"
    applyItemIds: [String]
    "Bắt buốc phải có hết sản phẩm áp dụng"
    requireAllApplyItem: Boolean
    "Chỉ áp dụng sản phẩm trong danh sách áp dụng"
    onlyApplyItem: Boolean
    "Các sản phẩm không áp dụng"
    exceptItemIds: [String]
    "Tổng tiền hàng tối thiểu"
    minSubtotal: Float
    "Phương thức thanh toán áp dụng"
    applyPaymentMethods: [String]
    "Số lượng sản phẩm tối thiểu"
    minItemQty: Int
    "Ngày bắt đầu"
    startDate: DateTime
    "Ngày kết thúc"
    endDate: DateTime
    "Mã giảm giá riêng tư"
    isPrivate: Boolean
    "Mã giảm giá chỉ dành cho tặng cá nhân"
    isPersonal: Boolean
    "Hình ảnh"
    image: String
    "Nội dung html"
    content: String
    "Đồng giá"
    samePrice: Float
    "Áp dụng tất cả sản phẩm"
    offerAllItem: Boolean
    "Số lượng tặng"
    offerQty: Int
    "Ưu tiên sản phầm giá cao"
    offerHighestPrice: Boolean
    "Tụ động thêm sản phẩm ưu đãi"
    autoAddOfferItem: Boolean

    "Ngày trong tuần áp dụng : từ 1-7 với 1= Chủ nhật, 7 = Thứ bảy"
    applyISODayOfWeek: [Int]
    "Khung giờ áp dụng, [ ['HH:mm:ss','HH:mm:ss'] ]"
    applyTimeOfDay: [[String]]
  }

  type ShopVoucher {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã chủ shop"
    memberId: ID
    "Shop"
    member: Member
    "Mã khuyến mãi"
    code: String
    "Mô tả"
    description: String
    "Kích hoạt"
    isActive: Boolean
    "Loại giảm giá ${Object.values(ShopVoucherType)}"
    type: String
    "Số lượng phát hành"
    issueNumber: Int
    "Phát hành mỗi ngày"
    issueByDate: Boolean
    "Số lượng sử dụng / mỗi khách"
    useLimit: Int
    "Số lượng sử dụng theo ngày"
    useLimitByDate: Boolean
    "Đơn vị giảm giá ${Object.values(DiscountUnit)}"
    discountUnit: String
    "Giá trị giảm giá"
    discountValue: Float
    "Giảm giá tối đa"
    maxDiscount: Float
    "Sản phẩm quà tặng"
    offerItems: [OfferItem]
    "Sản phẩm quà tặng"
    offerItemGroups: [[OfferItem]]
    "Sản phẩm theo nhóm 2"
    offerItemGroups2: [OfferItemGroup]
    "Sản phẩm giảm giá"
    discountItems: [DiscountItem]
    "Các sản phẩm áp dụng"
    applyItemIds: [ID]
    "Bắt buốc phải có hết sản phẩm áp dụng"
    requireAllApplyItem: Boolean
    "Chỉ áp dụng sản phẩm trong danh sách áp dụng"
    onlyApplyItem: Boolean
    "Các sản phẩm không áp dụng"
    exceptItemIds: [ID]
    "Tổng tiền hàng tối thiểu"
    minSubtotal: Float
    "Phương thức thanh toán áp dụng"
    applyPaymentMethods: [String]
    "Số lượng sản phẩm tối thiểu"
    minItemQty: Int
    "Ngày bắt đầu"
    startDate: DateTime
    "Ngày kết thúc"
    endDate: DateTime
    "Mã giảm giá riêng tư"
    isPrivate: Boolean
    "Mã giảm giá chỉ dành cho tặng cá nhân"
    isPersonal: Boolean
    "Hình ảnh"
    image: String
    "Nội dung html"
    content: String
    "Đồng giá"
    samePrice: Float
    "Áp dụng tất cả sản phẩm"
    offerAllItem: Boolean
    "Số lượng tặng"
    offerQty: Int
    "Ưu tiên sản phầm giá cao"
    offerHighestPrice: Boolean
    "Tụ động thêm sản phẩm ưu đãi"
    autoAddOfferItem: Boolean
    "Ngày trong tuần áp dụng : từ 1-7 với 1= Chủ nhật, 7 = Thứ bảy"
    applyISODayOfWeek: [Int]
    "Khung giờ áp dụng, [ ['HH:mm:ss','HH:mm:ss'] ]"
    applyTimeOfDay: [[String]]
  }

  type ShopVoucherPageData {
    data: [ShopVoucher]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
