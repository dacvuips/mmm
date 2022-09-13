import Link from "next/link";
import { useMemo } from "react";
import { AiFillPlusCircle, AiFillStar } from "react-icons/ai";
import { Swiper, SwiperSlide } from "swiper/react";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { Product } from "../../../../lib/repo/product.repo";
import { ShopProductGroup } from "../../../../lib/repo/shop-config.repo";
import { Img } from "../../../shared/utilities/misc";

interface Propstype extends ReactProps {
  productGroups: ShopProductGroup[];
}
export function ShopDetailsProductsGroupDesktop({ productGroups }: Propstype) {
  const isLg = useScreen("lg");
  const publicProductGroups = useMemo(
    () => productGroups.filter((x) => x.isPublic && x.products.filter((x) => x.allowSale).length),
    [productGroups]
  );

  if (!publicProductGroups.length) return <></>;
  return (
    <>
      {publicProductGroups.map((item: ShopProductGroup, index) => (
        <div className="py-2 mb-5 bg-white rounded-md" key={item.name}>
          <div className="px-4 text-lg font-bold text-primary">{item.name}</div>
          <Swiper
            spaceBetween={30}
            freeMode={true}
            grabCursor
            slidesPerView={4}
            className="w-auto p-2 px-5"
          >
            {item.products
              ?.filter((x) => x.allowSale)
              .map((item: Product, index) => (
                <SwiperSlide
                  className="h-full grow-0 shrink-0"
                  style={{ width: "284px", marginRight: "40px" }}
                  key={index}
                >
                  <Link
                    key={index}
                    href={{ pathname: location.pathname, query: { product: item.code } }}
                    shallow
                  >
                    <a>
                      <Img
                        src={
                          item?.image_16_9
                            ? item?.image_16_9
                            : item?.cover
                              ? item?.cover
                              : item?.image
                        }
                        ratio169
                        className="object-contain rounded-md"
                        alt={item?.name}
                      />
                      <div className="">
                        <div className="flex flex-col">
                          <div className="flex flex-col flex-wrap items-start sm:flex-row xl:flex-nowrap">
                            <div
                              className={`w-40 pr-2  text-sm font-medium transition group-hover:text-primary-dark py-1 text-ellipsis-2`}
                            >
                              {item.name}
                            </div>
                            <div className="flex-col flex-1 py-1 xl:ml-5">
                              <div className="flex flex-row items-center justify-end text-sm font-semibold text-primary">
                                {parseNumber(item.basePrice)}đ
                                <span>
                                  <AiFillPlusCircle className="ml-1 text-primary text-[20px]" />
                                </span>
                              </div>
                              {item?.downPrice > item?.basePrice ? (
                                <del className="text-gray-400 text-[14px] flex justify-end">
                                  {parseNumber(item.downPrice)}đ
                                </del>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex flex-row items-center">
                            <span className="flex flex-row items-center pr-2 border-r border-gray-400 ">
                              <AiFillStar className="mr-1 text-yellow-400 text-[20px]" />
                              <span className="text-gray-500">{parseNumber(item.rating)}</span>
                            </span>
                            <span className="pl-2 text-gray-500 text-[14px]">
                              Được đặt {item.soldQty}+ lần
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      ))}
    </>
  );
}
