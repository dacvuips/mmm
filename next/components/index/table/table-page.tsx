import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { IoListCircleOutline } from 'react-icons/io5';
import { RiMapPinLine } from 'react-icons/ri';

import { useShopContext } from '../../../lib/providers/shop-provider';
import { useToast } from '../../../lib/providers/toast-provider';
import { OrderTableFormLoginDialog } from '../../shared/default-layout/order-table-form-login-dialog';
import { Button } from '../../shared/utilities/form';
import { Img, Spinner } from '../../shared/utilities/misc';
import { ShopDetailsBanners } from '../shop-details/components/shop-details-banners';

type Props = {}

export function TablePage({ ...props }: Props) {

  return (
    <>
      <HeaderTable />
      <BodyTable />
    </>
  )
}



function HeaderTable() {
  const { shop, shopCode } = useShopContext();

  return (
    <div className="flex flex-row items-center px-3 bg-primary h-14">
      <Img src={shop?.shopCover ? shop?.shopCover : "assets/default/default.png"} className='object-cover w-10 rounded-full' />
      <div className='ml-2 font-semibold text-white'>{shop?.shopName}</div>

    </div>
  )
}
function BodyTable() {
  const [openFormLoginDialog, setOpenFormLoginDialog] = useState(false);
  const { shop, shopTable, customer } = useShopContext();
  const toast = useToast();
  const router = useRouter();

  if (!shop) return <Spinner />;
  return (
    <div className='py-3'>
      <div className="px-3 pb-3">
        <div className="flex flex-row items-center justify-start p-3 text-gray-800 bg-white rounded-md text-ellipsis-1">
          <span><i className='text-lg text-primary'><RiMapPinLine /></i></span>
          <p className="pl-2 text-gray-800 text-ellipsis-1">

            {shop?.address}, {shop?.ward}, {shop?.district}, {shop?.province}
          </p>
        </div>
      </div>
      <ShopDetailsBanners banners={shop.config.banners} cover={shop.shopCover} />
      <div className="my-3 text-center">
        <div className="font-semibold text-black">Kính chào quý khách!</div>
        <div >Bạn đang ngồi tại bàn <span className="mx-1 font-semibold text-primary">{shopTable ? shopTable?.name : "[Chưa có]"}</span> </div>
      </div>
      <div className='grid grid-cols-3 gap-5 px-3 mt-5'>
        <div
          className='p-4 text-center bg-white rounded-md shadow text-primary'
          onClick={() => {
            !customer ? setOpenFormLoginDialog(true) : toast.success("Gọi thanh toán thành công")
          }} >
          <Img src="/assets/img/icon-card-payment.png" className="object-cover w-10 mx-auto my-0" />
          <div className="mt-2 text-sm font-semibold" >Gọi thanh toán</div>
        </div>
        <div
          className='p-4 text-center bg-white rounded-md shadow text-primary'
          onClick={() => {
            toast.info("Tính năng đang phát triển")
          }}>
          <Img src="/assets/img/icon-star.png" className="object-cover w-10 mx-auto my-0 " />
          <div className="mt-2 text-sm font-semibold" >Đánh giá</div>
        </div>
        <div
          className='p-4 text-center bg-white rounded-md shadow text-primary'
          onClick={() => {
            toast.info("Tính năng đang phát triển")
          }}>
          <Img src="/assets/img/icon-waiter.png" className="object-cover w-10 mx-auto my-0 " />
          <div className="mt-2 text-sm font-semibold" >Nhân viên</div>
        </div>
      </div>
      <div className='px-3 mt-8'>

        <Button
          text="Xem menu - Gọi món"
          icon={<IoListCircleOutline />}
          iconPosition="start"
          iconClassName='text-white text-2xl'
          className="w-full  h-14 rounded-xl"
          primary
          onClick={() => {
            if (!customer) {
              setOpenFormLoginDialog(true)
            } else {
              router.push(`/${shop?.code}/menu`)
            }
          }}
        />
      </div>
      <div className="fixed left-0 right-0 text-center bottom-6">Được hỗ trợ bởi
        <span>
          <Link href="https://giaohang.shop/">
            <a className="mx-2 text-primary">
              Giaohang.shop
            </a>
          </Link></span>
      </div>

      <OrderTableFormLoginDialog
        isOpen={openFormLoginDialog}
        onClose={() => { setOpenFormLoginDialog(false) }}
        slideFromBottom="all"
      />
    </div>
  )
}