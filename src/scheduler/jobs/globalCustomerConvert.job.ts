import { Job } from "agenda";
import moment from "moment-timezone";
import { Agenda } from "../agenda";
import {
  GlobalCustomerModel,
  IGlobalCustomer,
} from "../../graphql/modules/customer/globalCustomer/globalCustomer.model";
import { CustomerModel, ICustomer } from "../../graphql/modules/customer/customer.model";
import _ from "lodash";

export class GlobalCustomerConvertJob {
  static jobName = "GlobalCustomerConvert";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + GlobalCustomerConvertJob.jobName, moment().format());

    // [
    //   {
    //     "_id" : "0903123123",
    //     "data" : [
    //         {
    //             "_id" : ObjectId("6232b7abd6997399cca4257a"),
    //             "phone" : "0903123123",
    //             "name" : "abc"
    //         },
    //         {
    //             "_id" : ObjectId("62394be8d6997399cc3379a7"),
    //             "phone" : "0903123123",
    //             "name" : "abc",
    //             "fullAddress" : "12/17 Phan Đăng Lưu, Phường 7, Bình Thạnh, Thành phố Hồ Chí Minh, Việt Nam",
    //             "latitude" : 10.803637,
    //             "longitude" : 106.692642
    //         }
    //     ]
    //   }
    // ]
    const customersListWithData = await CustomerModel.aggregate([
      {
        $match: {
          globalCustomerId: { $exists: false },
        },
      },
      {
        $project: {
          id: true,
          phone: true,
          name: true,
          email: true,
          avatar: true,
          gender: true,
          birthday: true,
          fullAddress: true,
          latitude: true,
          longitude: true,
        },
      },
      {
        $group: {
          _id: "$phone",
          data: { $push: "$$ROOT" },
          customerIds: { $push: "$_id" },
        },
      },
    ]);
    if (!customersListWithData || customersListWithData.length === 0) {
      console.log("DONE");
      return;
    }

    const globalCustomers = await GlobalCustomerModel.find({
      phone: { $in: customersListWithData.map((o) => o._id) },
    }).then((res) => _.keyBy(res, "phone"));

    const bulk = CustomerModel.collection.initializeUnorderedBulkOp();
    for (const customersByPhone of customersListWithData) {
      var longestKey: ICustomer = _.maxBy(customersByPhone.data, function (customer) {
        if (!["null", "Vãng Lai", "Khách vãng lai"].includes(customer.name)) {
          return 10000; // if name != vãng lai thì chọn liền
        }
        return Object.keys(0).length;
      });

      let globalCustomerId: any;
      if (!globalCustomers[customersByPhone._id]) {
        //  if globalCustomer doesn't exist'
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
        await curGlobalCustomer.save();
        globalCustomerId = curGlobalCustomer._id;
      } else {
        globalCustomerId = globalCustomers[customersByPhone._id].id;
      }

      for (const customerId of customersByPhone.customerIds) {
        bulk.find({ _id: customerId }).update({ $set: { globalCustomerId: globalCustomerId } });
      }
    }
    if (bulk.length > 0) {
      console.log("Đang cập nhật");
      await bulk.execute();
    }
    console.log("DONE");
  }
}

export default GlobalCustomerConvertJob;
