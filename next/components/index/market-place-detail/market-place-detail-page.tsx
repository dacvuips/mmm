import Link from "next/link";
import React from "react";
import { AiOutlineMail, AiOutlineSend } from "react-icons/ai";
import { FaCircle, FaPhoneAlt } from "react-icons/fa";
import { DefaultFooterDesktop } from "../../../layouts/defalut-footer-desktop";
import { formatDate } from "../../../lib/helpers/parser";
import { Button, Field, Form, Input, Select, Textarea } from "../../shared/utilities/form";
import { Img } from "../../shared/utilities/misc";
import { PaginationComponent } from "../../shared/utilities/pagination/pagination-component";
import { ShopsHeaderDesktop } from "../shops/components/shops-header-desktop";
import { MarketPlaceDetailContact } from "./components/market-place-detail-contact";
import { MarketPlaceDetailReadMore } from "./components/market-place-detail-read-more";
import { MarketPlaceNewPost } from "./components/market-place-new-post";

type Props = {};

export function MarketPlaceDetailPage({ }: Props) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 20,
      behavior: "smooth",
    });
  };
  return (
    <>
      <ShopsHeaderDesktop />
      <div className="min-h-screen mt-20 main-container">
        <div className="my-4">
          <div className="text-2xl font-semibold">
            Cryptocurrency Coin98 to be listed in world's second biggest exchange
          </div>
          <div className="flex flex-row items-center my-2 text-gray-500">
            {" "}
            Tác giả <span className="mx-1 font-semibold text-primary "> Admin</span> |{" "}
            {formatDate("02/01/2021", "dd-MM-yyyy")}
          </div>
        </div>
        <div className="flex flex-col justify-between lg:flex-row ">
          <div className="w-2/3">
            <div
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            ></div>
            <div
              className="flex justify-center text-center underline cursor-pointer text-primary"
              onClick={() => {
                scrollToTop();
              }}
            >
              Lên đầu trang
            </div>
            <CommentPostForm />
          </div>
          <div className="flex-1 ml-5">
            <div className="p-5 rounded-md" style={{ background: "#E6EDF4" }}>
              <div className="text-lg font-semibold">Đăng ký tư vấn và hỗ trợ</div>
              <div className="my-3 text-gray-500">
                Hãy điền các thông tin liên hệ, chúng tôi sẽ liên hệ và giải đáp các thắc mắc của
                bạn trong thời gian sớm nhất.
              </div>
              <Form>
                <Field name="name" label="">
                  <Input placeholder="Họ tên" />
                </Field>
                <Field name="name" label="">
                  <Input placeholder="Công ty" />
                </Field>
                <Field>
                  <Textarea name="" placeholder="Nội dung cần liên hệ" rows={3} />
                </Field>
                <Button text="Gửi thông tin" className="w-full rounded-xl" primary submit />
              </Form>
            </div>
            <MarketPlaceNewPost />
          </div>
        </div>
        <div className="flex justify-between py-10">
          <div className="w-2/3">
            <ReadMorePosts />
          </div>
          <div className="flex-1 ml-5">
            <MarketPlaceNewPost />
          </div>
        </div>

        {/* <MarketPlaceDetailContact /> */}
        {/* <MarketPlaceDetailReadMore /> */}
      </div>
      <DefaultFooterDesktop />
    </>
  );
}

function CommentPostForm() {
  return (
    <div className="my-5">
      <Form>
        <Field name="name" label="Bình luận">
          <Textarea name="" placeholder="Nội dung bình luận..." rows={3} className="bg-blue-50" />
        </Field>
        <Button text="Bình luận bài viết" submit className="rounded-md" primary />
      </Form>

      <div className="my-5">
        <div onClick={() => { }} className="font-semibold cursor-pointer text-primary">
          Xem tất cả bình luận (20)
        </div>
      </div>
    </div>
  );
}

function ReadMorePosts() {
  return (
    <div>
      <div className="my-3 text-xl font-semibold ">Đọc thêm bài viết</div>
      <div className="flex flex-col ">
        {[1, 2, 3, 4, 5, 6].map((item, index) => (
          <Link href="" key={index}>
            <a>
              <div className="flex flex-row justify-between mb-5">
                <Img
                  src="/assets/default/default.png"
                  ratio169
                  className="rounded-md shadow w-96"
                />
                <div className="ml-3">
                  <div className="font-semibold text-ellipsis-2">
                    Cryptocurrency Coin98 to be listed in world's second biggest
                  </div>
                  <div className="text-sm text-gray-400 text-ellipsis-3">
                    Coin98 is set to become the second Vietnam blockchain app after Axie Infinity to
                    have its ... Coin98 is set to become the second Vietnam blockchain app after
                    Axie Infinity to have its
                  </div>
                  <div className="flex flex-row items-center text-gray-400 test-sm">
                    Admin <FaCircle className="mx-2 text-[9px]" /> 7 hours ago
                  </div>
                </div>
              </div>
            </a>
          </Link>
        ))}
        <PaginationComponent
          limit={5}
          total={15}
          page={1}
          onPageChange={(page) => { }}
          className="flex justify-center rounded-md "
        />
      </div>
    </div>
  );
}

