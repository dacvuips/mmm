import SwiperCore, { Autoplay } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { useScreen } from "../../../lib/hooks/useScreen";
import { Brands } from "../../shared/landing-layout/brands";
import { Trial } from "../../shared/landing-layout/trial";
import { Button } from "../../shared/utilities/form";
import { Img } from "../../shared/utilities/misc";
import { AboutUsProvider } from "./provider/about-us-provider";
SwiperCore.use([Autoplay]);
export function AboutUsPage() {
  const md = useScreen("md");
  const sm = useScreen("sm");
  const lg = useScreen("lg");
  const xl = useScreen("xl");
  const xl_2 = useScreen("xxl");
  return (
    <AboutUsProvider>
      <div className="">
        <div className="relative">
          {lg ? (
            <div>
              <img
                src="https://i.imgur.com/SLmbVGA.jpg"
                alt="website_banner"
                className="object-contain w-full -top-20"
              />
              <div className="absolute flex flex-col w-1/2 h-auto gap-4 transform -translate-y-2/3 top-1/2 left-32 lg:left-14 lg:-translate-y-60">
                <div
                  className="text-3xl text-gray-700 uppercase xl:text-5xl"
                  style={{ lineHeight: xl_2 ? "74px" : xl ? "62px" : "58px" }}
                >
                  Hơn 5000 anh chị chủ kinh doanh lĩnh vực ăn uống nhà hàng và thương hiệu nổi bật
                  đang tin dùng hệ thống SOMO
                </div>
                <div className="mt-2 text-lg text-gray-700">
                  Với các giải pháp công nghệ tốt nhất, SOM là tất cả những gì bạn cần để xây dựng
                  công việc kinh doanh bền vững.
                </div>
                <Button
                  text="đăng ký dùng thử"
                  className="py-6 ml-10 uppercase w-60"
                  large
                  primary
                  href="https://3mshop.s1.mcom.app/shop/register"
                  targetBlank
                />
                <div className="ml-10 text-lg font-semibold text-gray-700">
                  Trải nghiệm giải pháp bán hàng đa kênh <br /> miễn phí 14 ngày với SOMO.
                </div>
              </div>
            </div>
          ) : (
            <div>
              <img
                src={md ? "https://i.imgur.com/76P48qE.jpg" : "https://i.imgur.com/DWibcCD.jpg"}
                alt="website_banner"
                className="object-contain w-full"
              />
              <div className="absolute flex flex-col w-full gap-4 px-2 transform -translate-x-1/2 md:px-16 top-16 md:top-24 lg:top-36 left-1/2">
                <div
                  className="text-3xl text-gray-700 uppercase md:text-5xl"
                  style={{ lineHeight: md ? "68px" : "40px" }}
                >
                  Hơn 5000 anh chị chủ kinh doanh lĩnh vực ăn uống nhà hàng và thương hiệu nổi bật
                  đang tin dùng hệ thống SOMO
                </div>
                <div className="mt-1 text-lg text-gray-700 lg:mt-4">
                  Với các giải pháp công nghệ tốt nhất, SOM là tất cả những gì bạn cần để xây dựng
                  công việc kinh doanh bền vững.
                </div>
                <div className="m-auto text-lg font-semibold text-gray-700">
                  Trải nghiệm giải pháp bán hàng đa kênh miễn phí 14 ngày với SOMO.
                </div>
                <Button
                  text="đăng ký dùng thử"
                  className="py-6 m-auto uppercase w-60"
                  large
                  primary
                  href="https://3mshop.s1.mcom.app/shop/register"
                  targetBlank
                />
              </div>
            </div>
          )}
        </div>
        <div className="">
          <div className="py-12 md:py-24 main-container">
            <div className="text-center text-primary">
              <div className="text-lg uppercase">Về chúng tôi</div>
              <div className="px-2 mt-3 text-2xl font-bold text-center lg:px-0">
                Được thành lập từ tháng 1/2022, đến nay 3M Tech đã trở thành công ty công nghệ hàng
                đầu Việt Nam trong lĩnh vực cung cấp các giải pháp chuyên biệt cho ngành F&B
              </div>
            </div>
            <div className="flex flex-col justify-between lg:gap-8 lg:flex-row">
              <Img src="https://i.imgur.com/6bTmbmp.png" className="flex-1" contain />
              <div className="px-2 lg:mt-40 lg:w-6/12 lg:px-0">
                <div className="text-3xl font-bold text-gray-700 md:text-5xl">
                  <div className="uppercase">3m tech</div>
                  <div className="mt-3 md:mt-5">Đơn giản & thuận tiện</div>
                </div>
                <div className="mt-3 text-lg text-gray-700 md:mt-6">
                  Với các giải pháp bán hàng từ 3M Tech, doanh nghiệp và cá nhân có thể vận hành
                  việc kinh doanh trên mọi kênh bán hàng tại một nơi duy nhất. Từ việc quản lý sản
                  phẩm, khách hàng, đơn hàng, tồn kho, giao nhận, marketing, khuyến mãi,... cho đến
                  những bảng báo cáo doanh thu và phân tích hiệu quả kinh doanh đều được thống kê tự
                  động.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary-light">
          <div className="py-12 md:py-24">
            <img src="https://i.imgur.com/gLO5XNv.png" className="w-full main-container" />
          </div>
        </div>
        <div>
          <div className="py-12 md:py-24">
            <div className="bg-white ">
              <div className="text-center main-container">
                <div className="text-3xl font-bold text-gray-700 md:text-5xl">
                  Sứ mệnh & Tầm nhìn
                </div>
                <div className="mt-4 text-lg uppercase md:text-xl text-primary">
                  Ngay từ khi thành lập, 3M Tech đã xác định cho mình sứ mệnh…
                </div>
              </div>
              <div className="flex gap-3 mt-6 md:gap-6 md:mt-16 main-container">
                <div className="flex flex-col w-1/12 gap-2">
                  <img src="https://i.imgur.com/oGAFZLL.png" className="w-16 h-auto" />
                  <div className="w-1 h-full ml-auto md:h-48 bg-primary-dark"></div>
                </div>
                <div className="flex-1 mt-8">
                  <div className="pr-4 text-2xl font-bold text-gray-700 capitalize md:text-3xl lg:p-0">
                    Kiến Tạo Cộng Đồng F&B Thịnh Vượng - Giúp Các Ông Bà Chủ Đi Đến Thành Công Bền
                    Vững Bằng Con Đường Kinh Doanh Đúng Đắn
                  </div>
                  <div className="pr-4 mt-6 leading-8 text-gray-700 lg:p-0">
                    Tháng 9/2021, 3M Tech chính thức cho ra mắt trên thị trường nền tảng quản lý và
                    bán hàng SOMO đầu tiên tại Việt Nam cho ngành F&B.
                    <br />
                    Chủ shop có thể bán hàng trên tất cả các kênh từ website, Facebook, zalo.. cho
                    đến cửa hàng hay chuỗi cửa hàng. <br />
                    Đồng thời, khách hàng và đơn hàng tập trung tại 1 nơi duy nhất giúp các nhà bán
                    hàng giải quyết khó khăn trong quá trình kinh doanh của bạn một cách đơn giản và
                    tinh gọn nhất
                  </div>
                </div>
              </div>
              <div className="w-full my-8 overflow-hidden md:my-16">
                <Swiper
                  slidesPerView={lg ? 4 : md ? 3 : sm ? 2 : 1}
                  slidesPerGroup={md ? 2 : 1}
                  autoplay={{ delay: 3000 }}
                  loop
                  spaceBetween={md ? 36 : 14}
                >
                  {BANNER_LIST.map((item, index) => (
                    <SwiperSlide key={index}>
                      <Img
                        src={item.img}
                        className="w-full border border-gray-100 rounded-md"
                        ratio169
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="flex gap-6 main-container">
                <div className="flex flex-col w-1/12 gap-2">
                  <img src="https://i.imgur.com/oGAFZLL.png" className="w-16 h-auto" />
                  <div className="w-1 h-full ml-auto md:h-72 bg-primary-dark"></div>
                </div>
                <div className="flex-1 mt-8">
                  <div className="text-2xl font-bold capitalize md:text-3xl from-gray-700">
                    Trở thành công ty công nghệ cung cấp nền giải pháp quản lý bán hàng đa kênh hàng
                    đầu trong lĩnh vực F&B
                  </div>
                  <div className="pr-4 mt-6 leading-8 text-gray-700 lg:p-0">
                    3M Tech luôn không ngừng nghiên cứu công nghệ mới để đón đầu xu hướng nhằm mục
                    tiêu năm 2025:
                    <br />
                    Phát triển 3M Tech trở thành công ty công nghệ cung cấp giải pháp quản lý bán
                    hàng đa kênh top 1 trong lĩnh vực F&B được nhà bán hàng đánh giá là hiệu quả và
                    tinh gọn.
                    <br /> Cùng với đó, 3M Tech luôn chú trọng mang lại văn hóa đặc sắc để nhân viên
                    của mình luôn cảm thấy vui vẻ, thoải mái và nỗ lực hết mình trong công việc, gắn
                    bó phát triển cùng công ty.
                    <br /> Và cuối cùng, chúng tôi mong muốn mang lại lợi ít bền vững 2 chiều cho
                    các anh chị kinh doanh F&B và phát triển cộng đồng kinh doanh bền vững mang lại
                    giá trị cho cộng đồng.
                  </div>
                </div>
              </div>
              <div className="w-full my-8 overflow-hidden md:my-16">
                <Swiper
                  slidesPerView={lg ? 4 : md ? 3 : sm ? 2 : 1}
                  slidesPerGroup={md ? 2 : 1}
                  autoplay={{ delay: 3000 }}
                  loop
                  spaceBetween={md ? 36 : 14}
                >
                  {BANNER_LIST.map((item, index) => (
                    <SwiperSlide key={index}>
                      <Img
                        src={item.img}
                        className="w-full border border-gray-100 rounded-md"
                        ratio169
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
            <div className="mt-12 md:mt-24 main-container">
              <div className="text-3xl font-bold text-center text-gray-700 md:text-5xl">
                6 giá trị cốt lõi
              </div>
              <div className="flex flex-col gap-4 px-2 mt-6 lg:flex-row lg:gap-8 md:mt-12 lg:px-0">
                <Img src="https://i.imgur.com/duomVGr.png" className="flex-1" />
                <div className="lg:w-2/3">
                  <div className="grid gap-4 md:gap-8 md:mt-5 md:grid-cols-2">
                    <div className="">
                      <div className="text-lg font-bold uppercase text-primary">1. Trung thực</div>
                      <div className="mt-2 text-gray-700">
                        Trung thực và minh bạch với khách hàng, đối tác và đồng đội.
                      </div>
                    </div>
                    <div className="">
                      <div className="text-lg font-bold uppercase text-primary">
                        4. Nhận trách nhiệm
                      </div>
                      <div className="mt-2 text-gray-700">
                        Đặt mình là gốc rễ của vấn đề để thay đổi kết quả ở tương lại.
                      </div>
                    </div>
                    <div className="">
                      <div className="text-lg font-bold uppercase text-primary">2. Khách hàng</div>
                      <div className="mt-2 text-gray-700">
                        Lợi ích và trải nghiệm của khách hàng là thước đo cho sự thành công của
                        chúng tôi.
                      </div>
                    </div>
                    <div className="">
                      <div className="text-lg font-bold uppercase text-primary">
                        5. Tinh thần đồng đội
                      </div>
                      <div className="mt-2 text-gray-700">
                        Tôn trọng, tin cậy & hỗ trợ đồng đội.
                      </div>
                    </div>
                    <div className="">
                      <div className="text-lg font-bold uppercase text-primary">
                        3. Sáng tạo đột phá
                      </div>
                      <div className="mt-2 text-gray-700">
                        Sáng tạo đột phá trong suy nghĩ, trong cách làm.
                      </div>
                    </div>
                    <div className="">
                      <div className="text-lg font-bold uppercase text-primary">6. Cam kết</div>
                      <div className="mt-2 text-gray-700">
                        Hoàn thành trọng vẹn những gì mà mình cam kết.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-hidden h-14 md:h-24 xl:h-36 2xl:h-40">
          <div className="relative">
            <Img
              noImage
              className="absolute bg-primary-light -left-1/2 "
              style={{ width: "200%", borderRadius: "50%" }}
              percent={60}
            />
          </div>
        </div>
        <div className="bg-primary-light">
          <div className="flex flex-col pb-12 main-container">
            <div className="text-3xl font-bold text-center text-gray-700 md:text-5xl">
              Thành quả hiện tại
            </div>
            <div className="flex flex-col gap-4 mt-4 lg:flex-row md:mt-8">
              <div className="flex-1 p-4 bg-primary-light">
                <div className="h-6 mr-12 lg:h-8 bg-primary"></div>
                <div className="flex">
                  <div className="w-6 mb-12 lg:w-8 bg-primary"></div>
                  <div className="flex-1 p-4 bg-white text-primary">
                    <div className="text-lg leading-9 uppercase border-b-4 lg:w-5/12 border-primary">
                      thành quả hiện tại
                    </div>
                    <div className="mt-4">
                      Năm 2020, các giải pháp công nghệ của 3M Tech đã được hơn 5.000 người kinh
                      doanh & 300 thương hiệu bậc nhất tại Việt Nam tin dùng làm nền tảng để tăng
                      trưởng kinh doanh trong thời đại số và giải pháp bán hàng số 1 vượt bão
                      COVID-19
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-2 pb-3 text-gray-700 md:p-4 lg:w-1/2">
                <div className="">
                  Và chúng tôi tin rằng con số đó sẽ còn tăng mạnh mẽ hơn nữa trong những năm tiếp
                  theo.
                </div>
                <div className="">
                  Các giải pháp của 3M Tech cũng đã được triển khai trên toàn Việt Nam. Mục tiêu
                  tiếp theo của chúng tôi là mở rộng và phát triển thành hệ thống ứng dụng mạnh mẽ
                  nhất cho lĩnh vực F&B.
                </div>
                <div className="">
                  3M Tech cũng hân hạnh trở thành đối tác chiến lược của Amazon và Momo trong mảng
                  giải pháp công nghệ kinh doanh & Marketing và thanh toán trực tuyến.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="">
          <div className="py-12 md:py-24">
            <div className="text-center main-container">
              <div className="text-xl uppercase text-primary">
                Không chỉ là nền tảng quản lý bán hàng được sử dụng nhiều nhất Việt Nam
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-700 md:text-5xl">
                SOMO tạo ra hệ sinh thái hỗ trợ tăng trưởng kinh doanh toàn diện{" "}
              </div>
            </div>
            <img className="w-full mt-12" src="https://i.imgur.com/ETeqrd1.jpg" />
          </div>
        </div>
        <Trial />
        <div className="pb-20 lg:pb-0">
          <Brands />
        </div>
      </div>
    </AboutUsProvider>
  );
}
const BANNER_LIST = [
  {
    img: "https://i.imgur.com/3nvyaX9.png",
  },
  {
    img: "https://i.imgur.com/AYQuW0z.png",
  },
  {
    img: "https://i.imgur.com/WTMYaoG.png",
  },
  {
    img: "https://i.imgur.com/pvOFJM4.png",
  },
  {
    img: "https://i.imgur.com/aTZgRtk.png",
  },
  {
    img: "https://i.imgur.com/2bMZaD4.png",
  },
];
