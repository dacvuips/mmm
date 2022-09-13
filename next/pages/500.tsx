import { NextSeo } from "next-seo";

export default function Page500() {
  const refresh = () => {
    sessionStorage.clear();
    localStorage.clear();
    location.href = location.origin;
  };

  return (
    <>
      <NextSeo title="Có lỗi xảy ra" />
      <div className="flex-center text-center flex-col mx-auto max-w-lg px-8 py-40 text-gray-700">
        <img className="w-20 mb-6" src="/assets/img/warning.svg" />
        <h2 className="mb-2 text-xl font-semibold">Trang web đang gặp vấn đề về kỹ thuật.</h2>
        <h2 className="mb-8 text-xl font-semibold">Xin quý khách thông cảm.</h2>
        <button className="btn-info is-large shadow-md h-12" onClick={refresh}>
          Kiểm tra và chỉnh sửa lỗi
        </button>
      </div>
    </>
  );
}
