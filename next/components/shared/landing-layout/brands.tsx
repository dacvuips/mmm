import { Button } from "../utilities/form/button";

const brands = [
  { image: "https://i.imgur.com/1suXaF2.png" },
  { image: "https://i.imgur.com/e8HJxXa.png" },
  { image: "https://i.imgur.com/RQo6Jpv.png" },
  { image: "https://i.imgur.com/4tlZABE.png" },
  { image: "https://i.imgur.com/httoTqN.png" },
  { image: "https://i.imgur.com/KTZ1pvt.png" },
  { image: "https://i.imgur.com/K4z2Xky.png" },
  { image: "https://i.imgur.com/AxasX2D.png" },
  { image: "https://i.imgur.com/rbFmBsN.png" },
  { image: "https://i.imgur.com/GHacfwb.png" },
  { image: "https://i.imgur.com/cKLaEp8.png" },
  { image: "https://i.imgur.com/cRpWL3F.png" },
  { image: "https://i.imgur.com/bGVs3KS.png" },
  { image: "https://i.imgur.com/Wiu70Bd.png" },
  { image: "https://i.imgur.com/twt7jeL.png" },
  { image: "https://i.imgur.com/hoErPZw.png" },
  { image: "https://i.imgur.com/rrkrCzb.png" },
  { image: "https://i.imgur.com/qtVKIsU.png" },
  { image: "https://i.imgur.com/bMTmev7.png" },
  { image: "https://i.imgur.com/oVMJyMc.png" },
  { image: "https://i.imgur.com/QYqHvVK.png" },
  { image: "https://i.imgur.com/TdztZCD.png" },
  { image: "https://i.imgur.com/pBrhePt.png" },
  { image: "https://i.imgur.com/60URfGL.png" },
  { image: "https://i.imgur.com/mgQPznE.png" },
];

export function Brands() {
  return (
    <div className="flex flex-col items-center py-12 text-center md:py-24 main-container">
      <h3 className="mt-3 mb-4 text-3xl font-bold md:text-5xl">
        Được tin dùng bởi hơn 50.000 nhà kinh doanh
      </h3>
      <div className="mb-10 text-gray-700">
        Không ngừng gia tăng thu nhập của bạn với chính sách đặc quyền dành cho đại lý của 3M
        Marketing
      </div>
      <div className="grid flex-wrap items-center justify-center grid-cols-3 gap-2 lg:flex md:gap-3">
        {brands.map((brand, idx) => (
          <div className="p-2" key={idx}>
            <img src={brand.image} />
          </div>
        ))}
      </div>
      <Button
        className="mt-6 uppercase rounded-full bg-primary"
        primary
        text="Dùng thử ngay"
        large
      />
    </div>
  );
}
