import { SettingType } from "../graphql/modules/setting/setting.model";
import { DeliveryServices, ServiceCode } from "../helpers/vietnamPost/resources/type";

export enum SettingGroupSlug {
  CAU_HINH_CHUNG = "CAU_HINH_CHUNG",
  THONG_BAO_CHATBOT = "THONG_BAO_CHATBOT",
  KICH_BAN_BAT_DAU = "KICH_BAN_BAT_DAU",
  CAU_HINH_VAN_CHUYEN = "CAU_HINH_VAN_CHUYEN",
  CAU_HINH_THONG_BAO_TONG_CUC = "CAU_HINH_THONG_BAO_TONG_CUC",
  CAU_HINH_DASHBOARD = "CAU_HINH_DASHBOARD",
  CAU_HINH_TRUYEN_THONG = "CAU_HINH_TRUYEN_THONG",
  CAU_HINH_TIN_NHAN = "CAU_HINH_TIN_NHAN",
  CAU_HINH_DANG_KY_SHOP = "CAU_HINH_DANG_KY_SHOP",
  CAU_HINH_CONG_TAC_VIEN = "CAU_HINH_CONG_TAC_VIEN",
  CAU_HINH_THU_PHI = "CAU_HINH_THU_PHI",
  CAU_HINH_MOMO = "CAU_HINH_MOMO",
  CAU_HINH_LANDING_PAGE = "CAU_HINH_LANDING_PAGE",
  CAU_HINH_TAI_KHOAN = "CAU_HINH_TAI_KHOAN",
}
export enum SettingKey {
  // CAU_HINH_CHUNG
  TITLE = "TITLE",
  LOGO = "LOGO",
  UNIT_PRICE = "UNIT_PRICE",
  CHATBOT_API_KEY = "CHATBOT_API_KEY",
  DEFAULT_SHOP_CODE = "DEFAULT_SHOP_CODE",
  MAINTENANCE = "MAINTENANCE",
  SEO_TITLE = "SEO_TITLE",
  SEO_DESCRIPTION = "SEO_DESCRIPTION",
  SEO_IMAGE = "SEO_IMAGE",
  HERE_MAP_KEY = "HERE_MAP_KEY",
  SCRIPT = "SCRIPT",
  LINK_APP_ANDROID = "LINK_APP_ANDROID",
  LINK_APP_IOS = "LINK_APP_IOS",

  // THONG_BAO_CHATBOT
  REGIS_SERVICE_COMMISSION_MSG = "REGIS_SERVICE_COMMISSION_MSG",
  REGIS_SERVICE_BONUS_POINT_MSG = "REGIS_SERVICE_BONUS_POINT_MSG",

  SMS_COMMISSION_MSG = "SMS_COMMISSION_MSG",
  SMS_BONUS_POINT_MSG = "SMS_BONUS_POINT_MSG",

  ORDER_COMMISSION_MSG_FOR_PRESENTER = "ORDER_COMMISSION_MSG_FOR_PRESENTER",

  ORDER_COMPLETED_MSG = "ORDER_COMPLETED_MSG",

  ORDER_CANCELED_MSG = "ORDER_CANCELED_MSG",
  ORDER_CANCELED_CUSTOMER_MSG = "ORDER_CANCELED_CUSTOMER_MSG",
  ORDER_CANCELED_CUSTOMER_MOBI_MSG = "ORDER_CANCELED_CUSTOMER_MOBI_MSG",
  ORDER_CANCELED_SELLER_MSG = "ORDER_CANCELED_SELLER_MSG",
  ORDER_CANCELED_SELLER_CROSSSALE_MSG = "ORDER_CANCELED_SELLER_CROSSSALE_MSG",

  SMS_COMPLETED_MSG_FOR_CUSTOMER = "SMS_COMPLETED_MSG_FOR_CUSTOMER",
  SMS_COMPLETED_MSG_FOR_MOBIFONE = "SMS_COMPLETED_MSG_FOR_MOBIFONE",
  SMS_COMPLETED_MSG_FOR_SELLER = "SMS_COMPLETED_MSG_FOR_SELLER",
  SMS_CANCELED_MSG = "SMS_CANCELED_MSG",
  SMS_COMMISSION_MSG_FOR_PRESENTER = "SMS_COMMISSION_MSG_FOR_PRESENTER",

  REGIS_SERVICE_COMPLETED_MSG_MOBIFONE = "REGIS_SERVICE_COMPLETED_MSG_MOBIFONE",
  REGIS_SERVICE_COMPLETED_MSG_CUSTOMER = "REGIS_SERVICE_COMPLETED_MSG_CUSTOMER",
  REGIS_SERVICE_COMPLETED_MSG_SELLER = "REGIS_SERVICE_COMPLETED_MSG_SELLER",
  REGIS_SERVICE_COMMISSION_MSG_FOR_PRESENTER = "REGIS_SERVICE_COMMISSION_MSG_FOR_PRESENTER",
  REGIS_SERVICE_CANCELED_MSG = "REGIS_SERVICE_CANCELED_MSG",

  //////////////////////////////////////////////////////////////////////////
  ORDER_PENDING_MSG_FOR_SHOPPER = "ORDER_PENDING_MSG_FOR_SHOPPER",
  ORDER_PENDING_MSG_FOR_CUSTOMER = "ORDER_PENDING_MSG_FOR_CUSTOMER",
  ORDER_PENDING_MSG_FOR_CROSSALE_SHOPPER = "ORDER_PENDING_MSG_FOR_CROSSALE_SHOPPER",
  ORDER_PENDING_MSG_FOR_MOBIFONE = "ORDER_PENDING_MSG_FOR_MOBIFONE",
  //////////////////////////////////////////////////////////////////////////

  ORDER_COMPLETED_MSG_FOR_SHOPPER = "ORDER_COMPLETED_MSG_FOR_SHOPPER",
  ORDER_COMPLETED_MSG_FOR_CROSSALE_SHOPPER = "ORDER_COMPLETED_MSG_FOR_CROSSALE_SHOPPER",
  ORDER_COMPLETED_MSG_FOR_CUSTOMER = "ORDER_COMPLETED_MSG_FOR_CUSTOMER",
  ORDER_COMPLETED_MSG_FOR_MOBIPHONE = "ORDER_COMPLETED_MSG_FOR_MOBIPHONE",
  LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_MOBIFONE = "LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_MOBIFONE",
  LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_CUSTOMER = "LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_CUSTOMER",
  LUCKYWHEEL_WIN_PRESENT_MSG_FOR_MOBIFONE = "LUCKYWHEEL_WIN_PRESENT_MSG_FOR_MOBIFONE",
  LUCKYWHEEL_WIN_EVOUCHER_MSG_FOR_MOBIFONE = "LUCKYWHEEL_WIN_EVOUCHER_MSG_FOR_MOBIFONE",

