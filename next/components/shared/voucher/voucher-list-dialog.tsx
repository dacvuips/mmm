import { ShopVoucher } from "../../../lib/repo/shop-voucher.repo";
import { usePaymentContext } from "../../index/payment/providers/payment-provider";
import { DialogHeader } from "../default-layout/dialog-header";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { VoucherList } from "./voucher-list";

interface Props extends DialogProps {
  onApply?: (voucher: ShopVoucher) => any;
}
export function VoucherListDialog({ onApply, ...props }: Props) {
  return (
    <Dialog
      extraDialogClass="lg:rounded-t rounded-t-3xl"
      width={"600px"}
      // mobileSizeMode
      // slideFromBottom="all"
      onClose={props.onClose}
      isOpen={props.isOpen}
      bodyClass="relative bg-white rounded"
      headerClass=" "
    >
      <DialogHeader title="Danh sách khuyến mãi" onClose={props.onClose} />
      <Dialog.Body>
        <div className="p-4 v-scrollbar" style={{ height: `calc(100vh - 150px)` }}>
          <VoucherList
            onApply={(val) => {
              onApply(val);
              props.onClose();
            }}
          />
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
