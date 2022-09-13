import { CustomerModel } from "./../../graphql/modules/customer/customer.model";
import { Request, Response } from "express";
import { GlobalCustomerModel } from "../../graphql/modules/customer/globalCustomer/globalCustomer.model";
import _ from "lodash";
export default [
  {
    method: "get",
    path: "/api/globalCustomer/globalCustomerConvert",
    midd: [],
    action: async (req: Request, res: Response) => {
      // get count phone
      const customerPhoneList: { _id: string; count: number }[] = await CustomerModel.aggregate([
        { $group: { _id: "$phone", count: { $sum: 1 } } },
      ]);

      customerPhoneList.forEach(async (row: { _id: string; count: number }) => {
        //find all duplicate by phone
        const listCustomer = await CustomerModel.find({ phone: row._id }).select(
          "phone name email avatar gender birthday fullAddress latitude longitude"
        );

        var longestKey = _.maxBy(listCustomer, function (o) {
          if (!["null", "Vãng Lai", "Khách vãng lai"].includes(o.name)) {
            return 10000; // if name != vãng lai thì chọn liền
          }
          return Object.keys(0).length;
        });

        let curGlobalCustomer = new GlobalCustomerModel();
        curGlobalCustomer.phone = longestKey.phone;
        curGlobalCustomer.name = longestKey.name;
        curGlobalCustomer.email = longestKey.email;
        curGlobalCustomer.avatar = longestKey.avatar;
        curGlobalCustomer.gender = longestKey.gender;
        curGlobalCustomer.birthday = longestKey.birthday;
        curGlobalCustomer.fullAddress = longestKey.fullAddress;
        curGlobalCustomer.latitude = longestKey.latitude;
        curGlobalCustomer.longitude = longestKey.longitude;

        listCustomer.forEach(async (customer) => {
          customer.globalCustomerId = curGlobalCustomer._id;
          curGlobalCustomer.customerIds.push(customer._id);
          await customer.save();
        });
        await curGlobalCustomer.save();
      });
      // console.log(customerPhoneList);
      return await res.json({ message: "OK" });
    },
  },
];
