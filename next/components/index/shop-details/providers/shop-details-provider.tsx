import cloneDeep from "lodash/cloneDeep";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { useCrud } from "../../../../lib/hooks/useCrud";
import { useQuery } from "../../../../lib/hooks/useQuery";
import { Category, CategoryService } from "../../../../lib/repo/category.repo";
import { ShopVoucher, ShopVoucherService } from "../../../../lib/repo/shop-voucher.repo";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";

export const ShopDetailsContext = createContext<
  Partial<{
    voucherShow: ShopVoucher;
    categories: Category[];
    showDialogCart;
    setShowDialogCart;
  }>
>({});

export function ShopDetailsProvider(props) {
  const [voucherShow, setVoucherShow] = useState<ShopVoucher>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogCart, setShowDialogCart] = useState(false);
  const router = useRouter();
  const { voucher } = router.query;
  const categoryCrud = useCrud(
    CategoryService,
    {
      limit: 100,
      order: { priority: -1, createdAt: 1 },
      filter: { hidden: false },
    },
    {
      fragment: CategoryService.shortFragmentWithProducts
    }
  );
  useEffect(() => {
    let isSubscribed = true;
    if (!voucher) {
      ShopVoucherService.getAll({
        fragment: ShopVoucherService.fullFragment,
        query: { limit: 1 },
        cache: false,
      }).then((res) => {
        if (isSubscribed) {
          setVoucherShow(cloneDeep(res.data[0]));
          setShowDialog(false);
        }
      });
    } else {
      ShopVoucherService.getAll({
        fragment: ShopVoucherService.fullFragment,
        query: { limit: 1, filter: { code: voucher } },
      }).then((res) => {
        if (isSubscribed) {
          setVoucherShow(cloneDeep(res.data[0]));
          setShowDialog(true);
        }
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [voucher]);


  return (
    <ShopDetailsContext.Provider
      value={{ voucherShow, categories: categoryCrud.items, showDialogCart, setShowDialogCart }}
    >
      {props.children}
      <VoucherDetailsDialog
        voucher={voucherShow}
        isOpen={showDialog}
        onClose={() => {
          const url = new URL(location.href);
          url.searchParams.delete("voucher");
          router.push(url.toString(), null, { shallow: true });
        }}
      />
    </ShopDetailsContext.Provider>
  );
}

export const useShopDetailsContext = () => useContext(ShopDetailsContext);

export const ShopDetailConsumer = ({
  children,
}: {
  children: (props: Partial<{ voucherShow: ShopVoucher }>) => any;
}) => {
  return <ShopDetailsContext.Consumer>{children}</ShopDetailsContext.Consumer>;
};
