import { Button } from "../utilities/form/button";
import { Input } from "../utilities/form/input";

export function Newsletter({ ...props }: ReactProps) {
  return (
    <div>
      <div className="flex flex-col items-center py-10 text-center main-container">
        <span className="uppercase md:text-lg text-primary">Kết nối với chúng tôi</span>
        <h3 className="mt-4 text-3xl font-bold md:text-5xl">Nhận tin mới nhất từ chúng tôi</h3>
        <div className="flex flex-col items-center mt-10 md:flex-row">
          <Input
            placeholder="Vui lòng nhập email của bạn"
            className="mb-3 h-14 md:mb-0 md:mr-3 min-w-2xs md:min-w-sm"
          />
          <Button text="GỬI" className="mt-4 rounded-full h-14 md:mt-0 px-14 bg-primary" primary />
        </div>
      </div>
    </div>
  );
}
