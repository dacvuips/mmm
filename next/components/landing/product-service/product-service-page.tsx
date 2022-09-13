import { parseNumber } from "../../../lib/helpers/parser";
import { Button } from "../../shared/utilities/form/button";
import { NotFound, Spinner } from "../../shared/utilities/misc";
import {
  ProductServiceProvider,
  useProductServiceContext,
} from "./provider/product-service-provider";

export function ProductServicePage() {
  const questionGroups = [
    {
      name: "Thắc mắc về chính sách",
      questions: [
        {
          ask: "Tôi có phải trả phí thiết lập không?",
          answer: "Bạn sẽ không cần trả phí thiết lập đối với bất kỳ gói nào của chúng tôi",
        },
        {
          ask: "Tôi có cần trả phí giao dịch nào không?",
          answer: `Khi thanh toán Haravan qua hình thức chuyển khoản hoặc trả góp 0%, bạn sẽ chịu Phí chuyển khoản hoặc Phí trả góp 0% bằng thẻ tín dụng tùy vào ngân hàng.

          Đối với hình thức thanh toán bằng tiền mặt hoặc thanh toán online qua cổng VNPay, cà thẻ tại Haravan, bạn sẽ không mất phí.`,
        },
        {
          ask: "Tôi có thể hủy tài khoản của mình bất cứ lúc nào chứ?",
          answer:
            "Đúng vậy, trong 14 ngày dùng thử bạn có thể hủy tài khoản của mình bất cứ lúc nào mà không tốn bất cứ chi phí gì.",
        },
        {
          ask: "Một gói có thời gian sử dụng bao lâu?",
          answer:
            "Tất cả các gói tại Haravan đều thanh toán và có thời hạn sử dụng theo năm. Bạn có thể đăng ký gói hàng năm hoặc nhiều hơn tùy vào nhu cầu của doanh nghiệp.",
        },
      ],
    },
    {
      name: "Thắc mắc về thanh toán",
      questions: [
        {
          ask: "Tôi có phải trả phí thiết lập không?",
          answer: "Bạn sẽ không cần trả phí thiết lập đối với bất kỳ gói nào của chúng tôi",
        },
        {
          ask: "Tôi có cần trả phí giao dịch nào không?",
          answer: `Khi thanh toán Haravan qua hình thức chuyển khoản hoặc trả góp 0%, bạn sẽ chịu Phí chuyển khoản hoặc Phí trả góp 0% bằng thẻ tín dụng tùy vào ngân hàng.

          Đối với hình thức thanh toán bằng tiền mặt hoặc thanh toán online qua cổng VNPay, cà thẻ tại Haravan, bạn sẽ không mất phí.`,
        },
        {
          ask: "Tôi có thể hủy tài khoản của mình bất cứ lúc nào chứ?",
          answer:
            "Đúng vậy, trong 14 ngày dùng thử bạn có thể hủy tài khoản của mình bất cứ lúc nào mà không tốn bất cứ chi phí gì.",
        },
        {
          ask: "Một gói có thời gian sử dụng bao lâu?",
          answer:
            "Tất cả các gói tại Haravan đều thanh toán và có thời hạn sử dụng theo năm. Bạn có thể đăng ký gói hàng năm hoặc nhiều hơn tùy vào nhu cầu của doanh nghiệp.",
        },
      ],
    },
  ];

  return (
    <ProductServiceProvider>
      <div className="flex flex-col mt-12 md:mt-24">
        <div className="py-12 md:py-24 bg-primary-light">
          <Ricing />
        </div>
        <div className="">
          <div className="pt-12 pb-20 md:pt-24 md:pb-32 lg:pb-24 main-container">
            <h3 className="mb-10 text-3xl font-bold text-gray-700 md:text-5xl">Câu hỏi chung</h3>
            {questionGroups.map((group) => (
              <div className="mb-10" key={group.name}>
                <div className="mb-5 font-bold uppercase text-primary">{group.name}</div>
                <div className="grid grid-cols-1 gap-8 text-lg md:grid-cols-2">
                  {group.questions.map((question, index) => (
                    <div className="auto-rows-min" key={index}>
                      <div className="mb-1 font-bold text-gray-700">{question.ask}</div>
                      <div className="font-normal text-gray-700">{question.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProductServiceProvider>
  );
}
function Ricing() {
  const { packages } = useProductServiceContext();
  return (
    <div className="flex flex-col items-center text-center main-container">
      <div className="text-lg text-center uppercase text-primary">Dịch vụ của chúng tôi</div>
      <h3 className="mt-3 mb-10 text-3xl font-bold text-center text-gray-700 md:text-5xl">
        Tăng trưởng hiệu quả với gói giải pháp phù hợp
      </h3>
      {packages ? (
        packages.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-y-14 xl:gap-x-20">
            {packages.map((pricing, index) => (
              <div key={index}>
                <div className="px-6 pt-10 pb-12 bg-white shadow-md rounded-2xl">
                  <div className="mb-3 text-2xl font-normal text-gray-800 uppercase">
                    {pricing.name}
                  </div>
                  <div className="h-auto mb-4 text-base text-gray-700 md:h-28">{pricing.desc}</div>
                  <div className="text-2xl font-black text-primary">
                    {parseNumber(pricing.sellPrice) + `đ/tháng`}
                  </div>
                  <div className="text-sm font-medium text-gray-400 line-through">
                    {parseNumber(pricing.basePrice) + `đ/tháng`}
                  </div>
                  <Button
                    className="px-8 mt-6 text-sm font-bold uppercase rounded-full md:mt-10 bg-primary"
                    primary
                    text="Dùng thử ngay"
                    href={pricing.url}
                  />
                </div>
                <div className="flex flex-col mt-10 gap-y-4">
                  {pricing.features.map((feature, index) => (
                    <div className="px-2 font-medium text-left text-gray-800" key={index}>
                      ✔️ {feature.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NotFound text="Dữ liệu đang cập nhật" />
        )
      ) : (
        <Spinner />
      )}
    </div>
  );
}
