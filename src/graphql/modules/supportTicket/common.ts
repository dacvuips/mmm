export enum SupportTicketStatus {
  opening = "opening", // Yêu cầu mới
  pending = "pending", // Chờ xử lý
  processing = "processing", // Đang xử lý
  closed = "closed", // Đã đóng
}
export enum SupportTicketSubStatus {
  // opening
  new = "new", // Mới tạo
  reopening = "reopening", // Mở lại
  // pending
  considering = "considering", // Đang xem xét
  assigning = "assigning", // Đang bàn giao
  // processing
  request_more_info = "request_more_info", // Yêu cầu thêm thông tin
  info_completed = "info_completed", // Đã bổ sung thông tin
  // closed
  completed = "completed", // Hoàn thành
  canceled = "canceled", // Đã huỷ
}
