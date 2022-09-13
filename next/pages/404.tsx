import { NextSeo } from "next-seo";

export default function Page404() {
  const refresh = () => {
    location.href = location.origin;
  };

  return (
    <>
      <NextSeo title="Không tìm thấy trang" />
      <div className="flex-center text-center flex-col mx-auto max-w-lg px-8 py-40 text-gray-700">
        <img className="w-20 mb-6" src="/assets/img/404.svg" />
        <h2 className="mb-8 text-xl font-semibold">Không tìm thấy trang.</h2>
        <button className="btn-info is-large shadow-md h-12" onClick={refresh}>
          Trở về trang chủ
        </button>
      </div>
    </>
  );
}
