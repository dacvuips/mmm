import { gql } from "apollo-server-express";
import { DeliveryServices, PickupTypes } from "../../../../helpers/vietnamPost/resources/type";

export default gql`
  type DeliveryInfo {
    "Tên người gửi *"
    senderFullname: String
    "Số điện thoại người gửi"
    senderTel: String
    "Địa chỉ gửi"
    senderAddress: String
    "Mã phường người gửi"
    senderWardId: String
    "Mã tỉnh người gửi"
    senderProvinceId: String
    "Mã quận người gửi"
    senderDistrictId: String

    "Tên người nhận"
    receiverFullname: String
    "Địa chỉ nhận"
    receiverAddress: String
    "Phone người nhận"
    receiverTel: String
    "Mã tỉnh người nhận"
    receiverProvinceId: String
    "Mã quận người nhận"
    receiverDistrictId: String
    "Mã phường người nhận"
    receiverWardId: String
    "Loại địa chỉ người nhận '1=Nhà riêng | 2=Cơ quan | null=Không có thông tin'"
    receiverAddressType: Int

    "Mã Dịch vụ chuyển phát ${Object.values(DeliveryServices)}"
    serviceName: String
    "Icon Dịch vụ"
    serviceIcon: String

    "Mã hóa đơn liên quan"
    orderCode: String

    "Nội dung hàng"
    packageContent: String

    "Trọng lượng (gr)"
    weightEvaluation: Int
    "Chiều rộng (cm)"
    widthEvaluation: Int
    "Chiều dài (cm)"
    lengthEvaluation: Int
    "Chiều cao (cm)"
    heightEvaluation: Int

    "Số tiền thu hộ"
    codAmountEvaluation: Float

    "Cho xem hàng không ?"
    isPackageViewable: Boolean

    "Hình thức thu gom ${Object.values(PickupTypes)}"
    pickupType: Int

    "Giá trị đơn hàng tạm tính"
    orderAmountEvaluation: Float

    "Cộng thêm cước vào phí thu hộ"
    isReceiverPayFreight: Boolean

    "Yêu cầu khác"
    customerNote: String
    
    "Báo phát"
    useBaoPhat: Boolean

    "Hóa đơn"
    useHoaDon: Boolean

    "Mã khách hàng"
    customerCode: String
    
    "Mã nhà cung cấp"
    vendorId: String

    "Code đơn vận"
    itemCode: String
    
    "Mã đơn vận"
    orderId: String

    "Thời gian tạo đơn"
    createTime: String
    "Cập nhật lần cuối"
    lastUpdateTime: String
    "Ngày dự kiến giao hàng"
    deliveryDateEvaluation: String
    "Thời gian hủy đơn"
    cancelTime: String
    "Thời gian giao hàng"
    deliveryTime: String
    "Số lần báo phát"
    deliveryTimes: Int
    "Mã tình trạng"
    status: String
    "Tình trạng"
    statusText: String
    "Phí giao hàng trả cho đối tác"
    partnerFee: Float
    "Mã giảm giá"
    promotionCode: String
    "Giảm giá từ đối tác"
    partnerDiscount: Float
  }

  input DeliveryInfoInput {
    "Tên người gửi *"
    senderFullname: String!
    "Số điện thoại người gửi"
    senderTel: String!
    "Địa chỉ gửi"
    senderAddress: String!
    "Mã phường người gửi"
    senderWardId: String!
    "Mã tỉnh người gửi"
    senderProvinceId: String!
    "Mã quận người gửi"
    senderDistrictId: String!

    "Tên người nhận"
    receiverFullname: String!
    "Địa chỉ nhận"
    receiverAddress: String!
    "Phone người nhận"
    receiverTel: String!
    "Mã tỉnh người nhận"
    receiverProvinceId: String!
    "Mã quận người nhận"
    receiverDistrictId: String!
    "Mã phường người nhận"
    receiverWardId: String!
    "Loại địa chỉ người nhận '1=Nhà riêng | 2=Cơ quan | null=Không có thông tin'"
    receiverAddressType: Int

    "Mã hóa đơn liên quan"
    orderCode: String

    "Nội dung hàng"
    packageContent: String

    "Trọng lượng (gr)"
    weightEvaluation: Int!
    "Chiều rộng (cm)"
    widthEvaluation: Int
    "Chiều dài (cm)"
    lengthEvaluation: Int
    "Chiều cao (cm)"
    heightEvaluation: Int

    "Số tiền thu hộ"
    codAmountEvaluation: Float

    "Cho xem hàng không ?"
    isPackageViewable: Boolean!

    "Giá trị đơn hàng tạm tính"
    orderAmountEvaluation: Float

    "Cộng thêm cước vào phí thu hộ"
    isReceiverPayFreight: Boolean

    "Yêu cầu khác"
    customerNote: String
    
    "Báo phát"
    useBaoPhat: Boolean

    "Hóa đơn"
    useHoaDon: Boolean

    sharedLink: String
  }
`;
