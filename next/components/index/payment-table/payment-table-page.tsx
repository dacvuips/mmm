import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { HiOutlineChevronLeft } from 'react-icons/hi';

import { useCart } from '../../../lib/providers/cart-provider';
import { useShopContext } from '../../../lib/providers/shop-provider';
import { useToast } from '../../../lib/providers/toast-provider';
import { Button, Form } from '../../shared/utilities/form';
import { Spinner } from '../../shared/utilities/misc';
import { PaymentNote } from '../payment/components/payment-note';
import { PaymentContext, PaymentProvider } from '../payment/providers/payment-provider';
import { PaymentTableDeliveryInfo } from './components/payment-table-delivery-info';
import { PaymentTableItems } from './components/payment-table-items';
import { PaymentTableShopBranch } from './components/payment-table-shop-branch';
import { PaymentTableSummary } from './components/payment-table-sumary';

type Props = {}

export function PaymentTablePage({ }: Props) {
  const { cartProducts } = useCart();
  const { customer, shop, shopCode } = useShopContext();
  const router = useRouter();

  useEffect(() => {
    if (customer === null) {
      router.push(`/${shopCode}`);
    }
  }, [customer]);

  if (!customer || !shop || !cartProducts) return <Spinner />;
  return (
    <PaymentProvider>
      <PaymentContext.Consumer>
        {({ isSubmitting }) => (
          <div className="min-h-screen bg-gray-100">
            <PaymentTableHeader />
            <PaymentTableShopBranch />
            <PaymentTableItems />
            <Form>
              <PaymentTableDeliveryInfo />
              <PaymentNote />
              <PaymentTableSummary />
              <PaymentTableFooter />
            </Form>
          </div>
        )}
      </PaymentContext.Consumer>
    </PaymentProvider>
  )
}


function PaymentTableHeader() {
  const { shopCode, shop } = useShopContext();

  return (
    <header className="sticky top-0 w-full z-100">
      <div className="flex items-center justify-between w-full p-2 pl-3 pr-1 mx-auto bg-primary-dark h-14">
        <Button
          hoverWhite
          icon={<HiOutlineChevronLeft />}
          iconClassName="text-2xl text-white "
          className="w-10 px-0"
          tooltip={` "Trang chủ`}
          href={`/${shopCode}/menu`}
        />
        <div className="flex-1 text-lg font-semibold text-center text-white">Xác nhận đơn hàng</div>

      </div>

    </header>
  );
}

function PaymentTableFooter() {
  const toast = useToast();
  return (
    <div className="sticky bottom-0 w-full left-0 shadow-xl bg-white p-4">
      <Button
        primary
        text="Tạo đơn và thanh toán"
        className="w-full h-14 rounded-xl"
        onClick={() => {
          toast.info("tính năng đang phát triển")
        }}
        submit
      />

    </div>
  )
}