import Link from "next/link";
import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { Product } from "../../../../lib/repo/product.repo";
import { ShopProductGroup } from "../../../../lib/repo/shop-config.repo";
import { ProductImg } from "../../../shared/product/product-img";
import { ProductPrice } from "../../../shared/product/product-price";
interface Propstype extends ReactProps {
  productGroups: ShopProductGroup[];
}
export function ShopDetailsProductsGroup({ productGroups }: Propstype) {
  const publicProductGroups = useMemo(
    () => productGroups.filter((x) => x.isPublic && x.products.filter((x) => x.allowSale).length),
    [productGroups]
  );
  if (!publicProductGroups.length) return <></>;
  const isXs = useScreen("xs");
  return (
    <div className="py-2 bg-white">
      {publicProductGroups.map((item: ShopProductGroup, index) => (
        <div className="py-3" key={item.name}>
          <div className="px-4 pb-2 text-lg font-bold">{item.name}</div>
          <Swiper
            spaceBetween={10}
            freeMode={true}
            grabCursor
            slidesPerView={"auto"}
            className="w-auto px-4"
          >
            {item.products
              ?.filter((x) => x.allowSale)
              .map((item: Product, index) => (
                <SwiperSlide className="h-full" style={{ width: isXs ? "28%" : "40%" }} key={index}>
                  <Link
                    key={index}
                    href={{ pathname: location.pathname, query: { product: item.code } }}
                    shallow
                  >
                    <a
                      className={`flex flex-col transition cursor-pointer group ${
                        isXs ? "text-base" : "text-sm"
                      }`}
                    >
                      <ProductImg src={item.image} compress={200} saleRate={item.saleRate} />
                      <div
                        className={`px-0.5 flex-1 font-medium transition group-hover:text-primary-dark py-1`}
                      >
                        {item.name}
                      </div>
                      <ProductPrice
                        className="px-0.5"
                        price={item.basePrice}
                        downPrice={item.downPrice}
                      />
                    </a>
                  </Link>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      ))}
    </div>
  );
}
