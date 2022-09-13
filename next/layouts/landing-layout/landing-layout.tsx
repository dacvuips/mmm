import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { LandingHead } from "./components/landing-head";

export function LandingLayout({ ...props }) {
  return (
    <div
      className="relative min-h-screen text-gray-700 bg-white"
      style={{
        fontFamily: "Lato",
      }}
    >
      <>
        <LandingHead />
        <Header tabs={headerTabs} isHeaderTransparent={props.isHeaderTransparent} />
        <div className={`min-h-screen bg-white`}>{props.children}</div>
        <Footer tabs={headerTabs} backgroundFooterColor={props.backgroundFooterColor} />
      </>
    </div>
  );
}
const headerTabs = [
  {
    title: "Trang chủ",
    href: "/3MMarketing",
  },
  {
    title: "Về chúng tôi",
    href: "/3MMarketing/about-us",
  },
  {
    title: "Sản phẩm, Dịch vụ",
    subTabs: [
      {
        title: "Website quản lý",
        href: "/3MMarketing/website",
      },
      {
        title: "App quản lý",
        href: "/3MMarketing/app",
      },
      {
        title: "Bảng giá dịch vụ",
        href: "/3MMarketing/product-service",
      },
    ],
  },
  {
    title: "Blog",
    subTabs: [
      {
        title: "Hướng dẫn",
        href: "https://nguyenhung-3mmarketing.gitbook.io/huong-dan-su-dung-somo/",
      },
      {
        title: "Tin tức",
        href: "/3MMarketing/news",
      },
      {
        title: "Học viện",
        href: "/3MMarketing/academy",
      },
    ],
  },
  {
    title: "Liên hệ",
    subTabs: [
      {
        title: "Tuyển dụng",
        href: "/3MMarketing/recruit",
      },
      {
        title: "Đối tác",
        href: "/3MMarketing/partner",
      },
    ],
  },
];
