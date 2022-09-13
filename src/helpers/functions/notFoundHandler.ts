import { ErrorHelper } from "../../base/error";

export function notFoundHandler<T>(data: T) {
  if (!data) throw ErrorHelper.mgRecoredNotFound();
  return data;
}
