import { BaseModel, CrudRepository } from "./crud.repo";
import { Order } from "./order.repo";

export interface Driver extends BaseModel {
  memberId: string;
  name: string;
  phone: string;
  avatar: string;
  licensePlates: string;
  status: string;
  isActive: boolean;
  orderIds: string[];
  orders: Order[];
  orderStats: DriverOrderStats;
}
export interface DriverOrderStats {
  shipfee: number;
  total: number;
  completed: number;
  failure: number;
}
export interface AhamovePromotion {
  id: string;
  desc: string;
  content: string;
  image: string;
  isHtmlContent: boolean;
  valid: boolean;
  discount: number;
  minItemFee: number;
  remainingUse: number;
}
export interface DeliveryService {
  shipMethod: string;
  serviceId: string;
  serviceName: string;
  iconUrl: string;
  duration: string;
  shipFee: number;
  discount: number;
}
export class DriverRepository extends CrudRepository<Driver> {
  apiName: string = "Driver";
  displayName: string = "tài xế";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    name: String
    phone: String
    avatar: String
    licensePlates: String
    status: string
    isActive: boolean
    orderStats {
      shipfee: number
      total: number
      completed: number
      failure: number
    }: DriverOrderStats
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    name: String
    phone: String
    avatar: String
    licensePlates: String
    status: string
    isActive: boolean
    orderStats {
      shipfee: number
      total: number
      completed: number
      failure: number
    }: DriverOrderStats
  `);

  async getAhamovePromotions(orderId: string) {
    return await this.query({
      query: `
        getAhamovePromotions(orderId: "${orderId}") {
          ${this.parseFragment(`
            id: String
            desc: String
            content: String
            image: String
            isHtmlContent: Boolean
            valid: Boolean
            discount: Float
            minItemFee: Float
            remainingUse: Float
          `)}
        }
      `,
    }).then((res) => res.data.g0 as AhamovePromotion[]);
  }

  async getAllDeliveryService(orderId: string, ahamovePromotionCode?: string) {
    return await this.query({
      query: `
        getAllDeliveryService(orderId: "${orderId}"${ahamovePromotionCode ? `, ahamovePromotionCode: "${ahamovePromotionCode}"` : ""
        }) {
          ${this.parseFragment(`
            shipMethod: String
            serviceId: String
            serviceName: String
            iconUrl: String
            duration: String
            shipFee: Float
            discount: Float
          `)}
        }
      `,
    }).then((res) => res.data.g0 as DeliveryService[]);
  }
}

export const DriverService = new DriverRepository();

export const DRIVER_STATUS: Option[] = [
  { value: "ONLINE", label: "Online", color: "success" },
  { value: "OFFLINE", label: "Offline", color: "slate" },
  { value: "ACCEPTED", label: "Nhận hàng", color: "orange" },
  { value: "DELIVERING", label: "Giao hàng", color: "purple" },
];

export type DriverType = "DRIVER" | "AHAMOVE";
export const DRIVER_TYPES: Option<DriverType>[] = [
  { value: "DRIVER", label: "Tài xế nội bộ" },
  { value: "AHAMOVE", label: "Tài xế Ahamove" },
];
