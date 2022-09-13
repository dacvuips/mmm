import { Fragment, useMemo } from "react";
import { FaGift, FaPencilAlt } from "react-icons/fa";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { CardProductItem } from "../../../shared/product/cart-product-item";
import { Button } from "../../../shared/utilities/form";
import { NotFound } from "../../../shared/utilities/misc";
import { usePaymentContext } from "../providers/payment-provider";

export function PaymentDiscountItems() {
  const {
    selectedVoucher,
    discountItems,
    discountItemGroups,
    orderInput,
    setOpenVoucherItemsDialog,
    isGroup,
    isOffer,
  } = usePaymentContext();
  const screenLg = useScreen("lg");

  const selectedCount = useMemo(
    () =>
      isGroup
        ? discountItemGroups?.reduce(
          (total, group) => total + group.filter((x) => x.selected).length,
          0
        )
        : discountItems?.filter((x) => x.selected).length,
    [discountItems, discountItemGroups]
  );
  const items = useMemo(() => {
    if (isGroup) {
      if (
        discountItemGroups &&
        orderInput.offerGroupIndex >= 0 &&
        orderInput.offerGroupIndex < discountItemGroups.length
      ) {
        return discountItemGroups[orderInput.offerGroupIndex];
      } else {
        return [];
      }
    } else {
      return discountItems;
    }
  }, [isGroup, orderInput.offerGroupIndex, discountItemGroups, discountItems]);

  if (!selectedVoucher || (!isGroup && !discountItems) || (isGroup && !discountItemGroups))
    return <></>;
  return (
    <div className={`${screenLg ? "" : "px-4"} pt-4 bg-white`}>
      <div className="flex items-center font-semibold uppercase">
        <i className="pr-2 mb-0.5 text-primary">
          <FaGift />
        </i>
        {isOffer ? "Sản phẩm được tặng" : "Sản phẩm đồng giá"}
        <Button
          textPrimary
          onClick={() => setOpenVoucherItemsDialog(true)}
          text="Sửa"
          icon={<FaPencilAlt />}
          iconClassName="text-xs"
          className="h-8 pr-0 ml-auto mr-0 text-sm underline"
        />
      </div>
      <div className="px-1">
        {!selectedCount && (
          <NotFound
            className="py-4 border-b border-gray-300"
            text="Chưa chọn sản phẩm ưu đãi nào"
          />
        )}
        {items.map((cartProduct, index) => (
          <Fragment key={cartProduct.productId + index}>
            {cartProduct.selected ? (
              <CardProductItem
                editable
                quantityEditable={
                  !(selectedVoucher.type == "OFFER_ITEM" || selectedVoucher.type == "OFFER_ITEM_2")
                }
                isDiscountProduct
                cartProduct={cartProduct}
                index={index}
              />
            ) : (
              <></>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
