import React, { useRef } from "react";
import { MarketPlacePost } from "../../market-place/components/market-place-post";
import SwiperCore, { Autoplay, Navigation, Pagination } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useScreen } from "../../../../lib/hooks/useScreen";
type Props = {};
SwiperCore.use([Pagination, Autoplay, Navigation]);

export function MarketPlaceDetailReadMore({}: Props) {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const screenLg = useScreen("lg");
  return (
    <div className="py-10">
      <div className="my-3 text-lg font-semibold">Đọc thêm bài viết</div>
      <Swiper
        className="px-4"
        spaceBetween={24}
        slidesPerView={screenLg ? 4 : 2}
        grabCursor
        autoplay={{
          delay: 3000,
          disableOnInteraction: true,
        }}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
      >
        <div
          ref={navigationPrevRef}
          className="absolute left-0 w-8 pl-0 pr-2 text-gray-600 transform -translate-y-1/2 bg-white border rounded-r-full shadow cursor-pointer h-9 top-1/2 flex-center group-hover:text-primary z-100"
        >
          <i className="text-lg">
            <FaChevronLeft />
          </i>
        </div>
        <div
          ref={navigationNextRef}
          className="absolute right-0 w-8 pl-2 pr-0 text-gray-600 transform -translate-y-1/2 bg-white border rounded-l-full shadow cursor-pointer h-9 top-1/2 flex-center group-hover:text-primary z-100"
        >
          <i className="text-lg">
            <FaChevronRight />
          </i>
        </div>
        {[1, 2, 3, , 4, 5, 6, 7].map((item, index) => (
          <SwiperSlide key={index} className="w-full xs:w-3/4 sm:w-2/3">
            <MarketPlacePost />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
