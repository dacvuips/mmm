import React, { useState } from 'react';

import { PaymentBilled } from './pos-payments';
import { BilledProductList } from './pos-product-list';
import { BilledProductsTable } from './pos-products-table';

type Props = {}

export function BilledBody({ }: Props) {
  return (
    <div className="flex flex-row justify-between" >
      <div className="flex-1 ">
        <BilledProductsTable />
        <BilledProductList />
      </div>
      <div className="ml-5 ">
        <PaymentBilled />
      </div>
    </div>
  )
}
