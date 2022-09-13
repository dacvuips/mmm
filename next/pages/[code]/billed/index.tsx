import { NextSeo } from 'next-seo';
import React from 'react'
import { PosPage } from '../../../components/shop/pos/pos-page';

import { NoneLayout } from '../../../layouts/none-layout/none-layout';


type Props = {}

export default function Page({ }: Props) {
  return (
    <>
      <NextSeo title='Tạo đơn tại quầy' />
      <PosPage />
    </>
  )
}
Page.Layout = NoneLayout;