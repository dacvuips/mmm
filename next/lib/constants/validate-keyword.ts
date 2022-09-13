import KhongDau from "khong-dau";
export const BANNED_KEYWORDS = [
  "Ma túy",
  "Mai thúy",
  "Mại dâm",
  "Khiêu dâm",
  "Sex",
  "Sexy",
  "thuốc súng",
  "Súng đạn",
  "Đạn dược",
  "thuốc ngủ",
  "Thuốc an thần",
  "Đánh đập",
  "Đập đá",
  "xì ke",
  "Hút chích",
  "Hiv",
  "Đảng",
  "Cộng sản",
  "Chính quyền",
  "Chuyển khoản",
  "Ck",
  "Bank",
  "Ngân hàng",
  "Cmnd",
  "Cccd",
  "Đặt cọc",
  "Tạm ứng",
];
export const validateKeyword = (text?: string) => {
  let error = "";

  if (text) {
    for (const keyword of BANNED_KEYWORDS) {
      let keywordKhongDau = (keyword.includes(" ") ? KhongDau(keyword) : keyword)
        .trim()
        .toLowerCase();
      let textKhongDau = KhongDau(text).trim().toLowerCase();
      if (textKhongDau.includes(keywordKhongDau)) {
        return `Cụm từ "${keyword}" không được phép sử dụng`;
      }
    }
  }

  return error;
};
