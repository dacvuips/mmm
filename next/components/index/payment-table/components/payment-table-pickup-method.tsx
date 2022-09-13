import React, { useState } from 'react'
import { AiFillCreditCard, AiOutlineRight } from 'react-icons/ai'
import { Button } from '../../../shared/utilities/form'
import { PaymentSelectionDialog } from '../../payment/components/payment-footer'
import { usePaymentContext } from '../../payment/providers/payment-provider'

type Props = {}

export function PaymentTablePickupMethod({ }: Props) {
  const { orderInput, setOrderInput } = usePaymentContext();

  const [openPaymentMethods, setOpenPaymentMethods] = useState(false);

  return (
    <div className="my-3">
      <div className="flex items-center px-4 font-semibold mb-2 ">
        <i className="pr-2 mb-0.5 text-lg text-primary">
          <AiFillCreditCard />
        </i>
        Phương thức thanh toán
      </div>
      <div className="py-3 px-4 bg-white">
        <Button
          text={`${orderInput.paymentMethod == "COD"
            ? "Tiền mặt" : orderInput.paymentMethod == "MOMO"
              ? "Ví MoMo" : "Chọn phương thức thanh toán"}
          `}
          onClick={() => {
            setOpenPaymentMethods(true)
          }}
          icon={<AiOutlineRight />}
          iconPosition="end"
          iconClassName='text-gray-400 text-xl'
          className="h-14 rounded-xl w-full border border-gray-200 flex justify-between"
        />
      </div>
      <PaymentSelectionDialog
        isOpen={openPaymentMethods}
        onClose={() => setOpenPaymentMethods(false)}
      />
    </div>
  )
}