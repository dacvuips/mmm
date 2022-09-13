import React from 'react'
import { useShopContext } from '../../../../lib/providers/shop-provider';
import { Img } from '../../../shared/utilities/misc';

type Props = {}

export function TableHeader({ }: Props) {
  const { shop, } = useShopContext();

  return (
    <div className="bg-primary h-14 px-3 flex flex-row items-center">
      <Img src={shop?.shopCover ? shop?.shopCover : "assets/default/default.png"} className='w-10 rounded-full object-cover' />
      <div className='font-semibold text-white ml-2'>{shop?.shopName}</div>

    </div>
  )
}