import { format } from "date-fns";
import vi from "date-fns/locale/vi";

export function parseQuery(
  data,
  { hasBraces, fileParam }: { hasBraces: boolean; fileParam?: string } = { hasBraces: false }
) {
  if (typeof data == "string") {
    if (data.match(/\n/g)) return `"""${data}"""`;
    else if (data.startsWith("$")) return data;
    else return `"${data}"`;
  } else if (typeof data == "object") {
    if (Array.isArray(data)) {
      let arr = [];
      for (let item of data) {
        if (item == undefined) continue;
        arr.push(parseQuery(item, { hasBraces: true }));
      }
      return `[${arr.join(", ")}]`;
    } else if (data instanceof Date) {
      return `"${data.toISOString()}"`;
    } else if (data instanceof File) {
      return `$${fileParam}`;
    } else {
      let props = [];
      for (let key in data) {
        if (data[key] == undefined) continue;
        props.push(`${key}: ${parseQuery(data[key], { hasBraces: true })}`);
      }
      return hasBraces ? `{ ${props.join(", ")} }` : `${props.join(", ")}`;
    }
  } else {
    return data;
  }
}

export function parseObjectToOptions(obj: any): Option[] {
  return Object.keys(obj).map((k) => ({ label: obj[k], value: k }));
}

export function parseOptionsToObject(options: Option[]): { [key: string]: Option } {
  return options.reduce((obj, item) => ({ ...obj, [item.value]: item }), {});
}

export const omitDeep = (obj: object, excludes: Array<number | string>): object => {
  for (const exclude of excludes) {
    delete obj[exclude];
  }
  if (typeof obj == "object") {
    Object.keys(obj).forEach((key) => {
      if (obj[key] === null || obj[key] === undefined) return;

      omitDeep(obj[key], excludes);
    });
  }
  return obj;
};

export function parseAddress(item: any, prefix: string = ""): string {
  let getPropName = (prop: string) =>
    prefix ? `${prefix}${prop[0].toUpperCase() + prop.slice(1)}` : prop;
  return [
    item[getPropName("address")],
    item[getPropName("ward")],
    item[getPropName("district")],
    item[getPropName("province")],
  ]
    .filter(Boolean)
    .join(", ");
}

export function parseNumber(
  value: any,
  currency: boolean | string = false,
  {
    compact = false,
    percent = false,
    signDisplay = "auto",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  }: Partial<{
    compact: boolean;
    percent: boolean;
    signDisplay: "auto" | "always" | "never";
    minimumFractionDigits: number;
    maximumFractionDigits: number;
  }> = {
    compact: false,
    percent: false,
    signDisplay: "auto",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }
) {
  // let price;
  // if (typeof value == "string") {
  //   price = Number(value);
  //   if (isNaN(price)) return value;
  // } else if (typeof value == "number") {
  //   price = value;
  // } else {
  //   return value;
  // }

  // let decimal = "comma";
  // let priceText: string = price.toLocaleString("en");
  // if (decimal == "comma") {
  //   priceText = priceText
  //     .replace(/,/g, ".")
  //     .replace(/\.(?=[^.]*$)/g, Number.isInteger(price) ? "." : ".");
  // }
  // priceText = priceText.concat(currency ? (typeof currency == "boolean" ? "đ" : currency) : "");
  // return priceText;

  if (isNaN(Number(value))) return "0";
  let number = new Intl.NumberFormat("vi-VN", {
    notation: compact ? "compact" : "standard",
    compactDisplay: "short",
    style: currency ? "currency" : percent ? "percent" : "decimal",
    currency: currency ? (typeof currency == "boolean" ? "VND" : currency) : undefined,
    currencyDisplay: "symbol",
    signDisplay,
    minimumFractionDigits,
    maximumFractionDigits,
  } as Intl.NumberFormatOptions).format(value);
  return number;
}

export function formatDate(
  date: string | Date,
  formatText: "date" | "time" | "datetime" | "year_month_date" | (string & {}) = "date"
): string {
  let formatString;
  switch (formatText) {
    case "date": {
      formatString = "dd-MM-yyyy";
      break;
    }
    case "time": {
      formatString = "HH:mm";
      break;
    }
    case "datetime": {
      formatString = "dd-MM-yyyy HH:mm";
      break;
    }
    case "year_month_date": {
      formatString = "yyyy-MM-dd";
      break;
    }
    default: {
      formatString = formatText;
      break;
    }
  }
  return date ? format(new Date(date), formatString, { locale: vi }) : "";
}
