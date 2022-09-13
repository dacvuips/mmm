export function convertPhone(phone: string, prefix = "+84") {
  const txt = "" + phone;
  return prefix + txt.trim().replace(/^84/, "").replace(/^\+84/, "").replace(/^0/, "");
}

export function isVietnamesePhoneNumber(number: string) {
  return /^\+84(3|5|7|8|9|1[2|6|8|9])+([0-9]{8})\b/.test(number);
}
