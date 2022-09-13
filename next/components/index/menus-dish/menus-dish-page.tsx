import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { RiShoppingBasket2Line } from 'react-icons/ri';

import { SetCustomerToken } from '../../../lib/graphql/auth.link';
import { parseNumber } from '../../../lib/helpers/parser';
import { useAlert } from '../../../lib/providers/alert-provider';
import { CartProvider, useCart } from '../../../lib/providers/cart-provider';
import { LocationProvider } from '../../../lib/providers/location-provider';
import { CUSTOMER_LOGIN_PATHNAME, ShopProvider, useShopContext } from '../../../lib/providers/shop-provider';
import { Spinner } from '../../shared/utilities/misc';
import { ShopDetailsProvider, useShopDetailsContext } from '../shop-details/providers/shop-details-provider';
import { MenusDishCartDialog } from './components/menus-dish-cart-dialog';
import { MenusDishCategories } from './components/menus-dish-categories';
import { MenusDishHeader } from './components/menus-dish-header';
import { MenusDishProvider } from './provider/menus-dish-provider';

type Props = {}

export function MenusDishPage(props: Props) {
  return (
    <MenusDishProvider>
      <MenuDishComponent {...props} />
    </MenusDishProvider>
  )
}

function MenuDishComponent() {
  return (
    <div className="">
      <MenusDishHeader />
      <MenusDishCategories />
      <MenuCartButton />
    </div>
  )
}


function MenuCartButton() {
  const { cartProducts, totalQty, totalAmount } = useCart();
  const { showDialogCart, setShowDialogCart } = useShopDetailsContext();
  const { shop, shopCode, customer, setOpenLoginDialog } = useShopContext();
  const router = useRouter();

  useEffect(() => {
    if (!cartProducts?.length) {
      setShowDialogCart(false);
    }
  }, [cartProducts]);

  return (
    <>
      {!cartProducts ||
        (!cartProducts?.length ? (
          <></>
        ) : (
          <CartFloatingButton
            onClick={() => {
              if (shop.config.orderConfig.skipCart) {
                if (customer) {
                  router.push(`${shopCode}/payment`);
                } else {
                  sessionStorage.setItem(CUSTOMER_LOGIN_PATHNAME, `${shopCode}/payment`);
                  setOpenLoginDialog(true);
                }
              } else {
                setShowDialogCart(true);
              }
            }}
          />
        ))}
      <MenusDishCartDialog
        isOpen={showDialogCart}
        onClose={() => setShowDialogCart(false)}
        slideFromBottom="all"
      />
    </>
  );
}

interface CartFloatingButtonProps extends ReactProps {
  onClick?: Function;
}
function CartFloatingButton(props: CartFloatingButtonProps) {
  const { totalQty, totalAmount } = useCart();
  return (
    // <div className="sticky left-0 flex flex-col items-center w-full mt-3 bottom-5 sm:bottom-7 z-100">
    <button
      className={`rounded-xl border-1 border-b-4 border-primary-dark font-medium fixed bottom-4 z-50 left-1/2 transform -translate-x-1/2 justify-between shadow-xl flex btn-primary mx-auto w-11/12 sm:w-5/6 max-w-md h-12 animate-emerge`}
      onClick={() => {
        props.onClick();
      }}
    >
      <span>
        <i className="text-lg mb-0.5">
          <RiShoppingBasket2Line />
        </i>
        <span className="font-normal">Bạn đã chọn ({totalQty}) món</span>
      </span>
      <span className="pl-2 font-bold text-right whitespace-nowrap">
        {parseNumber(totalAmount, true)}
      </span>
    </button>
    // </div>
  );
}
