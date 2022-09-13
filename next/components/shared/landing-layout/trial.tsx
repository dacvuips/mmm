import { Button } from "../utilities/form/button";

export function Trial() {
  return (
    <div className="bg-primary-dark">
      <div className="py-8 md:py-14 main-container">
        <div className="text-3xl font-bold text-center text-white md:text-5xl">
          Dùng thử 3M Marketing hôm nay
        </div>
        <div className="mt-8 text-center">
          <Button
            text="Đăng ký ngay"
            className="h-12 px-6 font-bold text-center uppercase bg-white rounded-full shadow-md md:px-10 md:h-14 text-primary"
          />
        </div>
      </div>
    </div>
  );
}
