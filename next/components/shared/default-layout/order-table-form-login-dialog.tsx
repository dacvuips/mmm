import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { AiFillCloseCircle } from "react-icons/ai";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

import { GetAnonymousToken } from "../../../lib/graphql/auth.link";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { ShopService } from "../../../lib/repo/shop.repo";
import { DialogHeader } from "./dialog-header";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { Button, Checkbox, Field, Form, Input } from "../utilities/form";
import { useRouter } from "next/router";

interface PropsType extends DialogProps { }

export function OrderTableFormLoginDialog(props: PropsType) {
  const { shopCode, loginCustomer } = useShopContext();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  return (
    <Dialog
      extraDialogClass="rounded-t-3xl lg:rounded-t"
      isOpen={props.isOpen}
      onClose={props.onClose}
      bodyClass="relative bg-white rounded"
      extraFooterClass=" z-40"
      headerClass=""
    >
      <Dialog.Header>
        <div className="pb-3 border-b border-blue-100">
          <div className="flex items-end justify-end mt-2">
            <Button
              icon={<AiFillCloseCircle />}
              iconClassName="text-3xl"
              className="text-gray-400 "
              onClick={props.onClose}
            />
          </div>
          <div className="px-5 font-semibold text-center text-md">
            <span>Mời bạn nhập tên để nhà hàng</span>
            <br />
            <span>phục vụ bạn nhanh chóng hơn, chính xác hơn</span>
          </div>
        </div>
      </Dialog.Header>
      <Dialog.Body>
        <div className="p-4">
          <Form
            onSubmit={async (values) => {
              try {
                let tokenShop = GetAnonymousToken(shopCode);
                if (!tokenShop) {
                  await ShopService.loginAnonymous(shopCode);
                } else {
                  setLoading(true);
                  await loginCustomer(values.phone, values.name);
                  // toast.info("Tính năng đang phát triển");
                  props.onClose();
                  setLoading(false);
                  router.push(`/${shopCode}/menu`);
                }
              } catch (error) {
                console.log("Đăng nhập thất bại.", error.message);
              }
            }}
          >
            <Field name="name" label="">
              <Input placeholder="Tên của bạn" inputClassName="h-12 border border-blue-300" />
            </Field>
            <Field name="phone" label="">
              <Input placeholder="Số điện thoại" inputClassName="h-12 border border-blue-300" />
            </Field>
            <div className="py-3 font-medium border-b border-dashed">
              Nhập số điện thoại của bạn để được tích điểm và hưởng các ưu đãi dánh cho hội viên.
            </div>
            <div className="mt-2 font-semibold">Hiển thị gợi ý</div>
            <Field>
              <Checkbox
                checkedIcon={<MdRadioButtonChecked />}
                uncheckedIcon={<MdRadioButtonUnchecked />}
                placeholder="Gợi ý combo và món ăn kèm"
              />
            </Field>
            <Button
              isLoading={loading}
              submit
              text="Xác nhận"
              primary
              className="w-full h-14 rounded-xl"
            />
          </Form>
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
