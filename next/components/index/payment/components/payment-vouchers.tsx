import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SwiperCore, { Navigation } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { ShopVoucher } from "../../../../lib/repo/shop-voucher.repo";
import { Spinner } from "../../../shared/utilities/misc";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";
import { VoucherItem } from "../../../shared/voucher/voucher-item";
import { DAYS_OF_WEEK } from "../../../shared/voucher/voucher-list";
import { usePaymentContext } from "../providers/payment-provider";
SwiperCore.use([Navigation]);

export function PaymentVouchers(props) {
  const { vouchers, setSelectedVoucher } = usePaymentContext();

  const [openVoucherDetails, setOpenVoucherDetails] = useState<ShopVoucher>();

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  if (!vouchers) return <></>;
  if (vouchers.length == 0) return <></>;

  return (
    <div className="pb-8 bg-white">
      <Swiper
        className="px-4"
        spaceBetween={24}
        slidesPerView="auto"
        grabCursor
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
        {vouchers
          .filter((item) => {
            if (item.applyISODayOfWeek?.length === 0) {
              return item;
            }
            return item.applyISODayOfWeek?.find((day) => {
              // write minute 1 because data return from server is with 1 = sunday 7 = saturday [WIP]
              let currentDay = parseInt(JSON.stringify(DAYS_OF_WEEK[new Date().getDay() - 1]?.key))
              return day === currentDay;
            });
            // return item.applyISODayOfWeek?.find((day) => {
            //   return day === new Date().getDay();
            // });
          })
          .map((item: ShopVoucher, index) => {
            return (
              <SwiperSlide key={index} className="w-full mt-4 xs:w-3/4 sm:w-2/3">
                <VoucherItem
                  voucher={item}
                  onShowDetails={() => {
                    setSelectedVoucher(item);
                    setOpenVoucherDetails(item);
                  }}
                  onApply={() => {
                    setSelectedVoucher(item);
                    // checkVoucherDiscount(item.code);
                    // setOrderInput({ ...orderInput, promotionCode: item.code });
                  }}
                />
              </SwiperSlide>
            );
          })}
      </Swiper>
      <VoucherDetailsDialog
        voucher={openVoucherDetails}
        isOpen={!!openVoucherDetails}
        onClose={() => setOpenVoucherDetails(null)}
      />
    </div>
  );
}
