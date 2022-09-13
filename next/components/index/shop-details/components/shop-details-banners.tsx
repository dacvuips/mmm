import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ReactPlayer from "react-player";
import SwiperCore, { Autoplay, Navigation, Pagination } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { useInterval } from "../../../../lib/hooks/useInterval";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { ShopBanner } from "../../../../lib/repo/shop-banner.repo";
import { Button } from "../../../shared/utilities/form";
import { Img } from "../../../shared/utilities/misc";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";
// install Swiper modules
SwiperCore.use([Pagination, Autoplay, Navigation]);
interface Propstype extends ReactProps {
  banners: ShopBanner[];
  cover: string;
}
export function ShopDetailsBanners({ cover, banners, ...props }: Propstype) {
  const screenLg = useScreen("lg");
  const publicBanners = banners.filter((item) => item.isPublic);
  if (!publicBanners.length)
    return (
      <>
        {cover && (
          <Img
            src={cover}
            ratio169
            className={`${screenLg ? "shadow-sm rounded-xl" : "rounded-lg px-4"}`}
          />
        )}
      </>
    );

  const [openVoucherDialog, setOpenVoucherDialog] = useState<string>();
  const [playing, setPlaying] = useState(false);

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const paginationRef = useRef(null);

  useInterval(() => {
    if (!playing && navigationNextRef.current) {
      navigationNextRef.current.click();
    }
  }, 5000);

  return (
    <div className={`${screenLg ? "" : "px-3"} my-2    ${props.className || ""} `}>
      <Swiper
        loop={true}
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
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onSlideChange={() => {
          setPlaying(false);
        }}
      >
        <div
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
        </div>
        <div
          className="absolute z-50 w-full gap-1.5 flex-center bottom-2"
          ref={paginationRef}
        ></div>
        {publicBanners.map((item: ShopBanner, index) => (
          <SwiperSlide
            key={index}
            className={`cursor-pointer ${screenLg ? "rounded-lg shadow-md" : "rounded-lg"}`}
          >
            {item.type == "image" ? (
              <>
                {
                  {
                    PRODUCT: (
                      <Link
                        href={{
                          pathname: location.pathname,
                          query: { product: item.product?.code },
                        }}
                        shallow
                      >
                        <a>
                          <Img
                            key={index}
                            src={item.image || "/assets/default/default.png"}
                            ratio169
                            compress={800}
                            className={screenLg ? "rounded-lg" : "rounded-xl"}
                          />
                        </a>
                      </Link>
                    ),
                    WEBSITE: (
                      <Link href={item.link}>
                        <a>
                          <Img
                            key={index}
                            src={item.image || "/assets/default/default.png"}
                            ratio169
                            compress={800}
                            className={screenLg ? "rounded-lg" : "rounded-xl"}
                          />
                        </a>
                      </Link>
                    ),
                    VOUCHER: (
                      <Img
                        src={item.image || "/assets/default/default.png"}
                        ratio169
                        compress={800}
                        onClick={() => {
                          setOpenVoucherDialog(item.voucherId);
                        }}
                        className={screenLg ? "rounded-lg" : "rounded-xl"}
                      />
                    ),
                    NONE: (
                      <Img
                        src={item.image || "/assets/default/default.png"}
                        ratio169
                        compress={800}
                        className={screenLg ? "rounded-lg" : "rounded-xl"}
                      />
                    ),
                  }[item.actionType]
                }
              </>
            ) : (
              <div className="cursor-pointer">
                <Img ratio169 noImage>
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl">
                    <ReactPlayer
                      url={item.youtubeLink}
                      width="100%"
                      height="100%"
                      controls
                      playing={playing}
                      onPlay={() => {
                        console.log("play");
                        setPlaying(true);
                      }}
                      onPause={() => {
                        console.log("pause");
                        setPlaying(false);
                      }}
                      config={{
                        youtube: {
                          playerVars: { showinfo: 1 },
                        },
                        file: {
                          attributes: {
                            controlsList: "nodownload",
                          },
                        },
                      }}
                    />
                  </div>
                </Img>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      <VoucherDetailsDialog
        isOpen={!!openVoucherDialog}
        voucherId={openVoucherDialog}
        onClose={() => setOpenVoucherDialog("")}
      />
    </div>
  );
}
