import { useEffect, useMemo } from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

import { parseNumber } from "../../../../lib/helpers/parser";
import { CartProduct } from "../../../../lib/providers/cart-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { DialogHeader } from "../../../shared/default-layout/dialog-header";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button, Checkbox } from "../../../shared/utilities/form";
import { Spinner } from "../../../shared/utilities/misc";
import { DiscountCartItem, usePaymentContext } from "../providers/payment-provider";

export function PaymentVoucherItemsDialog({ ...props }: DialogProps) {
  const toast = useToast();
  const {
    discountItems,
    discountItemGroups,
    selectedVoucher,
    openVoucherItemsDialog,
    setOpenVoucherItemsDialog,
    isGroup,
  } = usePaymentContext();

  const onClose = () => {
    if (
      (!isGroup &&
        discountItems &&
        (discountItems.filter((x) => x.selected).length || !discountItems.length)) ||
      (isGroup &&
        discountItemGroups &&
        (discountItemGroups.filter((x) => x.filter((x) => x.selected).length).length ||
          !discountItemGroups.length))
    ) {
      setOpenVoucherItemsDialog(false);
    } else {
      toast.info("Vui lòng chọn ít nhất một sản phẩm khuyến mãi");
    }
  };
  useEffect(() => {
    if (discountItems?.length) {
      let count = discountItems?.filter((x) => x?.selected).length;
      if (count > selectedVoucher?.offerQty && selectedVoucher?.offerAllItem) {
        toast.info(
          `Số lượng sản phẩm khuyến mãi không được lớn hơn  ${selectedVoucher?.offerQty} sản phẩm`
        );
        setOpenVoucherItemsDialog(true);
      }
    }
  }, [discountItems, openVoucherItemsDialog]);

  return (
    <Dialog
      extraDialogClass="rounded-t-3xl lg:rounded-t"
      isOpen={openVoucherItemsDialog}
      onClose={onClose}
      // mobileSizeMode
      // slideFromBottom="all"
      bodyClass="relative bg-white"
      headerClass=" "
      width={600}
    >
      <DialogHeader title="Chọn sản phẩm khuyến mãi" onClose={onClose} />
      <Dialog.Body>
        <div
          className="p-4 v-scrollbar"
          style={{ maxHeight: `calc(100vh - 150px)`, minHeight: `calc(96vh - 350px)` }}
        >
          {!selectedVoucher || (!isGroup && !discountItems) || (isGroup && !discountItemGroups) ? (
            <Spinner />
          ) : (
            <OfferItems onConfirm={onClose} />
          )}
        </div>
      </Dialog.Body>
    </Dialog>
  );
}