  LUCKYWHEEL_WIN_PRESENT_MSG_FOR_CUSTOMER = "LUCKYWHEEL_WIN_PRESENT_MSG_FOR_CUSTOMER",
  LUCKYWHEEL_WIN_EVOUCHER_MSG_FOR_CUSTOMER = "LUCKYWHEEL_WIN_EVOUCHER_MSG_FOR_CUSTOMER",
  LUCKYWHEEL_LOSE_MSG_FOR_CUSTOMER = "LUCKYWHEEL_LOSE_MSG_FOR_CUSTOMER",

  // KICH_BAN_BAT_DAU
  STORY_NAME = "STORY_NAME",
  STORY_REF = "STORY_REF",
  STORY_MESSAGE = "STORY_MESSAGE",
  STORY_BTN_TITLE = "STORY_BTN_TITLE",
  WEBAPP_DOMAIN = "WEBAPP_DOMAIN",
  ADMIN_DOMAIN = "ADMIN_DOMAIN",
  APP_DOMAIN = "APP_DOMAIN",
  CAMPAIGN_HEADER_MSG_FOR_SHOPPER = "CAMPAIGN_HEADER_MSG_FOR_SHOPPER",
  CAMPAIGN_IMAGE_MSG_FOR_SHOPPER = "CAMPAIGN_IMAGE_MSG_FOR_SHOPPER",
  CAMPAIGN_CONTENT_MSG_FOR_SHOPPER = "CAMPAIGN_CONTENT_MSG_FOR_SHOPPER",

  //DELIVERY
  DELIVERY_ENABLED_VNPOST = "DELIVERY_ENABLED_VNPOST",
  DELIVERY_POST_FEE = "DELIVERY_POST_FEE",
  DELIVERY_ORDER_SHIP_FEE = "DELIVERY_ORDER_SHIP_FEE",
  DELIVERY_ENABLED_AUTO_APPROVE_ORDER = "DELIVERY_ENABLED_AUTO_APPROVE_ORDER",
  VNPOST_DEFAULT_SHIP_SERVICE_METHOD_CODE = "VNPOST_DEFAULT_SHIP_SERVICE_METHOD_CODE",
  DELIVERY_STATUS_CUSTOMER_ALERT = "DELIVERY_STATUS_CUSTOMER_ALERT",
  DELIVERY_STATUS_MEMBER_ALERT = "DELIVERY_STATUS_MEMBER_ALERT",

  DELIVERY_COMPLETED_MSG_FOR_CUSTOMER = "DELIVERY_COMPLETED_MSG_FOR_CUSTOMER",
  DELIVERY_FAILURE_MSG_FOR_CUSTOMER = "DELIVERY_FAILURE_MSG_FOR_CUSTOMER",
  DELIVERY_PENDING_MSG_FOR_CUSTOMER = "DELIVERY_PENDING_MSG_FOR_CUSTOMER",

  DELIVERY_COMPLETED_MSG_FOR_MEMBER = "DELIVERY_COMPLETED_MSG_FOR_MEMBER",
  DELIVERY_FAILURE_MSG_FOR_MEMBER = "DELIVERY_FAILURE_MSG_FOR_MEMBER",
  DELIVERY_PENDING_MSG_FOR_MEMBER = "DELIVERY_PENDING_MSG_FOR_MEMBER",
  DELIVERY_ENABLED_DONG_GIA = "DELIVERY_ENABLED_DONG_GIA",
  POST_CREATE_ORDER_ALERT_ENABLED = "POST_CREATE_ORDER_ALERT_ENABLED",
  DELIVERY_ENABLED_CONTACT = "DELIVERY_ENABLED_CONTACT",

  // { label: "Tự liên hệ", value: ShipMethod.NONE },
  // { label: "Nhận hàng tại chi nhánh", value: ShipMethod.POST },
  // { label: "Giao hàng VNPost", value: ShipMethod.VNPOST },
  DELIVERY_NONE_LABEL = "DELIVERY_NONE_LABEL",
  DELIVERY_POST_LABEL = "DELIVERY_POST_LABEL",
  DELIVERY_VNPOST_LABEL = "DELIVERY_VNPOST_LABEL",

  DELIVERY_ESTIMATE_DISTANCE_BY_GOONGJS = "DELIVERY_ESTIMATE_DISTANCE_BY_GOONGJS",
  DELIVERY_GOONGJS_API_KEY = "DELIVERY_GOONGJS_API_KEY",
  ///

  OVERVIEW_SHOP_COUNT_ENABLED = "OVERVIEW_SHOP_COUNT_ENABLED",
  OVERVIEW_SHOP_COUNT_TITLE = "OVERVIEW_SHOP_COUNT_TITLE",
  OVERVIEW_BRANCH_COUNT_ENABLED = "OVERVIEW_BRANCH_COUNT_ENABLED",
  OVERVIEW_BRANCH_COUNT_TITLE = "OVERVIEW_BRANCH_COUNT_TITLE",
  OVERVIEW_SALER_COUNT_ENABLED = "OVERVIEW_SALER_COUNT_ENABLED",
  OVERVIEW_SALER_COUNT_TITLE = "OVERVIEW_SALER_COUNT_TITLE",
  OVERVIEW_AGENCY_COUNT_ENABLED = "OVERVIEW_AGENCY_COUNT_ENABLED",
  OVERVIEW_AGENCY_COUNT_TITLE = "OVERVIEW_AGENCY_COUNT_TITLE",
  OVERVIEW_CUSTOMER_COUNT_ENABLED = "OVERVIEW_CUSTOMER_COUNT_ENABLED",
  OVERVIEW_CUSTOMER_COUNT_TITLE = "OVERVIEW_CUSTOMER_COUNT_TITLE",

  OVERVIEW_PRODUCT_COUNT_MOBIFONE_ENABLED = "OVERVIEW_PRODUCT_COUNT_MOBIFONE_ENABLED",
  OVERVIEW_PRODUCT_COUNT_MOBIFONE_TITLE = "OVERVIEW_PRODUCT_COUNT_MOBIFONE_TITLE",

  OVERVIEW_PRODUCT_COUNT_CROSSSALE_ENABLED = "OVERVIEW_PRODUCT_COUNT_CROSSSALE_ENABLED",
  OVERVIEW_PRODUCT_COUNT_CROSSSALE_TITLE = "OVERVIEW_PRODUCT_COUNT_CROSSSALE_TITLE",

