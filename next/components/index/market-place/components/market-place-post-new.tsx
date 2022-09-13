import { MarketPlacePost } from "./market-place-post";

export function MarketPlacePostNew() {
  return (
    <div className="py-5 my-8 bg-white">
      <div className="main-container">
        <div className="my-2 text-2xl font-semibold text-center">Các tin tức mới nhất</div>
        <div className="mb-5 text-sm text-center text-gray-500">
          Chia sẻ kinh nghiệm quản lý và bán hàng đa kênh thiết thực nhất
        </div>
        <div className="grid grid-cols-1 gap-6 my-8 xl:grid-cols-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((item, index) => (
            <MarketPlacePost key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
