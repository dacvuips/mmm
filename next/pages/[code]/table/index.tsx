import { NextSeo } from 'next-seo';
import React from 'react';
import { TablePage } from '../../../components/index/table/table-page';

import { NoneLayout } from '../../../layouts/none-layout/none-layout';
import { OrderTableLayout } from '../../../layouts/order-table-layout';

type Props = {}

export default function Page({ }: Props) {
  return (
    <>
      <NextSeo title='Đặt bàn' />
      <TablePage />
    </>
  )
}
Page.Layout = OrderTableLayout;