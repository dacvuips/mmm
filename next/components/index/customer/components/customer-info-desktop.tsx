import React, { useEffect, useState } from "react";
import { FaEdit, FaPhoneAlt, FaUserAlt } from "react-icons/fa";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useLocation } from "../../../../lib/providers/location-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Button, DatePicker, Field, Form, Input } from "../../../shared/utilities/form";
import { CustomerAddressField, CustomerAvatar, SubmitButton } from "../customer-page";
import { useCustomerContext } from "../provider/customer-provider";
import { RewardPointDialog } from "./reward-point-dialog";

type Props = {};

export function CustomerInfoDesktop({}: Props) {
  const [openRewardLogs, setOpenRewardLogs] = useState(false);
  const { customerUpdateMe, pageCustomer, setPageCustomer } = useCustomerContext();
  const { userLocation, openLocation } = useLocation();
  const toast = useToast();

  useEffect(() => {}, [userLocation]);

  return (
    <div className="p-5">
      <div className="text-lg font-semibold text-gray-800">Thông tin tài khoản</div>
      <Form
        defaultValues={pageCustomer}
        className=""
        onSubmit={async (data) => {
          try {
            await customerUpdateMe(data);
            toast.success("Cập nhật thông tin tài khoản thành công");
          } catch (err) {
            toast.error("Cập nhật thông tin tài khoản thất bại. " + err.message);
          }
        }}
      >
        <div className="flex flex-row items-center justify-between my-5">
          <div className="flex flex-row items-center justify-start ">
            <CustomerAvatar />
            <div className="ml-5">
              <div className="mb-1 text-lg font-semibold text-primary">{pageCustomer?.name}</div>
              <div className="mb-1 text-accent">{pageCustomer?.phone}</div>
              <div className="mb-1">
                Tổng điểm thưởng:
                <span className="ml-1 font-medium text-accent">
                  {parseNumber(pageCustomer.rewardPointStats.total)} điểm
                </span>
              </div>
            </div>
          </div>
          <Button
            primary
            text="Lịch sử điểm thưởng"
            outline
            onClick={() => setOpenRewardLogs(true)}
          />
        </div>
        <div className="w-full">
          <div className="flex ">
            <Field name="phone" readOnly className="w-1/2 mr-3">
              <Input suffix={<FaPhoneAlt />} placeholder="Số điện thoại" />
            </Field>
            <Field name="name" className="w-1/2 ">
              <Input suffix={<FaUserAlt />} placeholder="Họ và tên" />
            </Field>
          </div>
          <div className="flex">
            <Field name="birthday" className="w-1/2 mr-3">
              <DatePicker placeholder="Ngày sinh" />
            </Field>
            <div className="w-1/2">
              <CustomerAddressField />
            </div>
          </div>

          <Field name="addressNote" className="">
            <Input suffix={<FaEdit />} placeholder="Ghi chú địa chỉ" />
          </Field>
        </div>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
        <RewardPointDialog isOpen={openRewardLogs} onClose={() => setOpenRewardLogs(false)} />
      </Form>
    </div>
  );
}