  OVERVIEW_PRODUCT_COUNT_RETAIL_ENABLED = "OVERVIEW_PRODUCT_COUNT_RETAIL_ENABLED",
  OVERVIEW_PRODUCT_COUNT_RETAIL_TITLE = "OVERVIEW_PRODUCT_COUNT_RETAIL_TITLE",

  OVERVIEW_PRODUCT_COUNT_SMS_ENABLED = "OVERVIEW_PRODUCT_COUNT_SMS_ENABLED",
  OVERVIEW_PRODUCT_COUNT_SMS_TITLE = "OVERVIEW_PRODUCT_COUNT_SMS_TITLE",

  OVERVIEW_PRODUCT_COUNT_SERVICE_ENABLED = "OVERVIEW_PRODUCT_COUNT_SERVICE_ENABLED",
  OVERVIEW_PRODUCT_COUNT_SERVICE_TITLE = "OVERVIEW_PRODUCT_COUNT_SERVICE_TITLE",

  ////////////////////// Loại thành viên
  MEMBER_TYPE_BRANCH = "MEMBER_TYPE_BRANCH",
  MEMBER_TYPE_SALE = "MEMBER_TYPE_SALE",
  MEMBER_TYPE_AGENCY = "MEMBER_TYPE_AGENCY",
  // CAU_HINH_TRUYEN_THONG
  MEDIA_FACEBOOK_TOKEN = "MEDIA_FACEBOOK_TOKEN",

  // CAU_HINH_TIN_NHAN
  SMS_ORDER_CONFIRMED = "SMS_ORDER_CONFIRMED",
  SMS_ORDER_CANCALED = "SMS_ORDER_CANCALED",
  SMS_DELIVERING = "SMS_DELIVERING",
  SMS_ORDER_COMPLETED = "SMS_ORDER_COMPLETED",
  SMS_OTP = "SMS_OTP",
  SMS_COL_REGIS_SUCCESS = "SMS_COL_REGIS_SUCCESS",

  // CAU_HINH_DANG_KY_SHOP
  EMAIL_REGIS_APPROVE = "EMAIL_REGIS_APPROVE",
  EMAIL_REGIS_REJECT = "EMAIL_REGIS_REJECT",
  EMAIL_REGIS_APPROVE_TITLE = "EMAIL_REGIS_APPROVE_TITLE",
  EMAIL_REGIS_REJECT_TITLE = "EMAIL_REGIS_REJECT_TITLE",
  REGIS_ENABLE = "REGIS_ENABLE",
  REGIS_REQUIRE_APPROVE = "REGIS_REQUIRE_APPROVE", // Yêu cầu xét duyệt

  // CAU_HINH_CONG_TAC_VIEN
  CTV_DIEU_KHOAN = "CTV_DIEU_KHOAN",

  // CAU_HINH_THU_PHI
  PLAN_FREE_PERIOD = "SERVICE_FREE_PERIOD",
  PLAN_MONTH_FEE = "PLAN_MONTH_FEE",
  PLAN_YEAR_FEE = "PLAN_YEAR_FEE",
  PLAN_STOP_PERIOD = "PLAN_STOP_PERIOD",
  PLAN_BASIC_FEE = "PLAN_BASIC_FEE",
  PLAN_PROFESSIONAL_FEE = "PLAN_PROFESSIONAL_FEE",

  // CAU_HINH_MOMO
  MOMO_DIEU_KHOAN = "MOMO_DIEU_KHOAN",

  // CAU_HINH_LANDING_PAGE
  LP_CASE_STUDY = "LP_CASE_STUDY",

  // CAU_HINH_TAI_KHOAN
  ACCOUNT_RESET_PWD_EMAIL_TITLE = "ACCOUNT_RESET_PWD_EMAIL_TITLE",
  ACCOUNT_RESET_PWD_EMAIL_CONTENT = "ACCOUNT_RESET_PWD_EMAIL_CONTENT",
  ACCOUNT_RESET_PWD_EXPIRE_SECONDS = "ACCOUNT_RESET_PWD_EXPIRE_SECONDS",
}

