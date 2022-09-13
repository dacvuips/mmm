import { useToast } from "../../../lib/providers/toast-provider";
import { CustomerContactService } from "../../../lib/repo/customer-contact";
import { Button } from "../../shared/utilities/form/button";
import { Field } from "../../shared/utilities/form/field";
import { Form } from "../../shared/utilities/form/form";
import { Input } from "../../shared/utilities/form/input";
import { Textarea } from "../../shared/utilities/form/textarea";

export function ContactPage() {
  const toast = useToast();
  return (
    <div className="mt-12 lg:mt-24">
      <div className="px-8 py-6 text-lg font-medium text-center text-white uppercase md:mt-24 bg-primary">
        Liên hệ tư vấn và hợp tác với 3M Marketing
      </div>
      <div className="bg-primary-light">
        <div className="py-12 lg:py-24 main-container">
          <div className="text-3xl font-bold text-center text-gray-700 md:text-5xl">
            SOMO luôn đồng hành cùng chủ shop, doanh nghiệp
            <div className="">trong suốt quá trình kinh doanh</div>
          </div>
          <div className="grid gap-8 mt-8 md:grid-cols-2 lg:grid-cols-3 lg:mt-24 lg:gap-14">
            <div className="flex flex-col items-center justify-between gap-6 p-8 bg-white border border-gray-300 shadow-md auto-rows-fr hover:border-primary hover:shadow-lg rounded-3xl">
              <div className="p-8 rounded-full w-36 h-36bg-primary-light">
                <img src="https://i.imgur.com/SOskYK7.png" className="" />
              </div>
              <div className="text-lg font-bold uppercase text-primary">nhân viên tư vấn</div>
              <div className="text-justify text-gray-500 lg:h-44 xl:h-28">
                Đội ngũ của SOMO sẽ đồng hành cùng bạn trong suốt quá trình sử dụng, hỗ trợ tạo sản
                phẩm ban đầu và giải đáp thắc mắc của bạn
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-6 p-8 bg-white border border-gray-300 shadow-md hover:border-primary hover:shadow-lg rounded-3xl">
              <div className="p-8 rounded-full w-36 h-36 bg-primary-light">
                <img src="https://i.imgur.com/rwKMhoi.png" className="" />
              </div>
              <div className="text-lg font-bold uppercase text-primary">Tổng đài 0901026589</div>
              <div className="text-justify text-gray-500 lg:h-44 xl:h-28">
                Tổng đài miễn phí 0901026589 luôn sẵn sàng hỗ trợ, giải đáp mọi thắc mắc của bạn,
                trong tất cả các ngày trong tuần từ thứ Hai đến Chủ
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-6 p-8 bg-white border border-gray-300 shadow-md hover:border-primary hover:shadow-lg rounded-3xl">
              <div className="p-8 rounded-full w-36 h-36 bg-primary-light">
                <img src="https://i.imgur.com/tIZZvpJ.png" className="" />
              </div>
              <div className="text-lg font-bold uppercase text-primary">
                Hệ thống Livechat, ticket
              </div>
              <div className="text-justify text-gray-500 lg:h-44 xl:h-28">
                Bạn có thể nhắn tin qua hệ thống Livechat hoặc gửi ticket yêu cầu hỗ trợ. Đội ngũ
                chăm sóc khách hàng sẽ trả lời và hướng dẫn bạn
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-12 pb-28 md:pt-24 md:pb-36 lg:pb-24">
        <Form
          className="max-w-xl mx-auto main-container"
          onSubmit={async (data) => {
            let err = null;
            try {
              await CustomerContactService.createOrUpdate({ id: "", data });
            } catch (error) {
              err = error;
            } finally {
              if (err) {
                toast.error("Lỗi gừi yêu cầu tư vấn " + err);
              } else {
                toast.success(
                  "Gửi yêu cầu tư vấn thành công. Cảm ơn quý khách hàng đã quan tâm đến dịch vụ của chúng tôi. Chúng tôi sẽ liên lạc với quý khách trong thời gian sớm nhất có thể. Chân thành cảm ơn!"
                );
              }
            }
          }}
        >
          <h3 className="mb-4 text-3xl font-bold text-center text-gray-700 md:mb-10 md:text-5xl">
            Đăng ký tư vấn và hỗ trợ
          </h3>
          <Field name="name" label="Họ tên" required>
            <Input placeholder="Vui lòng nhập họ và tên" />
          </Field>
          <Field name="phone" label="Số điện thoại" required>
            <Input type="tel" placeholder="Vui lòng nhập số điện thoại" />
          </Field>
          <Field name="email" label="Email" required>
            <Input type="email" placeholder="Vui lòng nhập email" />
          </Field>
          <Field name="companyName" label="Tên công ty" required>
            <Input placeholder="Vui lòng nhập tên công ty" />
          </Field>
          <Field name="address" label="Địa chỉ">
            <Input placeholder="Vui lòng nhập địa chỉ" />
          </Field>
          <Field name="message" label="Nội dung">
            <Textarea placeholder="Vui lòng nhập nội dung" />
          </Field>
          <Form.Footer>
            <Button
              submit
              className="h-12 px-12 mt-2 rounded-full bg-primary font-bold"
              primary
              text="GỬI"
            />
          </Form.Footer>
        </Form>
      </div>
    </div>
  );
}