export const content = `
  <h2 style=\"margin-left:0px;\"><strong>Việt Nam phát hiện ca nhiễm Omicron đầu tiên</strong></h2><p style=\"margin-left:0px;\">&nbsp;</p><p style=\"margin-left:0px;\">Trưa 28/12, Thứ trưởng Y tế Nguyễn Trường Sơn cho biết, một người về từ Anh 9 hôm trước, cách ly tại Bệnh viện Trung ương Quân đội 108, được xác định nhiễm biến chủng Omicron.</p><p style=\"margin-left:0px;\">Đây là trường hợp nhiễm Omicron đầu tiên Việt Nam ghi nhận. \"Bộ Y tế đã báo cáo sự việc với Chính phủ\", Thứ trưởng Sơn nói với <i>VnExpress.</i></p><p style=\"margin-left:0px;\">Người này nhập cảnh sân bay Nội Bài (Hà Nội) hôm 19/12, test nhanh dương tính với nCoV, được đưa bằng xe chuyên dụng về khu cách ly của Bệnh viện Trung ương Quân đội 108. Do người này có yếu tố dịch tễ trở về từ Anh nên bệnh viện giải trình tự gene mẫu bệnh phẩm hôm 20/12 và 21/12 - kết quả xác định nhiễm biến chủng Omicron (B.1.1.529).</p><p style=\"margin-left:0px;\">Giữa tháng 12, Bộ Y tế yêu cầu các địa phương rà soát người nhập cảnh từ 28/11, xét nghiệm dương tính với nCoV, lấy mẫu để giải trình tự gene virus xác định biến chủng, giám sát và phòng chống. Nếu ghi nhận người dương tính với chủng này, các tỉnh tiếp tục rà soát, lấy mẫu xét nghiệm người tiếp xúc gần, gửi các Viện Vệ sinh dịch tễ hoặc Pasteur để xét nghiệm, giải trình tự gene virus.</p><p style=\"margin-left:0px;\">Các địa phương cũng được khuyến cáo tăng cường giám sát ca bệnh có diễn biến, đặc điểm bất thường, phối hợp Viện Vệ sinh Dịch tễ hoặc Pasteur lấy mẫu giám sát, phát hiện sớm các ổ dịch, chùm ca bệnh.</p><p style=\"margin-left:0px;\">Bộ Y tế nhắc nhở các Viện Vệ sinh Dịch tễ, Viện Pasteur tập huấn về bảo quản, điều tra, vận chuyển mẫu dương tính cho nhân viên y tế; tiếp nhận các mẫu bệnh phẩm nghi ngờ, có nguy cơ mắc biến thể Omicron để giải trình tự gene virus. Kết quả giải trình tự gene được cập nhật lên <i>Global Science Initiative and Primary Source</i> (GISAID - Nền tảng chia sẻ dữ liệu gên virus cúm và virus Corona gây đại dịch Covid-19) để chia sẻ và tiếp nhận thông tin về các biến chủng.</p><p style=\"margin-left:0px;\">Việt Nam đang triển khai nhanh tiêm vaccine để tăng độ bao phủ mũi hai và tiêm nhắc mũi 3.</p><p style=\"margin-left:0px;\">Biến chủng Omicron được ghi nhận đầu tiên tại Nam Phi vào cuối tháng 11, được cho là tốc độ lây nhiễm nhanh hơn chủng Delta và có thể lẩn tránh vaccine. Đến nay, biến chủng này đã xuất hiện ở nhiều quốc gia và vùng lãnh thổ trên thế giới như Mỹ, Anh, Australia, Nhật Bản, Hàn Quốc, Singapore, Malaysia, Ấn Độ... Tổ chức Y tế thế giới (WHO) xác định đây là biến chủng đáng lo ngại do gây ra sự thay đổi bất lợi trong dịch tễ học Covid-19, nhiều khả năng Omicron sẽ lây lan ở mức độ toàn cầu.</p><p style=\"margin-left:0px;text-align:center;\">&nbsp;</p><figure class=\"image image_resized\" style=\"width:670px;\"><img src=\"https://i1-suckhoe.vnecdn.net/2021/12/28/huy-4091-1640668981-2990-1640669007.jpg?w=680&amp;h=0&amp;q=100&amp;dpr=1&amp;fit=crop&amp;s=-tJQ04Fy_H2NgiFxRUOa_Q\" alt=\"Hành khách lấy mẫu xét nghiệm tại sân bay Nội Bài (Hà Nội). Ảnh: Giang Huy\"></figure><p style=\"margin-left:0px;text-align:center;\">Hành khách lấy mẫu xét nghiệm tại sân bay Nội Bài (Hà Nội). Ảnh: <i>Giang Huy</i></p>
`;
