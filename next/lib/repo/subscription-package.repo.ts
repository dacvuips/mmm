import { BaseModel, CrudRepository } from "./crud.repo";

export interface SubscriptionPackage extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  name: string;
  desc: string;
  sellPrice: number;
  basePrice: number;
  features: PackageFeature[];
  url: string;
  month: number;
  active: boolean;
}
export interface PackageFeature {
  name: string;
}
export class SubscriptionPackageRepository extends CrudRepository<SubscriptionPackage> {
  apiName: string = "SubscriptionPackage";
  displayName: string = "gói dịch vụ";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    name: String
    desc: String
    sellPrice: Float
    basePrice: Float
    features{
      name: String
    }: [PackageFeature]
    url: String
    month: Int
    active: Boolean
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  code: String
  name: String
  desc: String
  sellPrice: Float
  basePrice: Float
  features{
    name: String
  }: [PackageFeature]
  url: String
  month: Int
  active: Boolean
  `);
}

export const SubscriptionPackageService = new SubscriptionPackageRepository();

export const SubscriptionPackage_STATUS: Option[] = [
  { value: "ONLINE", label: "Online", color: "success" },
  { value: "OFFLINE", label: "Offline", color: "slate" },
  { value: "ACCEPTED", label: "Nhận hàng", color: "orange" },
  { value: "DELIVERING", label: "Giao hàng", color: "purple" },
];