export const SETTING_DATA = [
  {
    slug: SettingGroupSlug.CAU_HINH_CHUNG,
    name: "Cấu hình chung",
    desc: "Các cấu hình chung",
    readOnly: true,
    settings: [
      {
        type: SettingType.string,
        name: "Tiêu đề ứng dụng",
        key: SettingKey.TITLE,
        value: `PShop`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Logo ứng dụng",
        key: SettingKey.LOGO,
        value: `https://mb-ashop.web.app/assets/img/logo.png`,
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Đơn giá",
        key: SettingKey.UNIT_PRICE,
        value: 1000,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Chatbot API Key của Fanpage chính",
        key: SettingKey.CHATBOT_API_KEY,
        value: "",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Cửa hàng mặc định",
        key: SettingKey.DEFAULT_SHOP_CODE,
        value: "PKDBDHCM",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "Bảo trì hệ thống",
        key: SettingKey.MAINTENANCE,
        value: false,
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "SEO: Tiêu đề",
        key: SettingKey.SEO_TITLE,
        value: "PShop",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "SEO: Mô tả",
        key: SettingKey.SEO_DESCRIPTION,
        value: "Cửa hàng PShop By VNPost",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "SEO: Hình ảnh",
        key: SettingKey.SEO_IMAGE,
        value: "https://i.ibb.co/RCh1LhV/Screen-Shot-2021-05-18-at-14-08-33.png",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "HERE MAP KEY",
        key: SettingKey.HERE_MAP_KEY,
        value: "x5Skw8UvomphDTa7DCKInmYU0T3qjrs0GfFoLYsrqvA",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Link app Android",
        key: SettingKey.LINK_APP_ANDROID,
        value: "https://play.google.com/store?hl=en&gl=US",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Link app IOS",
        key: SettingKey.LINK_APP_IOS,
        value: "https://www.apple.com/vn/app-store/",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Javascript Tuỳ Chỉnh",
        key: SettingKey.SCRIPT,
        value: `console.log('My script')`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.THONG_BAO_CHATBOT,
    name: "Thông báo chatbot",
    desc: "Nội dung thông báo chatbot",
    readOnly: true,
    settings: [
      {
        type: SettingType.richText,
        name: "Thông báo khi nhận hoa hồng người giới thiệu từ đơn hàng bán lẻ",
        key: SettingKey.ORDER_COMMISSION_MSG_FOR_PRESENTER,
        value: `[Thông báo tự động cho thành viên]
Chủ shop {{shopper.shopName}} do bạn giới thiệu đã duyệt thành công đơn hàng {{code}}.
Hoa hồng bạn nhận được là: {{$money(commission)}} đồng, tổng hoa hồng hiện tại là {{$money(myCommission)}} đồng.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đơn hàng cho khách hàng",
        key: SettingKey.ORDER_COMPLETED_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động cho khách hàng]
Đơn hàng {{order.code}} đã được duyệt. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
{{commission ? \`Hoa hồng tích lũy quý khách nhận được là: \${$money(commission)} đồng, tổng điểm hiện tại là \${$money(myCommission)} đồng.\`: \`\` }}
{{point ? \`Điểm tích lũy quý khách nhận được là: \${$money(point)} điểm, tổng điểm hiện tại là \${$money(myPoint)} điểm.\`: \`\` }}
Nếu quý khách có thắc mắc vui lòng liên hệ với chủ shop để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },

      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đơn hàng cho chủ shop",
        key: SettingKey.ORDER_COMPLETED_MSG_FOR_SHOPPER,
        value: `[Thông báo tự động cho chủ shop]
Đơn hàng {{order.code}} đã được duyệt. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ với chủ shop để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đơn hàng cho chủ shop bán chéo",
        key: SettingKey.ORDER_COMPLETED_MSG_FOR_CROSSALE_SHOPPER,
        value: `[Thông báo tự động cho chủ shop bán chéo]
Đơn hàng {{order.code}} đã được duyệt. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
{{commission ? \`Shop đã được tích \${$money(commission)} đồng, tổng tiền hoa hồng hiện tại là \${$money(myCommission)} đồng.\`: \`\`  }}
{{point ? \`Điểm tích lũy shop nhận được là: \${$money(point)} điểm, tổng điểm hiện tại là \${$money(myPoint)} điểm.\`: \`\` }}
Nếu quý khách có thắc mắc vui lòng liên hệ với chủ shop để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đơn hàng cho mobifone",
        key: SettingKey.ORDER_COMPLETED_MSG_FOR_MOBIPHONE,
        value: `[Thông báo tự động cho Mobifone]
Đơn hàng {{order.code}} đã được duyệt. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
{{commission ? \`Hoa hồng mobifone nhận được là: \${$money(commission)} đồng.\`: \`\`  }}
`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho chủ shop khi hủy đơn hàng",
        key: SettingKey.ORDER_CANCELED_MSG,
        value: `[Thông báo tự động cho chủ shop]
Đơn hàng {{order.code}} đã huỷ. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách khi hủy đơn hàng (Chủ shop)",
        key: SettingKey.ORDER_CANCELED_CUSTOMER_MSG,
        value: `[Thông báo tự động]
Đơn hàng {{order.code}} đã huỷ. Thông tin đơn hàng:
+ Danh sách sản phẩm:
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ với chủ shop để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      //////////////////////////////////////////////////////////////////////////////////////
      // ORDER_PENDING_MSG_FOR_SHOPPER = "ORDER_PENDING_MSG_FOR_SHOPPER",
      {
        type: SettingType.richText,
        name: "Thông báo cho chủ shop khi có đơn hàng",
        key: SettingKey.ORDER_PENDING_MSG_FOR_SHOPPER,
        value: `[Thông báo tự động]
Đơn hàng {{order.code}} đặt thành công. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng khi đặt hàng thành công",
        key: SettingKey.ORDER_PENDING_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động đến khách hàng]
Đơn hàng {{order.code}} đặt thành công. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin cửa hàng: {{seller.shopName}} - Số điện thoại:{{seller.phone}}
+ {{order.shipMethod === 'POST' ? \`Địa chỉ nhận hàng: \${order.deliveryInfo.receiverAddress} - Số điện thoại : \${order.deliveryInfo.receiverTel} \`: "" }}
+ {{order.shipMethod === 'NONE' ? \`Cửa hàng sẽ liên hệ quý khách hàng trong thời gian sớm nhất.\` : "" }}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      // ORDER_PENDING_MSG_FOR_CROSSALE_SHOPPER = "ORDER_PENDING_MSG_FOR_CROSSALE_SHOPPER",
      {
        type: SettingType.richText,
        name: "Thông báo cho chủ shop bán chéo khi đặt hàng thành công",
        key: SettingKey.ORDER_PENDING_MSG_FOR_CROSSALE_SHOPPER,
        value: `[Thông báo tự động dành cho chủ shop bán chéo]
Đơn hàng {{order.code}} đặt thành công. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      // ORDER_PENDING_MSG_FOR_MOBIFONE = "ORDER_PENDING_MSG_FOR_MOBIFONE",
      {
        type: SettingType.richText,
        name: "Thông báo cho mobifone khi đặt hàng thành công",
        key: SettingKey.ORDER_PENDING_MSG_FOR_MOBIFONE,
        value: `[Thông báo tự động dành cho Mobifone]
Đơn hàng {{order.code}} đặt thành công. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      ///////////////////////////////////////////////////////////////////////
      {
        type: SettingType.richText,
        name: "Thông báo cho khách khi hủy đơn hàng (Mobifone)",
        key: SettingKey.ORDER_CANCELED_CUSTOMER_MOBI_MSG,
        value: `[Thông báo tự động]
Đơn hàng {{order.code}} đã huỷ. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho chủ shop khi hủy đơn hàng (Tự huỷ)",
        key: SettingKey.ORDER_CANCELED_SELLER_MSG,
        value: `[Thông báo tự động]
Đơn hàng {{order.code}} đã huỷ. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho chủ shop khi hủy đơn hàng (Bán chéo)",
        key: SettingKey.ORDER_CANCELED_SELLER_CROSSSALE_MSG,
        value: `[Thông báo tự động]
Đơn hàng {{order.code}} đã huỷ. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đăng ký SMS cho khách hàng",
        key: SettingKey.SMS_COMPLETED_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động cho khách hàng]
Quý khách đăng ký SMS - mã số {{code}} thành công.
{{myPoint ? \`Điểm tích lũy quý khách nhận được là: \${$money(point)} điểm, tổng điểm hiện tại là \${$money(myPoint)} điểm.\`: \`\` }}
Cảm ơn quý khách đã sử dụng dịch vụ.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đăng ký SMS cho mobifone",
        key: SettingKey.SMS_COMPLETED_MSG_FOR_MOBIFONE,
        value: `[Thông báo tự động cho Mobifone]
Khách hàng {{registerName}} đăng ký SMS - mã số {{code}} thành công.
{{commission ? \`Hoa hồng mobifone nhận được là: \${$money(commission)} đồng.\`: \`\`  }}
`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đăng ký SMS cho seller",
        key: SettingKey.SMS_COMPLETED_MSG_FOR_SELLER,
        value: `[Thông báo tự động cho chủ shop]
Khách hàng {{registerName}} đăng ký SMS - mã số {{code}} thành công.
{{myCommission ? \`Hoa hồng bạn nhận được là: \${$money(commission)} đồng, tổng hoa hồng hiện tại là \${$money(myCommission)} điểm.\`: \`\`  }}
{{myPoint ? \`Điểm tích lũy shop nhận được là: \${$money(point)} điểm, tổng điểm hiện tại là \${$money(myPoint)} điểm.\`: \`\` }}
`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi nhận hoa hồng người giới thiệu từ SMS",
        key: SettingKey.SMS_COMMISSION_MSG_FOR_PRESENTER,
        value: `[Thông báo tự động cho thành viên]
Chủ shop {{shopper.shopName}} do bạn giới thiệu đã được duyệt thành công đơn đăng ký SMS {{code}}.
Hoa hồng bạn nhận được là: {{$money(commission)}} đồng, tổng hoa hồng hiện tại là {{$money(myCommission)}} đồng.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi hủy đăng ký SMS",
        key: SettingKey.SMS_CANCELED_MSG,
        value: `[Thông báo tự động cho khách hàng]
Quý khách đăng ký SMS - mã số {{code}} bị từ chối do không hợp lệ.
Cảm ơn quý khách đã sử dụng dịch vụ.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo duyệt đăng ký dịch vụ cho khách hàng",
        key: SettingKey.REGIS_SERVICE_COMPLETED_MSG_CUSTOMER,
        value: `[Thông báo tự động cho khách hàng]
Quý khách đăng ký dịch vụ - mã số {{code}} thành công.
{{point ? \`Điểm tích lũy quý khách nhận được là: \${$money(point)} điểm, tổng điểm hiện tại là \${$money(myPoint)} điểm.\`: \`\` }}
Cảm ơn quý khách đã sử dụng dịch vụ.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      ///////////////////////////////////////////////////////////
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đăng ký dịch vụ cho mobifone",
        key: SettingKey.REGIS_SERVICE_COMPLETED_MSG_MOBIFONE,
        value: `[Thông báo tự động cho Mobifone]
Khách hàng {{registerName}} đăng ký dịch vụ - mã số {{code}} thành công.
{{commission ? \`Hoa hồng mobifone nhận được là: \${$money(commission)} đồng.\`: \`\`  }}
`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi duyệt đăng ký dịch vụ cho seller",
        key: SettingKey.REGIS_SERVICE_COMPLETED_MSG_SELLER,
        value: `[Thông báo tự động cho chủ shop]
Khách hàng {{registerName}} đăng ký dịch vụ - mã số {{code}} thành công.
{{commission ? \`Hoa hồng bạn nhận được là: \${$money(commission)} đồng, tổng hoa hồng hiện tại là \${$money(myCommission)} điểm.\`: \`\`  }}
{{point ? \`Điểm tích lũy shop nhận được là: \${$money(point)} điểm, tổng điểm hiện tại là \${$money(myPoint)} điểm.\`: \`\` }}
`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khi nhận hoa hồng người giới thiệu từ đăng ký dịch vụ",
        key: SettingKey.REGIS_SERVICE_COMMISSION_MSG_FOR_PRESENTER,
        value: `[Thông báo tự động cho thành viên]
Chủ shop {{shopper.shopName}} do bạn giới thiệu đã được duyệt thành công đơn đăng ký dịch vụ {{code}}.
Hoa hồng bạn nhận được là: {{$money(commission)}} đồng, tổng hoa hồng hiện tại là {{$money(myCommission)}} đồng.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      //////////////////////////////////////////////////////////
      {
        type: SettingType.richText,
        name: "Thông báo khi hủy đăng ký dịch vụ",
        key: SettingKey.REGIS_SERVICE_CANCELED_MSG,
        value: `[Thông báo tự động cho khách hàng]
Quý khách đăng ký dịch vụ - mã số {{code}} bị từ chối do không hợp lệ.
Cảm ơn quý khách đã sử dụng dịch vụ.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      //////////////////////////////////////////////////////////
      // LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_MOBIFONE = "LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_MOBIFONE",
      // LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_CUSTOMER = "LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_CUSTOMER",
      // LUCKYWHEEL_WIN_PRESENT_MSG_FOR_MOBIFONE = "LUCKYWHEEL_WIN_PRESENT_MSG_FOR_MOBIFONE",
      // LUCKYWHEEL_WIN_PRESENT_MSG_FOR_CUSTOMER = "LUCKYWHEEL_WIN_PRESENT_MSG_FOR_CUSTOMER",
      {
        type: SettingType.richText,
        name: "Thông báo khách hàng trúng thưởng [Điểm thưởng] cho Mobifone",
        key: SettingKey.LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_MOBIFONE,
        value: `[Thông báo tự động khách hàng trúng thưởng cho Mobifone]
Khách hàng {{tenKhachHang}} đã trúng thưởng [{{diem}} điểm] sau khi quay vòng quay {{maVongQuay}}.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khách hàng trúng thưởng [Hiện vật] cho Mobifone",
        key: SettingKey.LUCKYWHEEL_WIN_PRESENT_MSG_FOR_MOBIFONE,
        value: `[Thông báo tự động khách hàng trúng thưởng cho Mobifone]
Quý khách {{tenKhachHang}} đã trúng thưởng [{{tenQua}} - {{maQua}}] sau khi quay vòng quay {{maVongQuay}}.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo khách hàng trúng thưởng [Hiện vật] cho Mobifone",
        key: SettingKey.LUCKYWHEEL_WIN_EVOUCHER_MSG_FOR_MOBIFONE,
        value: `[Thông báo tự động khách hàng trúng thưởng cho Mobifone]
Quý khách {{tenKhachHang}} đã trúng thưởng [{{tenQua}} - {{maQua}}] sau khi quay vòng quay {{maVongQuay}}. Chi tiết voucher : {{chiTiet}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng trúng thưởng [Điểm thưởng] vòng quay may mắn",
        key: SettingKey.LUCKYWHEEL_WIN_CUMMULATIVE_POINT_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động cho khách hàng]
Quý khách đã may mắn trúng thưởng [{{diem}} điểm] - mã quà [{{maQua}}] sau khi quay vòng quay {{maVongQuay}}. 
Điểm tích lũy hiện tại của quý khách là {{tongDiem}} điểm.
Cảm ơn quý khách đã tham gia chương trình.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng trúng thưởng [Hiện vật] vòng quay may mắn",
        key: SettingKey.LUCKYWHEEL_WIN_PRESENT_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động cho khách hàng]
Quý khách đã may mắn trúng giải thưởng [{{tenQua}} - MS:{{maQua}}] sau khi quay vòng quay {{maVongQuay}}.
Chi tiết - {{chiTiet}} 
Cảm ơn quý khách đã tham gia chương trình.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng trúng thưởng [Voucher] vòng quay may mắn",
        key: SettingKey.LUCKYWHEEL_WIN_EVOUCHER_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động cho khách hàng]
Quý khách đã may mắn trúng giải thưởng [{{tenQua}}] sau khi quay vòng quay {{maVongQuay}}.
Mã voucher - {{chiTiet}}
Cảm ơn quý khách đã tham gia chương trình.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng thua vòng quay may mắn",
        key: SettingKey.LUCKYWHEEL_LOSE_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động cho khách hàng]
Cảm ơn quý khách đã tham gia vòng quay {{maVongQuay}}.
Chúc quý khách may mắn lần sau.
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo mở đầu chiến dịch cho điểm bán",
        key: SettingKey.CAMPAIGN_HEADER_MSG_FOR_SHOPPER,
        value: `[Thông tin chiến dịch]
Quý khách vui lòng sử dụng hình ảnh và nội dung content mà công ty cung cấp để chia sẻ.

* Lưu ý đường link đính kèm phải đăng chính xác và không được thay đổi.
`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo hình ảnh chiến dịch cho điểm bán",
        key: SettingKey.CAMPAIGN_IMAGE_MSG_FOR_SHOPPER,
        value: `{{campaignImage}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo nội dung chiến dịch cho điểm bán",
        key: SettingKey.CAMPAIGN_CONTENT_MSG_FOR_SHOPPER,
        value: `{{campaign.name}}
{{campaign.content}}
        
Link đăng ký: 
{{affiliateLink}}

{{campaign.hashtags.toString().replace(',', ' ')}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.KICH_BAN_BAT_DAU,
    name: "Kịch bản bắt đầu",
    desc: "Các kịch bản mặc định khi kết nối Fanpage",
    readOnly: true,
    settings: [
      {
        type: SettingType.string,
        name: "Tên kịch bản",
        key: SettingKey.STORY_NAME,
        value: `Bắt đầu cửa hàng AShop`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Từ khoá đường dẫn mở kích bản",
        key: SettingKey.STORY_REF,
        value: `modauashop`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Tin nhắn",
        key: SettingKey.STORY_MESSAGE,
        value: `Nhấp vào "Cửa hàng" để vào cửa hàng AShop`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Tiêu đề nút",
        key: SettingKey.STORY_BTN_TITLE,
        value: `Cửa hàng`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Đường dẫn cửa hàng",
        key: SettingKey.WEBAPP_DOMAIN,
        value: `https://mb-ashop-web.web.app`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Đường dẫn quản trị hệ thống",
        key: SettingKey.ADMIN_DOMAIN,
        value: `https://mb-ashop.web.app`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Đường dẫn quản trị hệ thống",
        key: SettingKey.APP_DOMAIN,
        value: `https://mb-ashop.mcom.app`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_VAN_CHUYEN,
    name: "Cấu hình vận chuyển",
    desc: "Cấu hình thông số vận chuyển",
    readOnly: true,
    settings: [
      {
        type: SettingType.boolean,
        name: "Bật giao hàng VNPost",
        key: SettingKey.DELIVERY_ENABLED_VNPOST,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "Bật tự liên hệ",
        key: SettingKey.DELIVERY_ENABLED_CONTACT,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Phí ship nhận hàng tại chi nhánh",
        key: SettingKey.DELIVERY_POST_FEE,
        value: 0,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Phí ship đặt hàng mặc định",
        key: SettingKey.DELIVERY_ORDER_SHIP_FEE,
        value: 0,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "Bật tự động duyệt đơn khi giao hàng thành công",
        key: SettingKey.DELIVERY_ENABLED_AUTO_APPROVE_ORDER,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "Bật đồng giá phí vận chuyển nội thành",
        key: SettingKey.DELIVERY_ENABLED_DONG_GIA,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: `Dịch vụ chuyển phát mặc định ${DeliveryServices.map(
          (s) => s.code + "-" + s.name
        ).join("|")}`,
        key: SettingKey.VNPOST_DEFAULT_SHIP_SERVICE_METHOD_CODE,
        value: ServiceCode.BK,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      // DELIVERY_STATUS_CUSTOMER_ALERT = "DELIVERY_STATUS_CUSTOMER_ALERT",
      // DELIVERY_COMPLETED_MSG_FOR_CUSTOMER = "DELIVERY_COMPLETED_MSG_FOR_CUSTOMER",
      // DELIVERY_FAILURE_MSG_FOR_CUSTOMER = "DELIVERY_FAILURE_MSG_FOR_CUSTOMER",
      // DELIVERY_PENDING_MSG_FOR_CUSTOMER = "DELIVERY_PENDING_MSG_FOR_CUSTOMER",
      {
        type: SettingType.boolean,
        name: `Thông báo tình trạng vận đơn cho khách hàng`,
        key: SettingKey.DELIVERY_STATUS_CUSTOMER_ALERT,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: `Thông báo tình trạng vận đơn cho chủ shop`,
        key: SettingKey.DELIVERY_STATUS_MEMBER_ALERT,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng khi đơn hàng đang giao",
        key: SettingKey.DELIVERY_PENDING_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động dành cho khách hàng]
Đơn hàng {{order.code}} đang được giao. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng khi vận đơn thất bại",
        key: SettingKey.DELIVERY_FAILURE_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động dành cho khách hàng]
Đơn hàng {{order.code}} đã giao thất bại. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho khách hàng khi vận đơn thành công",
        key: SettingKey.DELIVERY_COMPLETED_MSG_FOR_CUSTOMER,
        value: `[Thông báo tự động dành cho khách hàng]
Đơn hàng {{order.code}} đã được giao thành công. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },

      ///
      // DELIVERY_COMPLETED_MSG_FOR_MEMBER = "DELIVERY_COMPLETED_MSG_FOR_MEMBER",
      // DELIVERY_FAILURE_MSG_FOR_MEMBER = "DELIVERY_FAILURE_MSG_FOR_MEMBER",
      // DELIVERY_PENDING_FOR_MEMBER = "DELIVERY_PENDING_FOR_MEMBER",

      {
        type: SettingType.richText,
        name: "Thông báo cho cửa hàng khi đơn hàng đang giao",
        key: SettingKey.DELIVERY_PENDING_MSG_FOR_MEMBER,
        value: `[Thông báo tự động dành cho cửa hàng]
Đơn hàng {{order.code}} đang được giao. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho cửa hàng khi vận đơn thất bại",
        key: SettingKey.DELIVERY_FAILURE_MSG_FOR_MEMBER,
        value: `[Thông báo tự động dành cho cửa hàng]
Đơn hàng {{order.code}} đã giao thất bại. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Thông báo cho cửa hàng khi vận đơn thành công",
        key: SettingKey.DELIVERY_COMPLETED_MSG_FOR_MEMBER,
        value: `[Thông báo tự động dành cho cửa hàng]
Đơn hàng {{order.code}} đã được giao thành công. Thông tin đơn hàng:
+ Danh sách sản phẩm: 
{{orderItems.map(i=>\`🛒\${i.productName} x \${i.qty}: \${$money(i.amount)}đ\`).join('\\n')}}
+ Tổng hóa đơn: {{$money(order.amount)}}đ
+ Thông tin khách hàng: {{order.buyerName}} - {{order.buyerPhone}}
+ Thông tin shop bán hàng: {{seller.shopName}}
Nếu quý khách có thắc mắc vui lòng liên hệ vào số hotline 999 của Bưu điện thành phố Hồ Chí Minh để được hỗ trợ chi tiết.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Nhãn tự liên hệ",
        key: SettingKey.DELIVERY_NONE_LABEL,
        value: `Tự liên hệ`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Nhãn nhận hàng tại cửa hàng",
        key: SettingKey.DELIVERY_POST_LABEL,
        value: `Nhận hàng tại cửa hàng`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Nhãn giao hàng tại địa chỉ",
        key: SettingKey.DELIVERY_VNPOST_LABEL,
        value: `Giao hàng tại địa chỉ`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "Tính khoảng cách bằng API GoongJS",
        key: SettingKey.DELIVERY_ESTIMATE_DISTANCE_BY_GOONGJS,
        value: false,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "GoongJS API Key",
        key: SettingKey.DELIVERY_GOONGJS_API_KEY,
        value: ``,
        isActive: true,
        isPrivate: true,
        isSecret: true,
        readOnly: false,
      },
    ],
  },
  //////////
  {
    slug: SettingGroupSlug.CAU_HINH_THONG_BAO_TONG_CUC,
    name: "Cấu hình thông báo tổng cục",
    desc: "Cấu hình thông báo tổng cục",
    readOnly: true,
    settings: [
      {
        type: SettingType.boolean,
        name: "Bật tắt thông báo đặt đơn hàng",
        key: SettingKey.POST_CREATE_ORDER_ALERT_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  ///
  {
    slug: SettingGroupSlug.CAU_HINH_DASHBOARD,
    name: "Cấu hình Dashboard",
    desc: "Cấu hình Dashboard tổng cục và cửa hàng",
    readOnly: true,
    settings: [
      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Chủ shop - Bật tắt",
        key: SettingKey.OVERVIEW_SHOP_COUNT_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Chủ shop - Hiển thị",
        key: SettingKey.OVERVIEW_SHOP_COUNT_TITLE,
        value: "CHỦ SHOP",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Chi nhánh - Bật tắt",
        key: SettingKey.OVERVIEW_BRANCH_COUNT_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Chi nhánh - Hiển thị",
        key: SettingKey.OVERVIEW_BRANCH_COUNT_TITLE,
        value: "CHI NHÁNH",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Sale - Bật tắt",
        key: SettingKey.OVERVIEW_SALER_COUNT_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Sale - Hiển thị",
        key: SettingKey.OVERVIEW_SALER_COUNT_TITLE,
        value: "SALE",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Đại lý - Bật tắt",
        key: SettingKey.OVERVIEW_AGENCY_COUNT_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Đại lý - Hiển thị",
        key: SettingKey.OVERVIEW_AGENCY_COUNT_TITLE,
        value: "ĐẠI LÝ",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Khách hàng - Bật tắt",
        key: SettingKey.OVERVIEW_CUSTOMER_COUNT_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN HỆ THỐNG - Khách hàng - Hiển thị",
        key: SettingKey.OVERVIEW_CUSTOMER_COUNT_TITLE,
        value: "ĐẠI LÝ",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },

      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Bưu điện - Bật tắt",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_MOBIFONE_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Sản phẩm chính - Hiển thị",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_MOBIFONE_TITLE,
        value: "Sản phẩm chính",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },

      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Bán chéo - Bật tắt",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_CROSSSALE_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Bán chéo - Hiển thị",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_CROSSSALE_TITLE,
        value: "Bán chéo",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },

      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Bán lẻ - Bật tắt",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_RETAIL_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Bán lẻ - Hiển thị",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_RETAIL_TITLE,
        value: "Bán lẻ",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },

      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - SMS - Bật tắt",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_SMS_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - SMS - Hiển thị",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_SMS_TITLE,
        value: "SMS",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Dịch vụ - Bật tắt",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_SERVICE_ENABLED,
        value: true,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "THỐNG KÊ TỔNG QUAN SẢN PHẨM - Dịch vụ - Hiển thị",
        key: SettingKey.OVERVIEW_PRODUCT_COUNT_SERVICE_TITLE,
        value: "Dịch vụ khác",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      /// loai san pham
      {
        type: SettingType.string,
        name: "LOẠI THÀNH VIÊN - Cửa hàng",
        key: SettingKey.MEMBER_TYPE_BRANCH,
        value: "Cửa hàng",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "LOẠI THÀNH VIÊN - nhân viên",
        key: SettingKey.MEMBER_TYPE_SALE,
        value: "Nhân viên",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "LOẠI THÀNH VIÊN - điểm bán",
        key: SettingKey.MEMBER_TYPE_AGENCY,
        value: "Điểm bán",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_TRUYEN_THONG,
    name: "Cấu hình Truyền thông",
    desc: "Cấu hình Truyền thông",
    readOnly: true,
    settings: [
      {
        type: SettingType.string,
        name: "TOKEN Truy xuất thông tin tương tác của link",
        key: SettingKey.MEDIA_FACEBOOK_TOKEN,
        value: "",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_TIN_NHAN,
    name: "Cấu hình Tin Nhắn",
    desc: "Mẫu tin nhắn SMS tự động",
    readOnly: true,
    settings: [
      {
        type: SettingType.richText,
        name: "Tin xác nhận làm món",
        key: SettingKey.SMS_ORDER_CONFIRMED,
        value: `{{SHOP_NAME}} - Đơn hàng của bạn đã được cửa hàng tiếp nhận và đang làm món\nTheo doi don hang: {{DOMAIN}}/{{SHOP_CODE}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Tin huỷ đơn hàng",
        key: SettingKey.SMS_ORDER_CANCALED,
        value: `Đơn hàng của bạn đã được huỷ. Để đặt lại đơn hàng khác mời bạn bấm {{DOMAIN}}/{{SHOP_CODE}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Tin xác nhận đang giao hàng",
        key: SettingKey.SMS_DELIVERING,
        value: `{{SHOP_NAME}} - Đơn hàng của bạn đang trên đường giao tới. Bạn để ý điện thoại nhé. Xem thông tin đơn hàng tại đây: {{ORDER_LINK}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Tin cám ơn mời đánh giá",
        key: SettingKey.SMS_ORDER_COMPLETED,
        value: `{{SHOP_NAME}} - Cám ơn bạn đã sử dụng dịch vụ của chúng tôi. Mời bạn bấm: {{ORDER_LINK}} để đánh giá dịch vụ và tham gia các chương trình ưu đãi mới nhất.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Tin OTP đăng nhập",
        key: SettingKey.SMS_OTP,
        value: `{{SHOP_NAME}} - Mã OTP xác thực của bạn là: {{OTP}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Tin CTV đăng ký thành công",
        key: SettingKey.SMS_COL_REGIS_SUCCESS,
        value: `{{SHOP_NAME}} Chuc mung anh/chi da dang ky thanh cong CTV cua shop hay tham gia nhom zalo de duoc theo huong dan`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_DANG_KY_SHOP,
    name: "Cấu hình Đăng ký chủ shop",
    desc: "Thiết lập nội dung đăng ký≈",
    readOnly: true,
    settings: [
      {
        type: SettingType.string,
        name: "Tiêu đề Email thông báo được duyệt",
        key: SettingKey.EMAIL_REGIS_APPROVE_TITLE,
        value: `Tài khoản cửa hàng {{SHOP_NAME}} đã được kích hoạt.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Nội dung Email thông báo được duyệt",
        key: SettingKey.EMAIL_REGIS_APPROVE,
        value: `Tài khoản đăng nhập: {{USERNAME}}
Mật khẩu: {{PASSWORD}}
Trang quản lý: {{DASHBOARD_LINK}}
Tên cửa hàng: {{SHOP_NAME}}`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.string,
        name: "Tiêu đề Email thông báo bị từ chối",
        key: SettingKey.EMAIL_REGIS_REJECT_TITLE,
        value: `Đăng ký tài khoản cửa hàng {{SHOP_NAME}} bị từ chối.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        name: "Nội dung Email thông báo bị từ chối",
        key: SettingKey.EMAIL_REGIS_REJECT,
        value: `Tài khoản: {{USERNAME}}
Cửa hàng: {{SHOP_NAME}}
BỊ TỪ CHỐI.`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.boolean,
        name: "Cho phép đăng ký chủ shop",
        key: SettingKey.REGIS_ENABLE,
        value: true,
        isActive: true,
        isPrivate: false,
        readonly: false,
      },
      {
        type: SettingType.boolean,
        name: "Yêu cầu xét duyệt đăng ký",
        key: SettingKey.REGIS_REQUIRE_APPROVE,
        value: true,
        isActive: true,
        isPrivate: false,
        readonly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_CONG_TAC_VIEN,
    name: "Cấu hình Cộng tác viên",
    desc: "Thiết lập cộng tác viên",
    readOnly: true,
    settings: [
      {
        type: SettingType.richText,
        name: "Điều khoản đăng ký CTV",
        key: SettingKey.CTV_DIEU_KHOAN,
        value: ``,
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_THU_PHI,
    name: "Cấu hình Thu phí",
    desc: "Thiết lập dịch vụ thu phí",
    readOnly: true,
    settings: [
      {
        type: SettingType.number,
        name: "Thời gian dùng thử (ngày)",
        key: SettingKey.PLAN_FREE_PERIOD,
        value: 30,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Phi dịch vụ (gói tháng)",
        key: SettingKey.PLAN_MONTH_FEE,
        value: 500000,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Phi dịch vụ (gói năm)",
        key: SettingKey.PLAN_YEAR_FEE,
        value: 1000000,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Phí dịch vụ (gói cơ bản)",
        key: SettingKey.PLAN_BASIC_FEE,
        value: 397000,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Phi dịch vụ (gói chuyên gia)",
        key: SettingKey.PLAN_PROFESSIONAL_FEE,
        value: 697000,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        name: "Thời gian cắt dịch vụ (ngày)",
        key: SettingKey.PLAN_STOP_PERIOD,
        value: 30,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_MOMO,
    name: "Cấu hình Momo",
    desc: "Thiết lập Momo",
    readOnly: true,
    settings: [
      {
        type: SettingType.richText,
        name: "Nội dung điều khoản dành cho chủ shop",
        key: SettingKey.MOMO_DIEU_KHOAN,
        value: "",
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_LANDING_PAGE,
    name: "Cấu hình Landing Page",
    desc: "Thiết lập Landing Page",
    readOnly: true,
    settings: [
      {
        type: SettingType.array,
        name: "Danh sâch case study",
        key: SettingKey.LP_CASE_STUDY,
        value: ["https://placekitten.com/300"],
        isActive: true,
        isPrivate: false,
        readOnly: false,
      },
    ],
  },
  {
    slug: SettingGroupSlug.CAU_HINH_TAI_KHOAN,
    name: "Cấu hình Tài khoản",
    desc: "Thiết lập Tài khoản",
    readOnly: true,
    settings: [
      {
        type: SettingType.string,
        key: SettingKey.ACCOUNT_RESET_PWD_EMAIL_TITLE,
        name: "Tiêu đề email khôi phục mật khẩu",
        value: "SOM - Yêu cầu Khôi phục mật khẩu",
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.richText,
        key: SettingKey.ACCOUNT_RESET_PWD_EMAIL_CONTENT,
        name: "Nội dung email khôi phục mật khẩu",
        value: `<h1>Yêu cầu khôi phục mật khẩu</h1><p>Hãy nhập vào đường dẫn sau để khổi phục mật khẩu:</p><p><a href="{{reset_pwd_url}}">{{reset_pwd_url}}</a></p>`,
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
      {
        type: SettingType.number,
        key: SettingKey.ACCOUNT_RESET_PWD_EXPIRE_SECONDS,
        name: "Thời gian hết hạn khôi phục mật khẩu (giây)",
        value: 3600, // 1 hour
        isActive: true,
        isPrivate: true,
        readOnly: false,
      },
    ],
  },
];