function OfferItems({ onConfirm, ...props }: { onConfirm: () => any } & ReactProps) {
  const {
    discountItems,
    setDiscountItems,
    discountItemGroups,
    setDiscountItemGroups,
    orderInput,
    setOrderInput,
    isOffer,
    isGroup,
    selectedVoucher,
  } = usePaymentContext();

  const selectedCount = useMemo(
    () =>
      isGroup
        ? discountItemGroups.reduce(
          (total, group) => total + group.filter((x) => x.selected).length,
          0
        )
        : discountItems.filter((x) => x.selected).length,
    [discountItems, discountItemGroups]
  );

  const handleToggle = (item: DiscountCartItem, groupIndex?: number) => {
    if (isGroup) {
      if (!item.selected) {
        setOrderInput({ ...orderInput, offerGroupIndex: groupIndex });
        for (let i = 0; i < discountItemGroups.length; i++) {
          if (i != groupIndex) {
            discountItemGroups[i]?.forEach((item) => (item.selected = false));
          }
        }
      }
      item.selected = !item.selected;
      setDiscountItemGroups([...discountItemGroups]);
    } else {
      const index = discountItems.findIndex((x) => x.productId == item.productId);
      discountItems[index].selected = !discountItems[index].selected;
      setDiscountItems([...discountItems]);
    }
  };

  return (
    <div className="w-full">
      <div className="font-bold text-primary">
        {isOffer ? "Các sản phẩm được tặng kèm khuyến mãi" : "Các sản phẩm được mua đồng giá"}
      </div>
      <div className="text-sm text-gray-600">
        Hãy chọn một hoặc nhiều sản phẩm bên dưới
        {isGroup ? ". Chỉ được chọn sản phẩm trong cùng nhóm." : ""}
      </div>
      <div className="flex flex-col items-center gap-3 mt-4">
        {!isGroup && (
          <>
            {discountItems.map((item, index) => (
              <DiscountItem
                key={item.productId}
                item={item}
                index={index}
                selected={item.selected}
                onToggle={() => handleToggle(item)}
              />
            ))}
          </>
        )}
        {isGroup && (
          <>
            {discountItemGroups.map((group, groupIndex) => (
              <div className="w-full mb-3" key={groupIndex}>
                <div className="pl-2 mb-2 font-semibold text-gray-700 uppercase">
                  Nhóm {groupIndex + 1}
                </div>
                <div className="flex flex-col gap-3">
                  {group.map((item, index) => {
                    return (
                      <DiscountItem
                        key={item.productId}
                        item={item}
                        index={index}
                        selected={item.selected}
                        onToggle={() => handleToggle(item, groupIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
        <Button
          primary
          text={"Xác nhận"}
          className="h-12 px-12 mt-2"
          disabled={!selectedCount}
          onClick={onConfirm}
        />
      </div>
    </div>
  );
}

function DiscountItem({
  item,
  index,
  selected,
  onToggle,
}: {
  item: { selected: boolean } & CartProduct;
  index: number;
  selected: boolean;
  onToggle: () => any;
}) {
  return (
    <div
      key={item.productId + index}
      className={`w-full border border-gray-100 bg-gray-50 hover:bg-gray-100 rounded py-2 px-3 flex justify-between items-center cursor-pointer`}
      onClick={onToggle}
    >
      <div className="font-medium leading-tight text-gray-700">
        <div>{item.product.name}</div>
        <div>
          <span className="text-sm text-accent">{parseNumber(item.price)}đ</span>
          <span className="ml-3 text-xs line-through">{parseNumber(item.product.basePrice)}đ</span>
        </div>
      </div>
      <Checkbox
        className="pointer-events-none"
        value={item.selected}
        checkedIcon={<MdCheckBox />}
        uncheckedIcon={<MdCheckBoxOutlineBlank />}
      />
    </div>
  );
}
function OfferItemsGroup({ ...props }: ReactProps) {
  return <></>;
  // const {
  //   itemsDiscount,
  //   voucherDiscountItem,
  //   loadAllItemDiscount,
  //   groupIndexSelected,
  //   setGroupIndexSelected,
  // } = usePaymentContext();
  // let [listToShow, setListToShow] = useState<OfferItem[][]>([]);
  // useEffect(() => {
  //   listToShow = [];
  //   voucherDiscountItem.offerItemGroups.forEach((group, index) => {
  //     let items = group.filter((item) => !item.product.deletedAt && item.product.allowSale);
  //     if (items.length > 0) {
  //       listToShow.push(items);
  //     }
  //   });
  //   setListToShow([...listToShow]);
  // }, [voucherDiscountItem]);
  // async function addItemDiscountGroup(offerItem: OfferItem, groupIndex: number) {
  //   if (groupIndex == groupIndexSelected) {
  //     let index = itemsDiscount.findIndex((item) => item.productId === offerItem.productId);
  //     if (index !== -1) {
  //       let res = [...itemsDiscount];
  //       res.splice(index, 1);
  //       loadAllItemDiscount([...res.map((item) => item.productId)]);
  //     } else {
  //       loadAllItemDiscount([...itemsDiscount.map((item) => item.productId), offerItem.productId]);
  //     }
  //   } else {
  //     setGroupIndexSelected(groupIndex);
  //     loadAllItemDiscount([offerItem.productId]);
  //   }
  // }
  // if (listToShow.length === 0) return <></>;
  // return (
  //   <div className="w-full">
  //     <div className="py-2 text-sm font-light">Vui lòng chỉ chọn sản phẩm cùng 1 nhóm</div>
  //     <>
  //       {listToShow.map((items, groupIndex) => (
  //         <div key={groupIndex} className="py-2 border-b">
  //           <div className="font-medium">Nhóm {groupIndex + 1}</div>
  //           {items.map((item, productIndex) => {
  //             let found = itemsDiscount.find((itemdc) => itemdc.productId === item.productId);
  //             return (
  //               <a
  //                 className={`flex items-center py-2 justify-between cursor-pointer ${
  //                   productIndex < items.length - 1 ? "border-b" : ""
  //                 }`}
  //                 key={productIndex}
  //                 onClick={() => {
  //                   addItemDiscountGroup(item, groupIndex);
  //                 }}
  //               >
  //                 <span>{item.product.name}</span>
  //                 <div className="flex items-center">
  //                   <span>{parseNumber(item.product.basePrice, true)}</span>
  //                   <Checkbox
  //                     value={found && groupIndex == groupIndexSelected ? true : false}
  //                     className="pt-1 pl-3 pointer-events-none"
  //                     checkedIcon={<FaRegDotCircle />}
  //                     uncheckedIcon={<FaRegCircle />}
  //                   />
  //                 </div>
  //               </a>
  //             );
  //           })}
  //         </div>
  //       ))}
  //     </>
  //   </div>
  // );
}
function OfferItemsGroup2({ ...props }: ReactProps) {
  return <></>;
  // const {
  //   itemsDiscount,
  //   voucherDiscountItem,
  //   loadAllItemDiscount,
  //   groupIndexSelected,
  //   setGroupIndexSelected,
  // } = usePaymentContext();
  // let [listToShow2, setListToShow2] = useState<OfferItemGroup[]>([]);
  // useEffect(() => {
  //   listToShow2 = [];
  //   voucherDiscountItem.offerItemGroups2.forEach((group) => {
  //     let items = group.items.filter((item) => !item.product.deletedAt && item.product.allowSale);
  //     if (items.length > 0) {
  //       let groupItems: OfferItemGroup = { items, samePrice: group.samePrice };
  //       listToShow2.push(groupItems);
  //     }
  //   });
  //   setListToShow2([...listToShow2]);
  // }, []);

  // async function addItemDiscountGroup(offerItem: OfferItem, groupIndex: number) {
  //   if (groupIndex == groupIndexSelected) {
  //     let index = itemsDiscount.findIndex((item) => item.productId === offerItem.productId);
  //     if (index !== -1) {
  //       let res = [...itemsDiscount];
  //       res.splice(index, 1);
  //       loadAllItemDiscount([...res.map((item) => item.productId)]);
  //     } else {
  //       loadAllItemDiscount([...itemsDiscount.map((item) => item.productId), offerItem.productId]);
  //     }
  //   } else {
  //     setGroupIndexSelected(groupIndex);
  //     loadAllItemDiscount([offerItem.productId]);
  //   }
  // }
  // if (listToShow2.length === 0) return <></>;
  // return (
  //   <div className="w-full">
  //     <div className="py-2 text-sm font-light">Vui lòng chỉ chọn sản phẩm cùng 1 nhóm</div>
  //     <>
  //       {listToShow2.map((group, groupIndex) => (
  //         <div key={groupIndex} className="py-2 border-b">
  //           <div className="font-medium">Nhóm {groupIndex + 1}</div>
  //           {group.items.map((item, productIndex) => {
  //             let found = itemsDiscount.find((itemdc) => itemdc.productId === item.productId);
  //             return (
  //               <a
  //                 className={`flex items-center py-2 justify-between cursor-pointer ${
  //                   productIndex < group.items.length - 1 ? "border-b" : ""
  //                 }`}
  //                 key={productIndex}
  //                 onClick={() => {
  //                   addItemDiscountGroup(item, groupIndex);
  //                 }}
  //               >
  //                 <span>{item.product.name}</span>
  //                 <div className="flex flex-col ml-auto mr-0 text-right">
  //                   <span className="font-medium">{parseNumber(group.samePrice, true)}</span>
  //                   <span className="text-sm text-gray-500 line-through">
  //                     {parseNumber(item.product.basePrice, true)}
  //                   </span>
  //                 </div>
  //                 <Checkbox
  //                   value={found && groupIndex === groupIndexSelected ? true : false}
  //                   className="pt-1 pl-3 pointer-events-none"
  //                   checkedIcon={<FaRegDotCircle />}
  //                   uncheckedIcon={<FaRegCircle />}
  //                 />
  //               </a>
  //             );
  //           })}
  //         </div>
  //       ))}
  //     </>
  //   </div>
  // );
}
