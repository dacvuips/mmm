import { AiOutlineRight } from "react-icons/ai";
import SwiperCore, { Autoplay, Pagination } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { useScreen } from "../../../lib/hooks/useScreen";
import { SocialNetwork } from "../../shared/landing-layout/social-networks";
import { Trial } from "../../shared/landing-layout/trial";
import { Button } from "../../shared/utilities/form/button";
import { Img, NotFound, Spinner } from "../../shared/utilities/misc";
import { LadingHomeProvider, useLadingHomeContext } from "./provider/landing-home-provider";
SwiperCore.use([Pagination, Autoplay]);

interface Propstype extends ReactProps {}

export function HomePage(props: Propstype) {
  const md = useScreen("md");
  const lg = useScreen("lg");

  return (
    <LadingHomeProvider>
      <div className="flex flex-col my-12 md:my-24">
        <div className="relative">
          <div className="flex flex-col items-center pb-24 main-container md:flex-row">
            <div className="flex-1 pt-10 pl-8 pr-4 text-center xl:pr-0 xl:pl-0 md:text-left">
              <div className="uppercase">
                <div className="text-2xl text-gray-700 md:text-4xl">giải pháp kinh doanh</div>
                <div className="mt-3 text-3xl font-black leading-10 text-gray-700 md:mt-6 md:text-6xl">
                  Ẩm thực tinh gọn
                </div>
              </div>
              <div className="mt-3 mb-4 text-base text-gray-700 capitalize md:text-lg md:mt-5 md:mb-7">
                Bán hàng tự động - Không lo chiết khấu
                <div className="mt-2">Nhanh - gọn - lẹ. Chủ quán khỏe, khách hàng vui</div>
                <div className="mt-2">Quy trình khép kín - Dữ liệu trong tay</div>
              </div>
              <Button
                text="Đăng ký dùng thử"
                primary
                className="h-12 px-10 py-3 mt-2 font-bold uppercase transition-all rounded-full shadow-reversed hover:shadow-md"
                href="https://3mshop.s1.mcom.app/shop/register"
                targetBlank
              />
              <div className="mt-3 text-gray-500">
                Hãy liên hệ với chúng tôi để được tư vấn giải pháp tối ưu
              </div>
            </div>
            <Img
              src="https://i.imgur.com/z95n8O1.png"
              className="w-4/5 mt-8 md:w-2/5 md:mt-0"
              contain
            />
            <div className="absolute transform -translate-y-1/2 top-1/2 left-4 md:left-6 lg:left-8 xl:left-12 2xl:left-28">
              <SocialNetwork />
            </div>
          </div>
        </div>
        <News />
        <div className="">
          <div className="py-12 lg:py-24 main-container">
            <div className="flex flex-col-reverse items-center justify-between gap-10 lg:flex-row lg:gap-20">
              <div className="flex-1">
                <div className="text-base text-center uppercase md:text-lg text-primary lg:text-left">
                  bán hàng tự động - không lo chiết khấu
                </div>
                <div className="my-3 text-3xl font-bold text-center text-gray-700 md:my-6 md:text-5xl lg:text-left">
                  Bán bao nhiêu
                  <div className="mt-2 md:mt-4">Bỏ túi bấy nhiêu</div>
                </div>
                <div className="text-base text-gray-700">
                  Giúp bạn sở hữu cho mình mô hình kinh doanh ẩm thực tinh gọn trên online với đầy
                  đủ tính năng bán hàng, quản lí một cách tự động, chuyên nghiệp trên một hệ thống.
                  <div className="mt-4">
                    Hoàn toàn không phát sinh bất cứ chi phí chiết khấu nào trên lượng đơn hàng bán
                    ra.
                  </div>
                  <div className="mt-4">
                    Kết nối với đơn vị vận chuyển để xử lí việc giao hàng hoàn toàn tự động
                  </div>
                </div>
              </div>
              <Img src="https://i.imgur.com/rWSFLfw.png" contain className="w-full lg:w-7/12" />
            </div>
            <div className="flex flex-col items-center justify-between gap-10 mt-10 lg:flex-row lg:gap-20">
              <Img src="https://i.imgur.com/HjEMelD.png" contain className="w-full lg:flex-1" />
              <div className="lg:w-7/12">
                <div className="text-base text-center uppercase md:text-lg text-primary lg:text-left">
                  Nhanh - Gọn - Lẹ.
                  <div className="mt-1"> Chủ Quán Khoẻ, Khách Hàng Vui </div>
                </div>
                <div
                  className="my-3 text-3xl font-bold text-center text-gray-700 md:my-6 md:text-5xl lg:text-left"
                  style={{ lineHeight: md ? "62px" : "40px" }}
                >
                  Bán hàng đa kênh.
                  <div className="mt-1">Quản lý tập trung trên duy nhất 1 nền tảng.</div>
                </div>
                <div className="text-base text-gray-700">
                  Việc thiết lập cửa hàng, quản lí doanh số bán hàng, triển khai các chiến dịch ưu
                  đãi vô cùng thuận tiện giúp chủ quán dễ dàng làm chủ toàn bộ hệ thống trong vòng
                  30 phút
                  <div className="mt-4">
                    Giao diện cửa hàng thân thiện, với các tính năng vượt trội mang lại trải nghiệm
                    ấn tượng cho khách hàng. Giúp gia tăng tỉ lệ chuyển đổi và tần suất mua hàng
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse items-center justify-between gap-10 lg:flex-row lg:gap-20">
              <div className="lg:flex-1">
                <div className="text-lg text-center uppercase text-primary lg:text-left">
                  Quy Trình Khép Kín - Dữ Liệu Trong Tay
                </div>
                <div
                  className="my-3 text-3xl font-bold text-center text-gray-700 md:my-6 md:text-5xl lg:text-left"
                  style={{ lineHeight: md ? "62px" : "40px" }}
                >
                  Tối đa tần suất mua hàng với Somoloyalty
                </div>
                <div className="text-base text-gray-700">
                  Thiết kế chương trình khuyến mãi dễ dàng,tối đa tần suất mua hàng với Somoloyalty
                  <div className="mt-4">
                    Hình thành quy trình khép kín từ thu hút đến bán hàng, giao hàng, chăm sóc khách
                    hàng.
                  </div>
                  <div className="mt-4">
                    Đồng thời, giúp bạn sở hữu dữ liệu khách hàng để tối ưu và khai thác được giá
                    trị trọn đời trên mỗi khách hàng có được
                  </div>
                </div>
              </div>
              <Img src="https://i.imgur.com/u50LjlJ.png" contain className="w-full lg:w-7/12" />
            </div>
          </div>
        </div>
        <div className="bg-primary-light">
          <div className="py-12 lg:py-24 main-container">
            <div className="flex flex-col-reverse items-stretch justify-between gap-8 lg:flex-row lg:gap-20">
              <Img
                src="https://i.imgur.com/3Fm4UIW.png"
                className="w-1/2 m-auto lg:w-full lg:m-0 lg:flex-1"
                contain
              />
              <div className="flex flex-col justify-center gap-2 lg:gap-4 xl:gap-6 lg:w-3/5">
                <div className="">
                  <img
                    src="https://i.imgur.com/j2T9UHb.png"
                    className="w-12 h-auto mt-4 mb-5 ml-6 text-gray-800 lg:mt-8 lg:w-20"
                    alt="dau-nhay"
                  />
                  <div className="text-base text-gray-700">
                    Hệ thống quản lý kinh doanh tin gọn của SOMO được chúng tôi triển khai đang áp
                    dụng trên toàn quốc, phối hợp với hệ thống hơn 400 cửa hàng bán lẻ để khai thác
                    lợi thế mô hình Omnichannel.
                  </div>
                </div>
                <div className="mt-6 lg:mt-0">
                  <div className="mb-2 font-bold text-gray-700">Ông Lê Hoàn Hải</div>
                  <div className="font-bold capitalize text-primary">
                    Giám đốc bán lẻ và thương mại điện tử SOMO
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full mt-6 overflow-hidden md:mt-12">
              <Swiper
                autoplay={{ delay: 3000 }}
                loop
                spaceBetween={md ? 32 : 20}
                grabCursor
                slidesPerGroup={md ? 2 : 1}
                slidesPerView={lg ? 4 : md ? 3 : 2}
                className="py-1"
              >
                {BANNER_LIST.map((item, index) => (
                  <SwiperSlide key={index}>
                    <Img
                      src={item.img}
                      ratio169
                      className="border border-gray-100 rounded-md lg:w-full"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
        <div className="">
          <div className="relative py-12 lg:py-24 main-container">
            <img
              className="absolute left-0 z-0 object-contain w-full pointer-events-none top-20"
              src="/assets/img/landing/homepage3.png"
            />
            <div className="text-center uppercase md:text-lg text-primary lg:text-left">
              3M TECH - Giải pháp bạn cần để quản lý & bán hàng tốt hơn
            </div>
            <h3 className="mt-2 mb-6 text-3xl font-bold text-center text-gray-700 md:mt-4 md:mb-20 md:text-5xl lg:text-left">
              Sản phẩm của chúng tôi
            </h3>
            <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 md:gap-14">
              {PRODUCT_LIST.map((product, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between p-6 transition-all bg-white border border-gray-300 shadow-md hover:border-primary hover:shadow-lg rounded-3xl"
                >
                  <div className="relative flex flex-col items-center gap-4 lg:flex-row">
                    <Img src={product.img} className="w-28 lg:flex-1" contain />
                    <div className="text-center lg:w-3/4 lg:text-left">
                      <div className="text-xl font-bold uppercase text-primary">{product.name}</div>
                      <div className="mt-1 text-gray-700">{product.title}</div>
                    </div>
                    <div className="absolute w-40 h-1 rounded-full left-10 lg:left-0 -bottom-4 bg-primary"></div>
                  </div>
                  <div className="mt-8 text-gray-700">{product.desc}</div>
                  <div className="flex items-center justify-between mt-6 md:mt-10">
                    <Button
                      text="Dùng thử"
                      primary
                      className="h-12 px-5 font-bold uppercase rounded-full bg-primary"
                    />
                    <Button
                      text="Chi tiết"
                      iconPosition="end"
                      icon={<AiOutlineRight />}
                      className="px-0 text-gray-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Trial />
        <div className="bg-primary-light">
          <div className="pt-12 pb-16 text-center lg:py-24 main-container">
            <div className="text-lg uppercase text-primary">
              Những điều thú vị và thành quả mà chúng tôi muốn được chia sẻ với các bạn.
            </div>
            <div className="mt-2 mb-10 text-5xl font-bold text-gray-700 md:mt-4 md:mb-20">
              Insight SOMO
            </div>
            <div className="relative z-10 grid grid-flow-row grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-14 md:auto-rows-fr">
              {INSIGHT_LIST.map((item, index) => (
                <div
                  key={index}
                  className="p-6 transition-all bg-white border border-gray-300 shadow-md hover:border-primary hover:shadow-lg rounded-3xl"
                >
                  <img src={item.img} className="w-20 mx-auto" />
                  <h5 className="pt-5 text-lg font-bold uppercase">{item.title}</h5>
                  <div className="py-3 text-left text-gray-700 md:py-6">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LadingHomeProvider>
  );
}
function News() {
  const md = useScreen("md");
  const xl = useScreen("xl");
  const { posts } = useLadingHomeContext();

  return (
    <div className="flex flex-col items-center pt-12 md:pb-12 lg:py-24 bg-gradient-to-b from-accent to-primary">
      <div className="main-container">
        <div className="text-center text-white uppercase md:text-lg xl:text-left">
          Xây dựng mô hình kinh doanh
        </div>
        <h3 className="mt-3 mb-8 text-3xl font-bold text-center text-white md:mb-12 md:text-5xl xl:text-left">
          Ẩm thực tinh gọn với hệ thống SOMO
        </h3>
        {posts ? (
          posts.length > 0 ? (
            <Swiper
              slidesPerView={xl ? 3 : md ? 2 : 1}
              spaceBetween={40}
              className="w-full"
              autoplay={{ delay: 3000 }}
              loop
              grabCursor
            >
              {posts.map((post, index) => (
                <SwiperSlide key={index}>
                  <div className="flex flex-col items-center overflow-hidden ">
                    <div className="relative group 2xl:w-96 2xl:h-96 md:w-80 md:h-80 w-72 h-72">
                      <Img
                        src={post.featureImage}
                        className={`cursor-pointer 
                        md:w-full shadow-md border border-gray-200 transition opacity-100 group-hover:opacity-70 overflow-hidden rounded-3xl`}
                        imageClassName="scale-100 group-hover:scale-110 transform transition"
                      />
                      <Button
                        primary
                        className={`uppercase absolute w-44 md:w-60 h-16 md:h-14 p-4  font-bold transform -translate-y-6 rounded-full bg-primary top-1/2 left-1/2 -translate-x-20 md:-translate-x-28 opacity-0 group-hover:opacity-100 ease-in-out duration-300`}
                        text="Đăng ký dùng thử"
                        targetBlank
                        href="https://3mshop.s1.mcom.app/shop/register"
                      />
                    </div>
                    <h5 className="mt-4 mb-2 text-xl font-semibold text-center text-white uppercase">
                      {post.title}
                    </h5>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <NotFound text="Tin tức đang được cập nhật" />
          )
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
}

const BANNER_LIST = [
  {
    id: 1,
    img: "https://i.imgur.com/8eDpw9K.png",
  },
  {
    id: 2,
    img: "https://i.imgur.com/vnyXOz3.png",
  },
  {
    id: 3,
    img: "https://i.imgur.com/VK4Adx6.png",
  },
  {
    id: 4,
    img: "https://i.imgur.com/u8NgwA0.png",
  },
  {
    id: 5,
    img: "https://i.imgur.com/1A3eOO4.png",
  },
  {
    id: 6,
    img: "https://i.imgur.com/DNyRZnj.png",
  },
  {
    id: 7,
    img: "https://i.imgur.com/2TYSHia.png",
  },
];
const PRODUCT_LIST = [
  {
    name: "somo connect",
    title: "Phần mềm quản lý bán hàng tốt nhất cho doanh nghiệp của bạn",
    img: "https://i.imgur.com/SOskYK7.png",
    desc:
      "We will pair your business with influencers that speak to your audience. Influencer Marketing is the most effective way to reach a loyal audience.",
  },
  {
    name: "somo tool 2.0",
    title: "Phần mềm quản lý bán hàng tốt nhất cho doanh nghiệp của bạn",
    img: "https://i.imgur.com/rwKMhoi.png",
    desc:
      "Our ad campaigns will bring you the results your looking for. From brand awareness campaigns to lead funnels, we have got the tools to create the right ads for your business. Our re-targeting campaigns will be sure to get your visitors coming back to your site.",
  },
  {
    name: "somo customer",
    title: "Phần mềm quản lý bán hàng tốt nhất cho doanh nghiệp của bạn",
    img: "https://i.imgur.com/tIZZvpJ.png",
    desc:
      "We can create and provide your company with the best content marketing for your socials to improve online presence. Creating valuable and quality content helps boost conversions and improve customer retention.",
  },
  {
    name: "somo customer",
    title: "Phần mềm quản lý bán hàng tốt nhất cho doanh nghiệp của bạn",
    img: "https://i.imgur.com/tIZZvpJ.png",
    desc:
      "We can create and provide your company with the best content marketing for your socials to improve online presence. Creating valuable and quality content helps boost conversions and improve customer retention.",
  },
  {
    name: "somo tool 2.0",
    title: "Phần mềm quản lý bán hàng tốt nhất cho doanh nghiệp của bạn",
    img: "https://i.imgur.com/rwKMhoi.png",
    desc:
      "Our ad campaigns will bring you the results your looking for. From brand awareness campaigns to lead funnels, we have got the tools to create the right ads for your business. Our re-targeting campaigns will be sure to get your visitors coming back to your site.",
  },
  {
    name: "somo connect",
    title: "Phần mềm quản lý bán hàng tốt nhất cho doanh nghiệp của bạn",
    img: "https://i.imgur.com/SOskYK7.png",
    desc:
      "We will pair your business with influencers that speak to your audience. Influencer Marketing is the most effective way to reach a loyal audience.",
  },
];
const INSIGHT_LIST = [
  {
    img: "https://i.imgur.com/8CIhnU4.png",
    title: "Cùng google",
    desc:
      "SOMO là đối tác công nghệ đầu tiên tại Việt Nam vinh dự được Google đề xuất là Nền tảng cho Nhà bán lẻ, cung cấp hình thức Google Smart Shopping giúp doanh nghiệp tiếp cận hàng triệu người tìm kiếm thông tin mua sắm mỗi ngày trên các nền tảng của Google.",
  },
  {
    img: "https://i.imgur.com/8CIhnU4.png",
    title: "Cùng Facebook",
    desc:
      "Được chứng nhận là Facebook Marketing Partner năm 2018 và đối tác Việt Nam duy nhất nằm trong danh sách nhà phát triển nền tảng công nghệ hỗ trợ kinh doanh trên Facebook Messenger.",
  },
  {
    img: "https://i.imgur.com/8CIhnU4.png",
    title: "Chuỗi đào tạo",
    desc:
      "Chuỗi đào tạo do VECOM - Google - SOMO xây dựng nhằm hỗ trợ doanh nghiệp nâng cao kỹ năng số, kỹ năng kinh doanh & marketing để phát triển thương mại điện tử vượt trội, chuyên sâu.",
  },
];
