import { StaffScope } from "../repo/staff.repo";

export type StaffPermission =
  | "OVERVIEW"
  | "READ_ORDERS"
  | "WRITE_ORDERS"
  | "EXECUTE_ORDERS"
  | "READ_BRANCHES"
  | "WRITE_BRANCHES"
  | "READ_TABLES"
  | "WRITE_TABLES"
  | "READ_PRODUCTS"
  | "WRITE_PRODUCTS"
  | "READ_TOPPINGS"
  | "WRITE_TOPPINGS"
  | "READ_VOUCHERS"
  | "WRITE_VOUCHERS"
  | "READ_CUSTOMERS"
  | "WRITE_CUSTOMERS"
  | "READ_DRIVERS"
  | "WRITE_DRIVERS"
  | "READ_STAFFS"
  | "WRITE_STAFFS"
  | "READ_COLLABORATORS"
  | "WRITE_COLLABORATORS"
  | "READ_COMMENTS"
  | "WRITE_COMMENTS"
  | "EXECUTE_COMMENTS"
  | "READ_WHEELS"
  | "WRITE_WHEELS"
  | "READ_WHEELS"
  | "WRITE_WHEELS"
  | "READ_REPORTS"
  | "READ_PAYMENT_HISTORY"
  | "READ_WALLET"
  | "EXECUTE_WALLET"
  | "READ_FEEDS"
  | "WRITE_FEEDS"
  | "READ_POSTS"
  | "WRITE_POSTS"
  | "READ_VIDEOS"
  | "WRITE_VIDEOS"
  | "READ_CONTACTS"
  | "READ_TRIGGERS"
  | "WRITE_TRIGGERS"
  | "READ_TICKETS"
  | "WRITE_TICKETS"
  | "READ_CLIENT_CHAT"
  | "EXECUTE_CLIENT_CHAT"
  | "READ_ADMIN_CHAT"
  | "EXECUTE_ADMIN_CHAT"
  | "READ_SETTINGS"
  | "WRITE_SETTINGS"
  ;

export const PERMISSIONS: Option<StaffPermission>[] = [
  { value: "OVERVIEW", label: "Xem tổng quan" },

  { value: "READ_ORDERS", label: "Xem đơn hàng" },
  { value: "WRITE_ORDERS", label: "Sửa đơn hàng" },
  { value: "EXECUTE_ORDERS", label: "Xử lý đơn hàng" },

  { value: "READ_BRANCHES", label: "Xem cửa hàng" },
  { value: "WRITE_BRANCHES", label: "Sửa cửa hàng" },

  { value: "READ_TABLES", label: "Xem bàn" },
  { value: "WRITE_TABLES", label: "Sửa bàn" },

  { value: "READ_PRODUCTS", label: "Xem món" },
  { value: "WRITE_PRODUCTS", label: "Sửa món" },

  { value: "READ_TOPPINGS", label: "Xem topping" },
  { value: "WRITE_TOPPINGS", label: "Sửa topping" },

  { value: "READ_VOUCHERS", label: "Xem khuyến mãi" },
  { value: "WRITE_VOUCHERS", label: "Sửa khuyến mãi" },

  { value: "READ_CUSTOMERS", label: "Xem khách hàng" },
  { value: "WRITE_CUSTOMERS", label: "Sửa khách hàng" },

  { value: "READ_DRIVERS", label: "Xem tài xế" },
  { value: "WRITE_DRIVERS", label: "Sửa tài xế" },

  { value: "READ_STAFFS", label: "Xem nhân viên" },
  { value: "WRITE_STAFFS", label: "Sửa nhân viên" },

  { value: "READ_COLLABORATORS", label: "Xem cộng tác viên" },
  { value: "WRITE_COLLABORATORS", label: "Sửa cộng tác viên" },

  { value: "READ_COMMENTS", label: "Xem bình luận" },
  { value: "WRITE_COMMENTS", label: "Sửa bình luận" },
  { value: "EXECUTE_COMMENTS", label: "Xử lý bình luận" },

  { value: "READ_WHEELS", label: "Xem vòng quay" },
  { value: "WRITE_WHEELS", label: "Sửa vòng quay" },

  { value: "READ_REPORTS", label: "Xem báo cáo" },
  { value: "READ_PAYMENT_HISTORY", label: "Xem lịch sử thanh toán" },

  { value: "READ_WALLET", label: "Xem ví tiền" },
  { value: "EXECUTE_WALLET", label: "Xử lý ví tiền" },

  { value: "READ_FEEDS", label: "Xem bài đăng" },
  { value: "WRITE_FEEDS", label: "Sửa bài đăng" },

  { value: "READ_POSTS", label: "Xem tin tức" },
  { value: "WRITE_POSTS", label: "Sửa tin tức" },

  { value: "READ_VIDEOS", label: "Xem video" },
  { value: "WRITE_VIDEOS", label: "Sửa video" },

  { value: "READ_CONTACTS", label: "Xem liên hệ" },

  { value: "READ_CLIENT_CHAT", label: "Xem chat khách hàng" },
  { value: "EXECUTE_CLIENT_CHAT", label: "Xử lý chat khách hàng" },

  { value: "READ_ADMIN_CHAT", label: "Xem chat admin" },
  { value: "EXECUTE_ADMIN_CHAT", label: "Xử lý chat quản trị" },

  { value: "READ_TRIGGERS", label: "Xem chiến dịch" },
  { value: "WRITE_TRIGGERS", label: "Sửa chiến dịch" },

  { value: "READ_SETTINGS", label: "Xem cài đặt" },
  { value: "WRITE_SETTINGS", label: "Sửa cài đặt" },

  { value: "READ_TICKETS", label: "Xem hỗ trợ" },
  { value: "WRITE_TICKETS", label: "Sửa hỗ trợ" },

];
export type ScopePermission = boolean | "partial";

