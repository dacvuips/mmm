import { counterService } from "../counter/counter.service";
export class ShopTableHelper {
  constructor() {}
  static async generateCode(): Promise<string> {
    const count = await counterService.trigger("shopTable");
    return "ST" + count.toString();
  }
}
