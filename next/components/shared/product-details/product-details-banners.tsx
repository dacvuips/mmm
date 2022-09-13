import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ReactPlayer from "react-player";
import SwiperCore, { Autoplay, Navigation, Pagination } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { useInterval } from "../../../lib/hooks/useInterval";
import { useScreen } from "../../../lib/hooks/useScreen";
import { Img } from "../utilities/misc";
// install Swiper modules
SwiperCore.use([Pagination, Autoplay, Navigation]);
interface Propstype extends ReactProps {
  images: string[];
  cover?: string;
  youtubeLink?: string;
}
export function ProductDetailsBanners({ images, cover, youtubeLink, ...props }: Propstype) {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const paginationRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const screenLg = useScreen("lg");

  useInterval(() => {
    if (!playing && navigationNextRef.current) {
      navigationNextRef.current.click();
    }
  }, 5000);

  return (
    <div className={`${props.className || ""} `}>
      <Swiper
        spaceBetween={10}
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
        {youtubeLink && (
          <SwiperSlide>
            <div className="cursor-pointer">
              <Img percent={screenLg ? 50 : 75} noImage>
                <div className="absolute top-0 left-0 w-full h-full bg-black flex-center">
                  <ReactPlayer
                    url={youtubeLink}
                    width="100%"
                    controls
                    playing={playing}
                    onPlay={() => {
                      setPlaying(true);
                    }}
                    onPause={() => {
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
          </SwiperSlide>
        )}
        {cover && (
          <SwiperSlide>
            <Img src={cover} lazyload={false} compress={screenLg ? 400 : 600} percent={screenLg ? 50 : 75} />
          </SwiperSlide>
        )}
        {images.map((item: string, index) => (
          <SwiperSlide key={index} className={`cursor-pointer`}>
            <Img src={item} lazyload={false} compress={screenLg ? 400 : 600} percent={screenLg ? 50 : 75} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
