import axios from "axios";
import { GetMemberToken, GetUserToken } from "../graphql/auth.link";
import { BaseModel, CrudRepository } from "./crud.repo";

export interface GlobalCustomer extends BaseModel {
  code: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  gender: string;
  birthday: Date;
  fullAddress: string;
  latitude: number;
  longitude: number;
  customerIds: string[];
}
export class GlobalCustomerRepository extends CrudRepository<GlobalCustomer> {
  apiName: string = "GlobalCustomer";
  displayName: string = "khách hàng hệ thống";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    code: String
    name: String
    phone: String
    email: String
    avatar: String
    gender: String
    birthday: DateTime
    fullAddress: String
    latitude: Float
    longitude: Float
    customerIds: [String]
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    code: String
    name: String
    phone: String
    email: String
    avatar: String
    gender: String
    birthday: DateTime
    fullAddress: String
    latitude: Float
    longitude: Float
    customerIds: [String]
  `);
}

export const GlobalCustomerService = new GlobalCustomerRepository();
