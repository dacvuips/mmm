import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper/core";
import { Dialog } from "../../../shared/utilities/dialog/dialog";
import { HiOutlineX } from "react-icons/hi";
import { useScreen } from "../../../../lib/hooks/useScreen";

SwiperCore.use([Navigation]);
interface Propstype extends ReactProps {
  reactions: { name: string; icon: string; qty: number }[];
  shopName: string;
}
export function ShopDetailsReactions(props: Propstype) {
  const screenLg = useScreen("lg");
  const [selectedReaction, setSelectedReaction] = useState<{
    name: string;
    icon: string;
    qty: number;
  }>(null);

  if (!props.reactions.length) return <></>;
  return (
    <div className={`${screenLg ? "my-8" : "relative pl-3 pb-3 bg-white border-b group pt-5"}`}>
      <Swiper
        spaceBetween={10}
        freeMode={true}
        grabCursor
        slidesPerView={"auto"}
        className={`${screen ? "" : "px-4"} w-auto`}
      >
        {props.reactions.map((item, index) => (
          <SwiperSlide key={item.name} className="w-auto">
            <div
              className="flex rounded-full items-center p-1.5 px-2 border border-gray-400 text-sm shadow-sm bg-white cursor-pointer"
              onClick={() => setSelectedReaction(item)}
            >
              {item.icon}
              <span className="pl-1.5">
                {item.name} ({item.qty}+)
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <Dialog
        isOpen={!!selectedReaction}
        onClose={() => setSelectedReaction(null)}
        slideFromBottom="none"
        width="400px"
        extraDialogClass="rounded-3xl overflow-hidden relative bg-white"
      >
        <div
          className={`w-8 h-8 absolute right-4 top-4 z-200 rounded-full p-2 flex items-center justify-center cursor-pointer`}
          onClick={() => setSelectedReaction(null)}
        >
          <i className="text-2xl text-gray-600 ">
            <HiOutlineX />
          </i>
        </div>
        <div className="flex flex-col max-w-lg p-6 text-center text-gray-700">
          <div className="h-12 text-5xl">{selectedReaction?.icon}</div>
          <div className="mt-3 text-2xl font-bold">{selectedReaction?.name}</div>
          <div className="mt-1">{selectedReaction?.qty}+ kh??ch h??ng ???? ????nh gi?? nh?? v???y</div>
          <div className="mt-4 font-light">
            H??y c??ng {props.shopName} n??ng cao ch???t l?????ng qu??n b???ng c??ch ????nh gi?? sau khi ????n h??ng
            k???t th??c b???n nh??
          </div>
        </div>
      </Dialog>
    </div>
  );
}
