import { NextSeo } from 'next-seo';
import React from 'react';
import { MenusDishPage } from '../../../components/index/menus-dish/menus-dish-page';
import { NoneLayout } from '../../../layouts/none-layout/none-layout';
import { OrderTableLayout } from '../../../layouts/order-table-layout';





type Props = {}

export default function Page({ }: Props) {
  return (
    <>
      <NextSeo title='Danh sách món của cửa hàng' />
      <MenusDishPage />
    </>
  )
}
Page.Layout = OrderTableLayout; 