import { createContext, useContext, useEffect, useState } from "react";
import cloneDeep from "lodash/cloneDeep";
import { orderBy } from "lodash";
import { ShopVoucher, ShopVoucherService } from "../../../lib/repo/shop-voucher.repo";
import { CustomerVoucher, CustomerVoucherService } from "../../../lib/repo/customer-voucher.repo";
import { CrudProps, useCrud } from "../../../lib/hooks/useCrud";

export const VoucherContext = createContext<
  Partial<{
    shopVoucherCrud: CrudProps<ShopVoucher>;
    customerVoucherCrud: CrudProps<CustomerVoucher>;
    voucherType: VoucherType;
    setVoucherType: (val: VoucherType) => any;
  }>
>({});
export function VoucherProvider(props) {
  const limit = 10;
  const [voucherType, setVoucherType] = useState<VoucherType>(VOUCHER_TYPES[0].value);
  const shopVoucherCrud = useCrud(
    ShopVoucherService,
    {
      limit,
      order: { createdAt: -1 },
      filter: { isPrivate: false, isActive: true },
    },
    {
      fragment: ShopVoucherService.fullFragment,
      fetchingCondition: voucherType == "SHOP"
    }
  );
  const customerVoucherCrud = useCrud(
    CustomerVoucherService,
    {
      limit,
      order: { createdAt: -1 },
      filter: { status: "STILL_ALIVE" },
    },
    {
      fragment: CustomerVoucherService.fullFragment,
      fetchingCondition: voucherType == "OWNED"
    }
  );

  return (
    <VoucherContext.Provider
      value={{
        voucherType,
        setVoucherType,
        shopVoucherCrud,
        customerVoucherCrud,
      }}
    >
      {props.children}
    </VoucherContext.Provider>
  );
}

export const useVoucherContext = () => useContext(VoucherContext);

export type VoucherType = "SHOP" | "OWNED";
export const VOUCHER_TYPES: Option<VoucherType>[] = [
  {
    value: "SHOP",
    label: "Khuyến mãi cửa hàng",
  },
  {
    value: "OWNED",
    label: "Khuyến mãi của tôi",
  },
];
export const VOUCHER_TYPES_DESKTOP: Option<VoucherType>[] = [
  {
    value: "SHOP",
    label: "Khuyến mãi cửa hàng",
  },
];
