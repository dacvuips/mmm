import zalo from ".";
import qs from "qs";

class ZaloOA {
  async getInfo(token: string) {
    return await zalo
      .api({ method: "get", url: "/oa/getoa", headers: { access_token: token } })
      .then((res) => res.data);
  }

  async getFollowers(token: string, { offset = 0, count = 50, tag_name = "" } = {}) {
    return await zalo
      .api({
        method: "get",
        url: "/oa/getfollowers",
        headers: { access_token: token },
        data: { offset, count, tag_name },
      })
      .then((res) => res.data);
  }

  async getProfile(token: string, userId: string) {
    return await zalo
      .api({
        method: "get",
        url: "/oa/getprofile",
        headers: { access_token: token },
        data: { user_id: userId },
      })
      .then((res) => res.data);
  }

  async updateProfile(token: string, data: any) {
    return await zalo
      .api({
        method: "post",
        url: "/oa/getprofile",
        headers: { access_token: token },
        data: data,
      })
      .then((res) => res.data);
  }

  async getTags(token: string) {
    return await zalo
      .api({
        method: "get",
        url: "/oa/tag/gettagsofoa",
        headers: { access_token: token },
      })
      .then((res) => res.data);
  }
}

export default new ZaloOA();
