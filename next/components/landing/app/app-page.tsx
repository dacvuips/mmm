import Link from "next/link";
import { useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import { useScreen } from "../../../lib/hooks/useScreen";
import { SocialNetwork } from "../../shared/landing-layout/social-networks";
import { Button } from "../../shared/utilities/form/button";
import { Accordion, Img } from "../../shared/utilities/misc";

interface Props { }

export default function AppPage({ ...props }: Props) {
  const md = useScreen("md");
  const lg = useScreen("lg");
  const xl = useScreen("xl");
  const xl_2 = useScreen("xxl");
  const [numberOfOpenAccordion, setNumberOfOpenAccordion] = useState<number>(0);
  const setShowAccordion = (newValue, oldValue) => {
    if (oldValue === newValue) {
      setNumberOfOpenAccordion(null);
      return;
    }
    setNumberOfOpenAccordion(newValue);
  };

  return (
    <div>
      <div className="relative xl:pt-24">
        <div className="flex flex-col xl:flex-row main-container">
          <div className="flex flex-col flex-1 h-auto mt-20 text-center md:mt-28 md:text-left">
            <div className="text-2xl text-gray-700 uppercase md:text-4xl">
              Giải pháp quản lý tinh gọn
            </div>
            <div
              className="mt-3 text-3xl font-black leading-10 text-gray-700 uppercase md:mt-5 md:text-5xl"
              style={{
                lineHeight: xl_2 ? "74px" : xl ? "66px" : lg ? "62px" : md ? "56px" : "36px",
              }}
            >
              Cửa hàng của bạn trên mobile
            </div>
            <div className="mt-2 text-lg text-gray-700 md:mt-4 xl:mt-2">
              Ứng dụng bán hàng online và quản lý thu chi trên di động. Sử dụng đơn giản, hiệu quả
              và nhanh gọn.
            </div>
            <div className="flex justify-center md:justify-start">
              <Button
                primary
                text="Đăng ký dùng thử"
                className="w-56 h-12 px-4 mt-4 font-bold uppercase xl:mt-16 rounded-3xl bg-primary"
              />
            </div>
            <div className="mt-4 text-gray-500">
              Hãy liên hệ với chúng tôi để được tư vấn giải pháp tối ưu
            </div>
          </div>
          <img
            src="https://i.imgur.com/AmrkB9i.png"
            alt="app-mobile-image"
            className="object-contain"
          />
        </div>
        <div className="absolute transform -translate-y-1/2 top-3/4 left-3 md:left-6 lg:left-8 xl:left-12 2xl:left-28">
          <SocialNetwork />
        </div>
      </div>
      <div className="w-full bg-gradient-to-b from-accent to-primary hover:from-accent hover:to-primary-dark">
        <div className="flex flex-col justify-between gap-4 py-12 lg:gap-20 lg:py-24 lg:flex-row main-container">
          <img src="https://i.imgur.com/AXHMrqQ.png" className="object-contain" />
          <div className="">
            <div className="mt-4 text-3xl font-bold text-white md:mt-8 md:text-5xl">
              Quản lý cửa hàng của bạn ngay trên điện thoại
            </div>
            <div className="mt-4 bg-white shadow-md md:mt-12 rounded-xl">
              {MANAGEMENT_LIST.map((item, index) => (
                <div key={index}>
                  <div
                    className={`flex justify-between p-6 ${index !== MANAGEMENT_LIST.length - 1 && index !== numberOfOpenAccordion
                        ? "border-b-2 border-gray-100"
                        : ""
                      }`}
                    onClick={() => setShowAccordion(index, numberOfOpenAccordion)}
                  >
                    <div className="font-bold uppercase text-primary">{item.title}</div>
                    <i
                      className={`text-2xl font-bold transform transition cursor-pointer ${index === numberOfOpenAccordion
                          ? "rotate-180 text-primary"
                          : "text-gray-500"
                        }`}
                    >
                      <AiOutlineDown />
                    </i>
                  </div>
                  <Accordion isOpen={index === numberOfOpenAccordion}>
                    <div
                      className={`p-6 text-gray-700 border-gray-100 border-t-2 ${index !== MANAGEMENT_LIST.length - 1 ? "border-b-2" : ""
                        }`}
                    >
                      <div className="pb-4 uppercase">bán hàng chỉ qua 3 bước:</div>
                      <div>- Tạo khuyến mãi chỉ 30 giây</div>
                      <div>- Tương tác hàng ngàn khách hàng sau 3 bước</div>
                      <div>- Không mất phí chiết khấu cho vận chuyển</div>
                    </div>
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col justify-between gap-8 py-12 pt-8 lg:py-24 lg:gap-16 lg:flex-row main-container">
          <div className="flex flex-col justify-center flex-1">
            <div
              className="text-3xl font-bold text-center text-gray-700 md:text-5xl lg:text-left"
              style={{ lineHeight: md ? "3.875rem" : "3rem" }}
            >
              Tinh gọn kinh doanh, nhàn tênh quản lý
            </div>
            <div className="mt-6 ">
              <div className="text-lg font-bold uppercase text-primary">báo cáo thông minh</div>
              <div className="mt-4 text-gray-700">
                Theo dõi các chỉ số báo cáo quan trọng của đơn hàng, lượng truy cập gian hàng. Tiếp
                cận khách hàng tự động qua tin nhắn, Zalo, Facebook... Cho phép khách thanh toán qua
                cổng online quản lý dòng tiền chặt chẽ.
              </div>
            </div>
            <div className="mt-6 ">
              <div className="text-lg font-bold uppercase text-primary">
                giải pháp tài xế ưu việt
              </div>
              <div className="mt-4 text-gray-700">
                Quên đi nỗi lo về tài xế. SOMO kết nối trực tiếp với đối tác giao vận đơn hàng của
                bạn sẽ được chuyển đến tay khách hàng trong 30 phút, SOMO cũng cho phép bạn xây dựng
                một đội ngũ vận chuyển riêng trên ứng dụng.
              </div>
            </div>
          </div>
          <Img src="https://i.imgur.com/gCfrCIo.png" contain className="w-full lg:w-7/12" />
        </div>
      </div>
      <div className="h-24 overflow-hidden lg:h-32 xl:h-36">
        <div className="relative">
          <Img
            noImage
            className="absolute transform translate-x-3 bg-primary-light -left-1/2 2xl:translate-x-0"
            style={{ width: "200%", borderRadius: "50%" }}
            percent={60}
          />
        </div>
      </div>
      <div className="bg-primary-light">
        <div className="pb-28 md:pb-44 lg:pb-36 main-container">
          <div className="flex flex-col gap-8 xl:gap-20 lg:flex-row">
            <Img contain src="https://i.imgur.com/GSqypDv.png" className="w-full lg:w-1/3" />
            <div className="flex flex-col justify-between flex-1 mt-4 xl:mt-32">
              <div className="">
                <div className="text-3xl font-bold text-center text-gray-700 md:text-5xl xl:text-left">
                  Tải app miễn phí
                </div>
                <div className="mt-8">
                  Cùng hơn 2,000+ các thương hiệu lớn, chủ cửa hàng đã và đang sử dụng SOMO để phát
                  triển kinh doanh quản lý hiệu quả và tinh gọn.
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-8 lg:justify-start xl:mt-20">
                <Link href="https://play.google.com/store/apps/details?id=mcom.app.shop3m">
                  <a target="_blank">
                    <img
                      src="/assets/img/googleplay.png"
                      className="object-contain h-12 cursor-pointer"
                    />
                  </a>
                </Link>
                <Link href="https://apps.apple.com/vn/app/som-kinh-doanh-tinh-g%E1%BB%8Dn/id1577028537?l=vi">
                  <a target="_blank">
                    <img
                      src="/assets/img/appstore.png"
                      className="object-contain h-12 cursor-pointer"
                    ></img>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MANAGEMENT_LIST = [
  {
    title: "quản lý cửa hàng",
  },
  {
    title: "quản lý doanh thu",
  },
  {
    title: "bán hàng đa kênh",
  },
];
