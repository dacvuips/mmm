import { NextSeo } from 'next-seo';
import React from 'react';

import { PaymentTablePage } from '../../../components/index/payment-table/payment-table-page';
import { OrderTableLayout } from '../../../layouts/order-table-layout';


type Props = {}
export default function Page({ }: Props) {
  return (
    <>
      <NextSeo title='Xác nhận đơn hàng' />
      <PaymentTablePage />
    </>
  )
}
Page.Layout = OrderTableLayout; 