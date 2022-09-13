import Link from "next/link";
import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SwiperCore, { Navigation, Autoplay } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCrud } from "../../../../lib/hooks/useCrud";
import { Banner, BannerService } from "../../../../lib/repo/banner.repo";
import { Img } from "../../../shared/utilities/misc";

SwiperCore.use([Navigation, Autoplay]);

interface Propstype extends ReactProps {}
export function ShopsBannersAds(props: Propstype) {
  const bannerCrud = useCrud(BannerService, {
    limit: 10,
    filter: {
      position: "MIDDLE",
    },
  });

  const navigationPrevRef = React.useRef(null);
  const navigationNextRef = React.useRef(null);
  const paginationRef = useRef(null);

  const getBannerHref = (item: Banner) => {
    switch (item.actionType) {
      case "PRODUCT":
        return `/${item.shop?.code}/?product=${item.product?.code}`;
      case "WEBSITE":
        return item.link;
      case "VOUCHER":
        return `/${item.shop?.code}/?voucher=${item.voucher?.code}`;
      case "SHOP":
        return `/${item.shop?.code}`;
    }
  };

  if (!bannerCrud.items) return <></>;
  return (
    <div className="px-3">
      <Swiper
        spaceBetween={2}
        grabCursor
        autoplay={{
          delay: 3000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
          stopOnLastSlide: false,
        }}
        loop
        slidesPerView={1}
        className="w-full py-2"
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
      >
        <div
          className="absolute w-full gap-1.5 flex-center bottom-0 z-50"
          ref={paginationRef}
        ></div>
        {bannerCrud.items
          .filter((x) => x.image)
          .map((item: Banner, index) => (
            <SwiperSlide key={index}>
              <Link href={getBannerHref(item)}>
                <a {...(item.actionType == "WEBSITE" ? { target: "_blank" } : {})}>
                  <img src={item.image} className="w-full h-36 object-cover rounded-lg" />
                </a>
              </Link>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
