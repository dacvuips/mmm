import {
  FaEquals,
  FaGreaterThan,
  FaGreaterThanEqual,
  FaLessThan,
  FaLessThanEqual,
  FaNotEqual,
} from "react-icons/fa";

export const OPERATOR_ICONS = {
  $eq: <FaEquals />,
  $ne: <FaNotEqual />,
  $lt: <FaLessThan />,
  $lte: <FaLessThanEqual />,
  $gt: <FaGreaterThan />,
  $gte: <FaGreaterThanEqual />,
};

export const NUMBER_OPERATORS: Option[] = [
  { value: "$lt", label: "< (Nhỏ hơn)" },
  { value: "$lte", label: "≤ (Nhỏ hơn hoặc bằng)" },
  { value: "$gt", label: "> (Lớn hơn)" },
  { value: "$gte", label: "≥ (Lớn hơn hoặc bằng)" },
  { value: "$eq", label: "= (Bằng)" },
  { value: "$ne", label: "≠ (Khác)" },
];

export const SELECT_OPERATORS: Option[] = [
  { value: "$eq", label: "Là" },
  { value: "$ne", label: "Không là" },
];

export const RANK_OPERATORS: Option[] = [
  { value: "$lt", label: "Thấp hơn" },
  { value: "$lte", label: "Thấp hơn hoặc cùng" },
  { value: "$gt", label: "Cao hơn" },
  { value: "$gte", label: "Cao hơn hoặc cùng" },
  { value: "$eq", label: "Thuộc" },
  { value: "$ne", label: "Khác" },
];

export const DATE_OPERATORS: Option[] = [
  { value: "$eq", label: "Vào ngày" },
  { value: "$ne", label: "Khác ngày" },
  { value: "$lt", label: "Trước ngày" },
  { value: "$lte", label: "Trước hoặc cùng ngày" },
  { value: "$gt", label: "Sau ngày" },
  { value: "$gte", label: "Sau hoặc cùng ngày" },
];

export interface ConditionResource {
  label: string;
  resource: string;
  comparisons?: Option[];
  options?: Option[];
  optionsPromise?: () => Promise<Option[]>;
  hasTimeConstraints?: boolean;
  isNumber?: boolean;
  isDate?: boolean;
  isBoolean?: boolean;
  isRank?: boolean;
  isAddress?: boolean;
  isTransType?: boolean;
  isText?: boolean;
}

export const DATE_OPTIONS: Option[] = [
  { value: "static", label: "Ngày cố định" },
  { value: "before", label: "Trước ngày" },
  { value: "before-equal", label: "Trước hoặc cùng ngày" },
  { value: "after", label: "Sau ngày" },
  { value: "after-equal", label: "Sau hoặc cùng ngày" },
  { value: "range", label: "Khoảng thời gian" },
];

export const PERIOD_OPTIONS: Option[] = [
  { value: "D", label: "Ngày" },
  { value: "W", label: "Tuần" },
  { value: "M", label: "Tháng" },
];

export const TEXT_OPTIONS: Option[] = [
  { value: "startsWith", label: "bắt đầu với" },
  { value: "notStartsWith", label: "không bắt đầu với" },
  { value: "contains", label: "chứa" },
  { value: "equals", label: "là" },
  { value: "unequals", label: "không là" },
];
