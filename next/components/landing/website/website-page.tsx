import { RiPlayFill } from "react-icons/ri";
import { Swiper, SwiperSlide } from "swiper/react";
import { useScreen } from "../../../lib/hooks/useScreen";
import { Newsletter } from "../../shared/landing-layout/newsletter";
import { SocialNetwork } from "../../shared/landing-layout/social-networks";
import { Button } from "../../shared/utilities/form/button";
import { Img } from "../../shared/utilities/misc";
import SwiperCore, { Autoplay } from "swiper/core";
SwiperCore.use([Autoplay]);
interface WebsitePageProps { }

export function WebsitePage(props: WebsitePageProps) {
  const sm = useScreen("sm");
  const md = useScreen("md");
  const lg = useScreen("lg");
  const xl = useScreen("xl");
  const xl_2 = useScreen("xxl");

  return (
    <div className="">
      <div className="relative">
        {lg ? (
          <div className="">
            <img
              src="https://i.imgur.com/rqUULaM.jpg"
              alt="website_banner"
              className="w-full -top-20"
            />
            <div className="absolute flex flex-col w-1/2 h-auto transform -translate-y-1/4 top-1/2 lg:-translate-y-2/3 2xl:top-1/2 xl:top-1/2 xl:w-4/12 2xl:-translate-y-1/3 xl:-translate-y-1/2 left-1/4 -translate-x-1/3">
              <div
                className="font-bold text-gray-700 uppercase md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl"
                style={{
                  lineHeight: xl_2 ? "74px" : xl ? "62px" : "48px",
                }}
              >
                Hệ thống quản lý & khai thác dữ liệu khách hàng hiệu quả
              </div>
              <div className="mt-2 text-sm text-white lg:mt-4 lg:text-lg">
                Quản lý chuỗi cửa hàng đơn giản mọi lúc mọi nơi
              </div>
              <Button
                primary
                text="Đăng ký tư vấn"
                className="w-40 h-10 px-2 mt-2 font-bold uppercase md:mt-4 lg:mt-8 md:h-12 md:w-48 md:px-4 rounded-3xl bg-primary"
              />
              <div className="mt-4 font-bold">
                Hãy liên hệ với chúng tôi để  đươc tư vấn giải pháp tối ưu
              </div>
            </div>
          </div>
        ) : (
          <div className="">
            <img
              src={md ? "https://i.imgur.com/xktav7M.jpg" : "https://i.imgur.com/NGadgEV.jpg"}
              alt="website_banner"
              className="object-contain w-full"
            />
            <div className="absolute pl-16 pr-12 top-20 md:top-44">
              <div
                className="text-3xl font-bold text-gray-700 uppercase md:text-5xl"
                style={{ lineHeight: md ? "68px" : sm ? "48px" : "40px" }}
              >
                Hệ thống quản lý & khai thác dữ liệu khách hàng hiệu quả
              </div>
              <div className="mt-2 text-lg text-white">
                Quản lý chuỗi cửa hàng đơn giản mọi lúc mọi nơi
              </div>
              <div className="flex flex-col items-center justify-center gap-3 mt-1">
                <Button
                  primary
                  text="Đăng ký tư vấn"
                  className="w-48 h-12 px-2 mt-2 font-bold uppercase rounded-3xl bg-primary"
                />
                <div className="font-bold">
                  Hãy liên hệ với chúng tôi để  đươc tư vấn giải pháp tối ưu
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="absolute transform -translate-y-1/2 top-1/2 left-4 md:left-6 lg:left-8 xl:left-12 2xl:left-28">
          <SocialNetwork />
        </div>
      </div>
      <div className="">
        <div className="py-12 lg:py-24 main-container">
          <div className="text-3xl font-bold text-center text-gray-700 md:text-5xl">
            Hệ thống quản lý bán hàng SOMO giải pháp được hơn 5000+ đơn vị F&B tin dùng
          </div>
          <div className="flex flex-col items-stretch gap-4 mt-6 lg:flex-row md:gap-8 xl:mt-24">
            <div className="lg:w-2/5">
              <img
                src="https://i.imgur.com/B55VbxJ.png"
                alt="he-thong-quan-ly-ban-hang"
                className="object-contain w-full"
              />
            </div>
            <div className="grid flex-1 grid-cols-1 p-2 md:p-4 md:grid-cols-2 gap-x-2 gap-y-4 md:gap-8">
              <div className="flex flex-col justify-between lg:justify-start">
                <div className="text-lg font-bold uppercase text-primary">dễ dàng sử dụng</div>
                <div className="mt-4 text-gray-700">
                  Với SOMO dễ dàng tạo cửa hàng nhanh chóng quản lý chi nhánh trực thuộc
                </div>
              </div>
              <div className="flex flex-col justify-between lg:justify-start">
                <div className="text-lg font-bold uppercase text-primary">
                  dễ dàng đặt shiper quy trình
                </div>
                <div className="mt-4 text-gray-700">
                  Không cần thủ tục hay đăng ký SOMO kết nối hệ thống của bạn với đội ngũ shiper
                </div>
              </div>
              <div className="flex flex-col justify-between lg:justify-start">
                <div className="text-lg font-bold uppercase text-primary">
                  dễ dàng chăm sóc khách
                </div>
                <div className="mt-4 text-gray-700">
                  Với SOMO dễ dàng tạo những chuỗi ưu đãi khuyến mãi, kết nối đa kênh tạo chiến lực
                  marketing tiếp cận hàng ngàn khách hàng trên zalo, facebook,... Chăm sóc và bán
                  lại cho khách hàng.
                </div>
              </div>
              <div className="flex flex-col justify-between lg:justify-start">
                <div className="text-lg font-bold uppercase text-primary">
                  dễ dàng chốt đơn, tặng
                </div>
                <div className="mt-4 text-gray-700">
                  Bạn sẽ dễ dàng nhận đơn hàng từ nhiều chi nhánh khác nhau, quy trình duyệt đơn
                  nhanh chóng tinh gọn, chat và tư vấn khách hàng trên hệ thống giúp tăng nhanh đơn
                  hàng.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-primary-light">
        <div className="py-12 md:py-24 main-container">
          <div className="text-3xl font-bold text-center text-gray-700 md:text-5xl">
            Phủ rộng thương hiệu bằng chương trình cộng tác viên bán hàng
          </div>
          <div className="flex flex-col items-stretch justify-between gap-8 mt-12 md:gap-16 xl:gap-32 md:mt-24 lg:flex-row">
            <div className="flex flex-col justify-between gap-2 text-lg lg:w-1/2">
              <div className="text-lg font-bold uppercase text-primary">
                hệ thống somo giúp bạn xây dựng đội ngũ
              </div>
              <div className="text-gray-700 ">
                <div className="">
                  Kênh đặt hàng trên hệ thống sẽ có thể cho cộng tác viên đăng ký bán hàng cho các
                  cửa hàng Zalo, Facebook,... Đồng thời chia sẻ nhanh các link đặt hàng qua tin
                  nhắn, trang cá nhân và hội nhóm hay kết hợp với các chiến dịch Marketing do chủ
                  shop đặt ra.
                </div>
                <div className="mt-8">
                  Chủ cửa hàng có thể ghi nhận và quản lý toàn bộ đơn đặt hàng ngay trên SOMO
                  Software từ nguồn cộng tác viên. Điều này sẽ giúp chủ cửa hàng giảm tối thiểu chi
                  phí quảng cáo, tiếp cận nhiều khách hàng tiềm năng với chi phí thấp, nâng tạo giá
                  trị cộng đồng nhanh chóng và hiệu quả.
                </div>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="https://i.imgur.com/G6Osjo3.png"
                alt="cong-tac-image"
                className="object-contain w-full"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div className="py-12 lg:py-24 main-container">
          <div className="text-3xl font-bold text-center text-gray-700 lg:text-5xl">
            Theo dõi dễ dàng từ xa chỉ với 1 chiếc điện thoại dễ dàng quản lý của hàng
          </div>
          <div className="flex flex-col items-stretch gap-8 mt-12 lg:flex-row md:gap-16 xl:gap-32 md:mt-24 main-container">
            <div className="lg:w-1/2">
              <img
                src="https://i.imgur.com/THITtSc.png"
                alt="app-mobile-image"
                className="object-contain w-full"
              />
            </div>
            <div className="flex flex-col justify-between flex-1 gap-4">
              <div className="">
                <div className="text-lg font-bold uppercase text-primary">
                  bán hàng ngay trên điện thoại
                </div>
                <div className="mt-2 text-gray-700">
                  Ứng dụng quản lý bán hàng giúp tạo đơn nhanh chóng
                </div>
              </div>
              <div className="">
                <div className="text-lg font-bold uppercase text-primary">
                  xem báo cáo mọi lúc mọi nơi
                </div>
                <div className="mt-2 text-gray-700">
                  Phần mềm trên điện thoại sẽ thống kê doanh thu tức thì như lịch sử giao dịch, đơn
                  hàng. Bạn có thể quản lý cửa hàng, nhân viên từ xa.
                </div>
              </div>
              <div className="">
                <div className="text-lg font-bold uppercase text-primary">
                  tương thích với mọi thiết bị di động
                </div>
                <div className="mt-2 text-gray-700">
                  Ứng dụng SOMO có mặt trên cả hai hệ điều hành là Android và iOS. Do đó bạn có thể
                  sử dụng ứng dụng SOMO Merchant trên các thiết bị khác nhau.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="overflow-hidden bg-primary-light"
        style={{ height: xl ? "940px" : md ? "840px" : "700px" }}
      >
        <div className="relative">
          <Img
            className="absolute transform bg-white -translate-y-2/3 -left-6 md:-left-10 lg:-left-12 xl:-left-24"
            style={{ width: "110%", borderRadius: "50%" }}
            percent={45}
            noImage
          />
          <div className="absolute px-12 py-12 transform -translate-x-1/2 bg-white border-2 border-gray-100 shadow-md lg:px-16 2xl:min-w-8xl xl:min-w-4xl min-w-sm md:min-w-2xl lg:min-w-3xl rounded-3xl left-1/2">
            <div className="text-3xl font-bold text-center text-gray-700 md:text-5xl">
              Có được khách hàng đã khó, giữ chân khách hàng càng khó gấp bội
            </div>
            <div className="flex items-center justify-center my-16">
              <img
                src="https://i.imgur.com/glnmpkd.png"
                alt="dat-hang-online-image"
                className="min-w-2/3 xl:min-w-3/4 contain"
              />
            </div>
            <div className="flex justify-between gap-4 text-lg text-center text-gray-700 xl:mt-4 xl:gap-14">
              <div className="">Cá nhân hóa khách hàng trên tất cả hoạt động</div>
              <div className="">Thiết lập mã khuyến mãi dành riêng cho từng tệp khách hàng</div>
              <div className="">Tích điểm cho khách sau bán</div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-primary-dark">
        <div className="flex flex-col items-stretch gap-8 py-12 xl:flex-row xl:gap-16 xl:py-24 main-container ">
          <div className="flex flex-col gap-6 2xl:gap-32 xl:w-2/6">
            <div className="text-3xl font-bold text-white md:text-5xl">
              Lắng nghe khách hàng nói về Somo
            </div>
            <div className="flex flex-col gap-4 md:gap-8">
              <Img
                src="https://i.imgur.com/EJg4R91.png"
                alt="dau-nhay-image"
                className="w-12 h-8 md:w-20 md:h-16"
                contain
              />
              <div className="text-lg text-white">
                Hơn 5,000 cửa hàng, chủ shop đang sử dụng cảm nhận như thế nào về SOMO? Hãy cùng
                chúng tôi tìm hiểu trong các video sau nhé!
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Swiper
              spaceBetween={50}
              grabCursor
              slidesPerView={"auto"}
              className=""
              loop
              autoplay={{ delay: 3000 }}
            >
              {CUSTOM_REVIEW_LIST.map((item, index) => (
                <SwiperSlide className="w-72 md:w-80" key={index}>
                  <div>
                    <Img src={item.img} className="relative w-72 md:w-80" />
                    <div className="absolute flex items-center justify-center rounded-full w-14 h-14 md:w-20 md:h-20 bg-gradient-to-b from-accent to-primary left-4 bottom-28 md:bottom-24 hover:from-accent hover:to-primary-dark">
                      <i className="text-3xl font-bold text-white md:text-5xl">
                        <RiPlayFill />
                      </i>
                    </div>
                    <div className="p-4 pb-6 -mt-1 text-white border rounded-br-full bg-primary border-primary">
                      <div className="uppercase">{`${item.gender === 0 ? "anh" : "chị"} ${item.name
                        }`}</div>
                      <div className="">{item.position}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <div className="pb-24 xl:pt-10">
        <Newsletter />
      </div>
    </div>
  );
}

const CUSTOM_REVIEW_LIST = [
  {
    id: 1,
    name: "Ngọc Lan",
    gender: 0,
    position: "Chủ thương hiệu Lengrin Story",
    img: "https://i.imgur.com/ayHRAdl.png",
  },
  {
    id: 2,
    name: "Hoàng văn hùng",
    gender: 0,
    position: "Chủ thương hiệu Lengrin Story",
    img: "https://i.imgur.com/J6ZnuAr.png ",
  },
  {
    id: 3,
    name: "Nguyễn hùng hoàng",
    gender: 0,
    position: "Chủ thương hiệu Lengrin Story",
    img: "https://i.imgur.com/KwVtuJR.png",
  },
  {
    id: 4,
    name: "Đỗ Đức Cường",
    gender: 0,
    position: "Chủ thương hiệu Lengrin Story",
    img: "https://i.imgur.com/hAq76cE.png",
  },
  {
    id: 5,
    name: "Mr.Steven",
    gender: 0,
    position: "Chủ thương hiệu Lengrin Story",
    img: "https://i.imgur.com/J6ZnuAr.png",
  },
];
