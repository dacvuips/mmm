import React, { useRef } from "react";
import { useCrud } from "../../../../lib/hooks/useCrud";
import { Banner, BannerService } from "../../../../lib/repo/banner.repo";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SwiperCore, { Navigation, Autoplay, Pagination } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { Img } from "../../../shared/utilities/misc";

interface Propstype extends ReactProps {}
SwiperCore.use([Navigation, Autoplay, Pagination]);

export function ShopsBannerDesktop({}: Propstype) {
  const bannerCrud = useCrud(BannerService, {
    limit: 10,
  });

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
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
    <div>
      <Swiper
        spaceBetween={20}
        grabCursor
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop
        slidesPerView={1}
        className="w-full"
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        pagination={{
          el: paginationRef.current,
          clickable: true,
          type: "bullets",
          bulletActiveClass: "bg-primary hover:bg-primary-dark w-4",
          bulletClass:
            "inline-block w-2 h-2 bg-black bg-opacity-60 hover:bg-gray-700 rounded-full transition-all cursor-pointer",
          renderBullet: function (index, className) {
            return `<span class="${className}"></span>`;
          },
        }}
      >
        {/* <div
          ref={navigationPrevRef}
          className="absolute left-0 h-10 pl-0 pr-2 text-white transform -translate-y-1/2 rounded-r-full cursor-pointer top-1/2 flex-center group-hover:text-primary z-100 w-9"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
        >
          <i className="text-lg">
            <FaChevronLeft />
          </i>
        </div>
        <div
          ref={navigationNextRef}
          className="absolute right-0 h-10 pl-2 pr-0 text-white transform -translate-y-1/2 rounded-l-full cursor-pointer top-1/2 flex-center group-hover:text-primary z-100 w-9"
          style={{ background: "rgba(0, 0, 0, 0.7)" }}
        >
          <i className="text-lg">
            <FaChevronRight />
          </i>
        </div> */}
        <div
          className="absolute z-50 w-full gap-1.5 flex-center bottom-10"
          ref={paginationRef}
        ></div>
        {bannerCrud.items
          .filter((x) => x.image)
          .map((item: Banner, index) => (
            <SwiperSlide key={item.id} className={`cursor-pointer rounded-lg w-5/6`}>
              <Link href={getBannerHref(item)}>
                <a {...(item.actionType == "WEBSITE" ? { target: "_blank" } : {})}>
                  <Img
                    key={index}
                    src={item.image}
                    className="rounded-lg"
                    ratio169
                    compress={800}
                  />
                </a>
              </Link>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
