import Link from "next/link";
import { useState } from "react";
import { FaChevronRight, FaRegCommentDots } from "react-icons/fa";
import { HiOutlineTicket } from "react-icons/hi";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { Customer } from "../../../../lib/repo/customer.repo";
import { DialogHeader } from "../../../shared/default-layout/dialog-header";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button } from "../../../shared/utilities/form";
import { VoucherDetailsDialog } from "../../../shared/voucher/voucher-details-dialog";
import { VoucherList } from "../../../shared/voucher/voucher-list";
import { VoucherListDialog } from "../../../shared/voucher/voucher-list-dialog";
import { ShopDetailsCommentsDialog } from "./shop-details-comments-dialog";

export function ShopDetailsActionsDesktop() {
  const { customer } = useShopContext();
  const [openComments, setOpenComments] = useState(false);
  const [openPromotion, setOpenPromotion] = useState(false);

  return (
    <>
      <div className="flex gap-3">
        <Button
          icon={<HiOutlineTicket />}
          iconClassName="text-white text-[20px]"
          iconPosition="start"
          text={"Khuyến mãi"}
          primary
          // href={`/${shopCode}/promotion`}
          onClick={() => {
            setOpenPromotion(true);
          }}
          className="text-sm rounded-lg"
        />
        <Button
          icon={<FaRegCommentDots />}
          iconClassName="text-white text-[20px] "
          iconPosition="start"
          text={"Bình luận"}
          onClick={() => setOpenComments(true)}
          primary
          className="text-sm rounded-lg"
        />

        <ShopDetailsCommentsDialog isOpen={openComments} onClose={() => setOpenComments(false)} />
        <PromotionDialog
          isOpen={openPromotion}
          onClose={() => setOpenPromotion(false)}
          checkCustomer={customer}
        />
      </div>
    </>
  );
}
function PromotionDialog({ checkCustomer, ...props }: { checkCustomer: Customer } & DialogProps) {
  return (
    <Dialog width={600} isOpen={props.isOpen} onClose={props.onClose}>
      {/* <DialogHeader title="Danh sách khuyến mãi" onClose={props.onClose} /> */}

      <Dialog.Body>
        <div
          style={{ maxHeight: `calc(96vh - 150px)`, minHeight: `calc(96vh - 350px)` }}
          className="v-scrollbar"
        >
          <VoucherList isListMode checkCustomer={checkCustomer} />
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
