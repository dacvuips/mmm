import { MarketPlacePost } from "./market-place-post";

export function MarketPlacePostSale() {
  return (
    <div className="my-8 main-container">
      <div className="my-2 text-2xl font-semibold text-center">
        Thông tin mới nhất từ các thương hiệu hàng đầu
      </div>
      <div className="mb-5 text-sm text-center text-gray-500">
        Cơ hội hợp tác nhượng quyền chia sẻ lợi nhuận cùng các thương hiệu top 1 thị trường
      </div>
      <div className="grid grid-cols-1 gap-6 my-8 xl:grid-cols-4 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
          <MarketPlacePost key={index} />
        ))}
      </div>
    </div>
  );
}
