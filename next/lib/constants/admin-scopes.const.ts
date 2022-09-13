import { AdminScope } from "../repo/user.repo";

export type AdminPermission =
  | "READ_USERS"
  | "WRITE_USERS"
  | "READ_MEMBERS"
  | "WRITE_MEMBERS"
  | "EXECUTE_MEMBERS"
  | "READ_CUSTOMERS"
  | "WRITE_CUSTOMERS"
  | "READ_ORDERS"
  | "EXECUTE_ORDERS"
  | "READ_COLLABORATORS"
  | "EXECUTE_COLLABORATORS"
  | "READ_VOUCHERS"
  | "WRITE_VOUCHERS"
  | "EXECUTE_VOUCHERS"
  | "READ_SHOP_CATEGORIES"
  | "WRITE_SHOP_CATEGORIES"
  | "READ_BANNERS"
  | "WRITE_BANNERS"
  | "READ_REGISTRATIONS"
  | "EXECUTE_REGISTRATIONS"
  | "READ_REPORTS"
  | "READ_WITHDRAW_REQUESTS"
  | "EXECUTE_WITHDRAW_REQUESTS"
  | "READ_GENERAL_CONFIG"
  | "WRITE_GENERAL_CONFIG"
  | "READ_FEEDS"
  | "WRITE_FEEDS"
  | "READ_POSTS"
  | "WRITE_POSTS"
  | "READ_CUSTOMERS_CONTACT"
  | "READ_NOTIFICATIONS"
  | "WRITE_NOTIFICATIONS"
  | "READ_TICKETS"
  | "EXECUTE_TICKETS"
  | "READ_CHAT"
  | "EXECUTE_CHAT"
  ;

export const PERMISSIONS: Option<AdminPermission>[] = [
  { value: "READ_USERS", label: "Xem tài khoản" },
  { value: "WRITE_USERS", label: "Sửa tài khoản" },

  { value: "READ_MEMBERS", label: "Xem thành viên" },
  { value: "WRITE_MEMBERS", label: "Sửa thành viên" },
  { value: "EXECUTE_MEMBERS", label: "Xử lý thành viên" },

  { value: "READ_CUSTOMERS", label: "Xem khách hàng" },
  { value: "WRITE_CUSTOMERS", label: "Sửa khách hàng" },

  { value: "READ_ORDERS", label: "Xem đơn hàng" },
  { value: "EXECUTE_ORDERS", label: "Xử lý đơn hàng" },

  { value: "READ_COLLABORATORS", label: "Xem cộng tác viên" },
  { value: "EXECUTE_COLLABORATORS", label: "Xử lý cộng tác viên" },

  { value: "READ_VOUCHERS", label: "Xem khuyến mãi" },
  { value: "WRITE_VOUCHERS", label: "Sửa khuyến mãi" },
  { value: "EXECUTE_VOUCHERS", label: "Xử lý khuyến mãi" },

  { value: "READ_SHOP_CATEGORIES", label: "Xem danh mục cửa hàng" },
  { value: "WRITE_SHOP_CATEGORIES", label: "Sửa danh mục cửa hàng" },

  { value: "READ_BANNERS", label: "Xem banner" },
  { value: "WRITE_BANNERS", label: "Sửa banner" },

  { value: "READ_REGISTRATIONS", label: "Xem đăng ký" },
  { value: "EXECUTE_REGISTRATIONS", label: "Xử lý đăng ký" },

  { value: "READ_REPORTS", label: "Xem báo cáo" },

  { value: "READ_WITHDRAW_REQUESTS", label: "Xem yêu cầu rút tiền" },
  { value: "EXECUTE_WITHDRAW_REQUESTS", label: "Xử lý yêu cầu rút tiền" },

  { value: "READ_GENERAL_CONFIG", label: "Xem cấu hình chung" },
  { value: "WRITE_GENERAL_CONFIG", label: "Sửa cấu hình chung" },

  { value: "READ_FEEDS", label: "Xem bài đăng" },
  { value: "WRITE_FEEDS", label: "Sửa bài đăng" },

  { value: "READ_POSTS", label: "Xem tin tức" },
  { value: "WRITE_POSTS", label: "Sửa tin tức" },

  { value: "READ_CUSTOMERS_CONTACT", label: "Xem tư vấn khách hàng" },

  { value: "READ_NOTIFICATIONS", label: "Xem thông báo" },
  { value: "WRITE_NOTIFICATIONS", label: "Sửa thông báo" },

  { value: "READ_TICKETS", label: "Xem yêu cầu hỗ trợ" },
  { value: "EXECUTE_TICKETS", label: "Xử lý yêu cầu hỗ trợ" },

  { value: "READ_CHAT", label: "Xem chat" },
  { value: "EXECUTE_CHAT", label: "Xử lý chat" },

];

export type ScopeAdminPermission = boolean | "partial";


const getScopeStates = (state: ScopeAdminPermission): { [P in AdminPermission]: ScopeAdminPermission } => {
  const permissions = {};
  for (let permission of PERMISSIONS) {
    permissions[permission?.value] = state;
  }
  return permissions as { [P in AdminPermission]: ScopeAdminPermission };
}

export const ADMIN_SCOPE_PERMISSIONS: Partial<
  { [S in AdminScope]: { [P in AdminPermission]: ScopeAdminPermission } }
> = {
  ADMIN: {
    ...getScopeStates(true),
  },
  OPERATOR: {
    ...getScopeStates(true),
    WRITE_USERS: false,
    WRITE_CUSTOMERS: false,
    EXECUTE_ORDERS: false,
    EXECUTE_COLLABORATORS: false,
    WRITE_VOUCHERS: false,
    EXECUTE_VOUCHERS: false,
    READ_GENERAL_CONFIG: false,
    WRITE_GENERAL_CONFIG: false,
    WRITE_NOTIFICATIONS: false,
  },
  USER: {
    ...getScopeStates(false),
    READ_MEMBERS: true,
    READ_CUSTOMERS: true,
    READ_ORDERS: true,
    READ_COLLABORATORS: true,
    READ_VOUCHERS: true,
    READ_REGISTRATIONS: true,
    READ_FEEDS: true,
    READ_POSTS: true,
    WRITE_POSTS: true,
    READ_CUSTOMERS_CONTACT: true,
    READ_TICKETS: true,
    EXECUTE_TICKETS: true,
    READ_CHAT: true,
    EXECUTE_CHAT: true,
  },
  VIEWER: {
    ...getScopeStates(false),
    READ_USERS: true,
    READ_MEMBERS: true,
    READ_CUSTOMERS: true,
    READ_ORDERS: true,
    READ_COLLABORATORS: true,
    READ_VOUCHERS: true,
    READ_SHOP_CATEGORIES: true,
    READ_BANNERS: true,
    READ_REGISTRATIONS: true,
    READ_REPORTS: true,
    READ_WITHDRAW_REQUESTS: true,
    READ_FEEDS: true,
    READ_POSTS: true,
    READ_CUSTOMERS_CONTACT: true,
    READ_NOTIFICATIONS: true,
    READ_TICKETS: true,
    READ_CHAT: true,
  },
};
