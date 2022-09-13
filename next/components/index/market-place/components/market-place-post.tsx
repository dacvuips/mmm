import Link from "next/link";
import { formatDate } from "../../../../lib/helpers/parser";
import { Img } from "../../../shared/utilities/misc";

export function MarketPlacePost({ ...props }) {
  return (
    <Link href={`market-place/${123}?name=bai-viet-so-1`}>
      <a className="">
        <div className="p-3 rounded-md shadow">
          <Img
            ratio169
            className="object-cover w-auto rounded-md"
            src="https://images.unsplash.com/photo-1649894157443-81134486172f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
          />
          <div className="my-1 font-semibold text-ellipsis-2">
            Cryptocurrency Coin98 to be listed in world's second biggest exchange
          </div>
          <p className="my-1 text-gray-500 text-ellipsis-2">
            Coin98 is set to become the second Vietnam blockchain app after Axie Infinity to have
            its ...
          </p>
          <div className="my-1 text-gray-400">{formatDate("10/10/2021", "dd-MM-yyyy")}</div>
        </div>
      </a>
    </Link>
  );
}