const getScopeStates = (state: ScopePermission): { [P in StaffPermission]: ScopePermission } => {
  const permissions = {};
  for (let permission of PERMISSIONS) {
    permissions[permission?.value] = state;
  }
  return permissions as { [P in StaffPermission]: ScopePermission };
};

export const STAFF_SCOPE_PERMISSIONS: Partial<
  { [S in StaffScope]: { [P in StaffPermission]: ScopePermission } }
> = {
  ADMIN: {
    ...getScopeStates(true),
  },
  OPERATOR: {
    ...getScopeStates(true),
    WRITE_BRANCHES: false,
    READ_TABLES: false,
    WRITE_TABLES: false,
    WRITE_CUSTOMERS: false,
    WRITE_DRIVERS: false,
    READ_SETTINGS: false,
    WRITE_SETTINGS: false,
  },
  USER: {
    ...getScopeStates(false),
    READ_ORDERS: true,
    EXECUTE_ORDERS: "partial",
    READ_PRODUCTS: true,
    READ_TOPPINGS: true,
    READ_VOUCHERS: true,
    READ_CUSTOMERS: true,
    READ_DRIVERS: true,
    READ_COLLABORATORS: true,
    READ_COMMENTS: true,
    READ_WHEELS: true,
    READ_PAYMENT_HISTORY: true,
    READ_FEEDS: true,
    READ_POSTS: true,
    READ_VIDEOS: true,
    READ_CLIENT_CHAT: true,
    EXECUTE_CLIENT_CHAT: true,
    READ_TRIGGERS: true,
    READ_TICKETS: true,

  },
  VIEWER: {
    ...getScopeStates(false),
    OVERVIEW: true,
    READ_ORDERS: true,
    READ_BRANCHES: true,
    READ_TABLES: true,
    READ_PRODUCTS: true,
    READ_TOPPINGS: true,
    READ_VOUCHERS: true,
    READ_CUSTOMERS: true,
    READ_DRIVERS: true,
    READ_STAFFS: true,
    READ_COLLABORATORS: true,
    READ_COMMENTS: true,
    READ_WHEELS: true,
    READ_REPORTS: true,
    READ_PAYMENT_HISTORY: true,
    READ_FEEDS: true,
    READ_POSTS: true,
    READ_VIDEOS: true,
    READ_CONTACTS: true,
    READ_CLIENT_CHAT: true,
    READ_TRIGGERS: true,
    READ_TICKETS: true,
  },
};
