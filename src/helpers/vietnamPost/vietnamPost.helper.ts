import Axios from "axios";
import { get } from "lodash";

import { configs } from "../../configs";
import { logger } from "../../loaders/logger";
import {
  IWardTypeResponse,
  IServiceResponse,
  ICreateDeliveryOrderRequest,
  ICreateDeliveryOrderResponse,
  ICalculateAllShipFeeResponse,
  IPostByAddress,
} from "./resources/type";

export class VietnamPostHelper {
  static host = configs.vietnamPost.host;
  static getToken(username: string, password: string) {
    return Axios.post(`${this.host}/MobileAuthentication/GetAccessToken`, {
      TenDangNhap: username,
      MatKhau: password,
    }).then((res) => {
      if (res.data.IsSuccess) {
        const data = res.data.Payload;
        return {
          vnpostToken: res.data.Token,
          vnpostCode: get(data, "MaCRM"),
          vnpostPhone: get(data, "SoDienThoai"),
          vnpostName: get(data, "TenNguoiDung"),
        };
      } else {
        throw Error(res.data.ErrorMessage);
      }
    });
  }
  static getProvinces() {
    return Axios.get(`${this.host}/TinhThanh/GetAll`).then((res) => get(res, "data"));
  }
  static getDistricts() {
    return Axios.get(`${this.host}/QuanHuyen/GetAll`).then((res) => get(res, "data"));
  }
  static getWards(): IWardTypeResponse[] {
    const result: any = Axios.get(`${this.host}/PhuongXa/GetAll`).then((res) => get(res, "data"));
    return result;
  }

  static getListService() {
    const url = `${this.host}/CustomerOrder/GetListDichVuChuyenPhatDonLe`;
    return Axios.get(url, {
      // TYPE: 2,
    })
      .then((res) => {
        let services: IServiceResponse[] = get(res, "data");
        return services.map((service) => {
          return {
            code: service.MaDichVu,
            name: service.TenDanhMucDichVu,
          };
        });
      })
      .catch(() => {
        return {
          code: null,
          name: null,
        };
      });
  }

  static createDeliveryOrder(data: ICreateDeliveryOrderRequest, token?: string) {
    return Axios.post(`${this.host}/order/createOrder`, data, {
      headers: {
        "h-token": token || configs.vietnamPost.token,
      },
    })
      .then((res) => {
        const data: ICreateDeliveryOrderResponse = get(res, "data");
        return data;
      })
      .catch(handleVNPostError());
  }

  static calculateAllShipFee(data: any, token?: string): ICalculateAllShipFeeResponse {
    //https://donhang.vnpost.vn/api/api/TinhCuoc/TinhTatCaCuoc
    // console.log('vao vnpost')
    // console.log("data", data);
    const result: any = Axios.post(`${this.host}/TinhCuoc/TinhTatCaCuoc`, data, {
      headers: {
        "h-token": token || configs.vietnamPost.token,
      },
    })
      .then((res) => get(res, "data"))
      .catch(handleVNPostError());
    return result;
  }

  static cancelOrder(orderId: string, token?: string) {
    // console.log("testcancelOrdercancelOrdercancelOrder");
    const result: any = Axios.post(
      `${this.host}/Order/CancelOrder?orderId=${orderId}`,
      {},
      {
        headers: {
          "h-token": token || configs.vietnamPost.token,
        },
      }
    )
      .then((res) => get(res, "data"))
      .catch(handleVNPostError());
    return result;
  }

  static getOrdersByItemCodes(itemCodes: string[], token?: string) {
    //https://donhang.vnpost.vn/api/api/TinhCuoc/TinhTatCaCuoc
    const result: any = Axios.post(
      `${this.host}/Order/GetListOrderByManagerWithCustomCode`,
      {
        PageSize: 1,
        ListItemCode: itemCodes,
      },
      {
        headers: {
          "h-token": token || configs.vietnamPost.token,
        },
      }
    )
      .then((res) => get(res, "data"))
      .catch(handleVNPostError());
    return result;
  }

  static getPostByAddress(
    provinceId: string,
    districtId: string,
    wardId: string,
    token?: string
  ): IPostByAddress {
    //https://donhang.vnpost.vn/api/api/TinhCuoc/TinhTatCaCuoc
    const result: any = Axios.post(
      `${this.host}/BuuCuc/GetListBuuCucByXaHuyenTinh`,
      {
        MaTinhThanh: provinceId,
        MaQuanHuyen: districtId,
        MaPhuongXa: wardId,
      },
      {
        headers: {
          "h-token": token || configs.vietnamPost.token,
        },
      }
    )
      .then((res) => get(res, "data")[0])
      .catch(handleVNPostError());
    return result;
  }
}

function handleVNPostError(): (reason: any) => PromiseLike<never> {
  return (error) => {
    if (error.response.data) {
      throw Error(error.response.data);
    } else {
      logger.log("vnpost", error);
      throw error;
    }
  };
}
