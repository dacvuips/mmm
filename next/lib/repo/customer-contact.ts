import { BaseModel, CrudRepository } from "./crud.repo";

export interface CustomerContact extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  message: string;
  status: CustomerContactStatus;
}
export class CustomerContactRepository extends CrudRepository<CustomerContact> {
  apiName: string = "CustomerContact";
  displayName: string = "khách hàng cần tư vấn";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  name: String
  companyName: String
  phone: String
  email: String
  address: String
  message: String
  status: String
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  name: String
  companyName: String
  phone: String
  email: String
  address: String
  message: String
  status: String
  `);
}

export const CustomerContactService = new CustomerContactRepository();

export type CustomerContactStatus = "pending" | "completed";
export const CUSTOMER_CONTACT_STATUS: Option[] = [
  { value: "pending", label: "Đang chờ", color: "warning" },
  { value: "completed", label: "Đã tư vấn", color: "success" },
];
