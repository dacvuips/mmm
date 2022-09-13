import React, { useEffect, useState } from "react";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";
import { WalletTransactionService } from "../../../../lib/repo/wallet-transaction.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button, Field, Form, Input } from "../../../shared/utilities/form";

type Props = {};

export function TopUpWalletFormDialog(props: DialogProps) {
  const [denominations, setDenominations] = useState(null);
  const toast = useToast();

  return (
    <Form
      width={500}
      dialog
      title="Nạp tiền vào ví"
      {...props}
      defaultValues={{ amount: denominations }}

      onSubmit={async (data) => {
        try {
          if (data.amount == 0 && denominations == null) {
            toast.info("Vui lòng chọn mệnh giá tiền muốn nạp");
          } else {
            await WalletTransactionService.depositWalletByMomo(data.amount).then((res) => {
              window.open(`${res?.depositWalletByMomo?.payUrl}`, "_blank");
              props.onClose();
              setDenominations(null);
              toast.success("nạp tiền thành công");
            });
          }
        } catch (error) {
          toast.info(error.message);
        }
      }}
    >
      <Field name="amount" label="Nhập số tiền muốn nạp">
        <Input
          number
          placeholder="Số tiền"
          suffix={`đ`}
          suffixClassName={`bg-gray-50 border`}
        />
      </Field>
      <div className="font-semibold mt-3">Chọn nhanh mệnh giá tiền</div>
      <div className="flex flex-wrap  mt-3 gap-3">
        {DENOMINATIONS_MONEY_OPTIONS.map((item, index) => (
          <Button
            text={`${parseNumber(item.label)}đ `}
            onClick={() => {
              setDenominations(item.value);
            }}
            key={index}
            primary={denominations !== item.value}
            outline
            hoverWhite
            className={`${denominations === item.value ? "bg-primary-dark text-white border-0" : ""
              }`}
          />
        ))}
      </div>

      <Form.Footer submitText="Nạp tiền" />
    </Form>
  );
}

export const DENOMINATIONS_MONEY_OPTIONS: Option[] = [
  { value: "50000", label: "50000" },
  { value: "100000", label: "100000" },
  { value: "500000", label: "500000" },
  { value: "1000000", label: "1000000" },
];
