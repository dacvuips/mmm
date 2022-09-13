import Link from "next/link";
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { ShopDetailsCommentsDialog } from "./shop-details-comments-dialog";

export function ShopDetailsActions() {
  const { shop, shopCode } = useShopContext();
  const [openComments, setOpenComments] = useState(false);

  return (
    <>
      <div className="flex px-3 text-gray-700 bg-white border-t sm:px-6 justify-evenly">
        <Link href={`/${shopCode}/promotion`}>
          <a className="flex items-center flex-1 py-3 transition-all focus:outline-none group">
            <img src="/assets/img/tag.png" alt="" className="object-contain w-5" />
            <span className="pl-2 pr-1 text-sm font-semibold text-gray-700 sm:text-base group-hover:text-primary whitespace-nowrap">
              Khuyến mãi
            </span>
            <i className="text-sm text-gray-500 group-hover:text-primary">
              <FaChevronRight />
            </i>
          </a>
        </Link>
        <button
          className="flex items-center py-3 transition-all group no-focus"
          onClick={() => setOpenComments(true)}
        >
          <img src="/assets/img/star.png" alt="" className="object-contain w-5" />
          {shop.config.rating > 0 && (
            <span className="pl-2 pr-1 text-sm font-semibold text-gray-700 sm:text-base group-hover:text-primary whitespace-nowrap">
              {shop.config.rating} (
              {shop.config.ratingQty >= 1000
                ? "1000+"
                : shop.config.ratingQty >= 100
                ? "100+"
                : shop.config.ratingQty >= 10
                ? "10+"
                : "0"}{" "}
              bình luận )
            </span>
          )}
          <i className="text-sm text-gray-500 group-hover:text-primary">
            <FaChevronRight />
          </i>
        </button>
        {/* <button
          className="flex items-center p-2 transition-all duration-200 focus:outline-none group"
          onClick={() => copyClipboard()}
        >
          <img src="/assets/img/share.png" alt="" className="object-contain w-4 sm:w-6" />
          <span className="px-1 text-sm font-semibold sm:text-base">Chia sẻ</span>
          <i className="text-sm text-gray-400 group-hover:text-primary sm:text-base">
            <FaChevronRight />
          </i>
        </button> */}
        <ShopDetailsCommentsDialog isOpen={openComments} onClose={() => setOpenComments(false)} />
      </div>
    </>
  );
}
