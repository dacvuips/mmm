import { EventEmitter } from "events";

export abstract class BaseService extends EventEmitter {
  constructor() {
    super();
  }
}
