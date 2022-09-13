import React from "react";
import { AiOutlineMail, AiOutlineSend } from "react-icons/ai";
import { FaPhoneAlt } from "react-icons/fa";
import { Button, Field, Form, Input, Select, Textarea } from "../../../shared/utilities/form";

type Props = {};

export function MarketPlaceDetailContact({}: Props) {
  return (
    <div className="p-5 my-8 rounded-md " style={{ background: "#E6EDF4" }}>
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <div className="w-full lg:w-2/3">
          <div className="my-3 text-lg font-semibold">Gửi liên hệ đến chúng tôi</div>
          <Form onSubmit={() => {}}>
            <div className="flex flex-row items-center">
              <div className="w-1/2 mr-5">
                <Field cols={6} name="" label="">
                  <Input placeholder="Họ tên" />
                </Field>
              </div>
              <div className="w-1/2 ">
                <Field cols={6} name="" label="">
                  <Input placeholder="Công ty" />
                </Field>
              </div>
            </div>
            <Field cols={12} name="" label="" validation={{ email: true }}>
              <Input placeholder="Email" type="email" />
            </Field>
            <Field className="" cols={12}>
              <Select options={[{ value: "time", label: "Thời gian nghe máy" }]} />
            </Field>
            <Field cols={12}>
              <Textarea name="" placeholder="Nội dung" rows={3} />
            </Field>

            <Button submit text="Gửi" primary className="w-full my-2 " />
          </Form>
        </div>
        <div className="flex-col justify-around flex-1 ml-8 ">
          <div className="flex flex-row items-center my-5">
            <span className="p-3 rounded-full" style={{ background: "#004790" }}>
              <FaPhoneAlt className="text-white" />
            </span>
            <div className="ml-4">
              <div className="font-semibold">0987655555</div>
              <div className="text-sm text-gray-400">Free support</div>
            </div>
          </div>
          <div className="flex flex-row items-center my-5">
            <span className="p-3 rounded-full" style={{ background: "#004790" }}>
              <AiOutlineSend className="text-white" />
            </span>
            <div className="ml-4">
              <div className="font-semibold">admin@gmail.com</div>
              <div className="text-sm text-gray-400">Help Email support</div>
            </div>
          </div>
          <div className="flex flex-row items-center my-5">
            <span className="p-3 rounded-full" style={{ background: "#004790" }}>
              <AiOutlineMail className="text-white" />
            </span>
            <div className="ml-4">
              <div className="font-semibold">suppor@gmail.com</div>
              <div className="text-sm text-gray-400">Sales Enquiry</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
