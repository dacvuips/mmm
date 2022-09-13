import axios from "axios";
import _ from "lodash";
import { IMember } from "../../graphql/modules/member/member.model";
import { IOrder } from "../../graphql/modules/order/order.model";
import { IOrderItem } from "../../graphql/modules/orderItem/orderItem.model";
import { IShopBranch } from "../../graphql/modules/shop/shopBranch/shopBranch.model";
import cache from "../../helpers/cache";

export namespace PrintCommon {
  export type PrintContext = {
    input: {
      [x: string]: any;
    };
    meta: {
      [x: string]: any;
      seller?: IMember;
      order?: IOrder;
      orderItems?: IOrderItem[];
      shopBranch?: IShopBranch;
    };
  };
  export async function getImageBase64FromUrl(url: any) {
    if (!/(jpg|png|jpeg)$/.test(url)) return null;

    const key = `base64-image:${url}`;
    let result = await cache.get(key);
    if (_.isEmpty(result) == false) return result;

    const image = await axios.get(url, { responseType: "arraybuffer" });
    result = "data:image/png;base64," + Buffer.from(image.data).toString("base64");

    await cache.set(key, result, 60 * 10); // Cache trong 10 phút
    return result;
  }
  export function dividerCell({
    colSpan,
    color = "black",
    width = 1,
  }: {
    colSpan?: number;
    color?: string;
    width?: number;
  }) {
    return {
      colSpan: colSpan,
      table: {
        widths: ["*"],
        body: [[{ border: [false, false, false, true], text: "" }]],
      },
      layout: {
        hLineColor: () => color,
        hLineWidth: () => width,
      },
    };
  }
}
