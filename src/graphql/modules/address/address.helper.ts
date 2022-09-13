import { ErrorHelper } from "../../../base/error";
import { AddressModel } from "./address.model";

export class AddressHelper {
  static async setAddress(doc: any) {
    await Promise.all([
      this.setProvinceName(doc),
      this.setDistrictName(doc),
      this.setWardName(doc),
    ]);
    return this;
  }
  static async setProvinceName(doc: any) {
    if (!doc.provinceId) return this;
    const address = await AddressModel.findOne({ provinceId: doc.provinceId });
    if (!address) return this;
    doc.province = address.province;
    return this;
  }
  static async setDistrictName(doc: any) {
    if (!doc.districtId) return this;
    const address = await AddressModel.findOne({ districtId: doc.districtId });
    if (!address) return this;
    doc.district = address.district;
    return this;
  }
  static async setWardName(doc: any) {
    if (!doc.wardId) return this;
    const address = await AddressModel.findOne({ wardId: doc.wardId });
    if (!address) return this;
    doc.ward = address.ward;
    return this;
  }
}
