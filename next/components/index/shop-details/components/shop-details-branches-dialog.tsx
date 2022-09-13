import { FaCheck } from "react-icons/fa";
import { IoRadioButtonOffOutline, IoRadioButtonOnOutline } from "react-icons/io5";
import { useDevice } from "../../../../lib/hooks/useDevice";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { ShopBranch } from "../../../../lib/repo/shop-branch.repo";
import { DialogHeader } from "../../../shared/default-layout/dialog-header";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Spinner } from "../../../shared/utilities/misc";
interface Propstype extends DialogProps {
  onSelect?: (string) => void;
}
export function ShopDetailsBranchesDialog({ ...props }: Propstype) {
  const { shopBranches, selectedBranch, setSelectedBranch } = useShopContext();
  const { isMobile } = useDevice();
  return (
    <Dialog
      width={"600px"}
      isOpen={props.isOpen}
      onClose={props.onClose}
      // mobileSizeMode
      // slideFromBottom="all"
      bodyClass="relative bg-white rounded"
      headerClass=" "
      extraDialogClass="rounded-t-3xl lg:rounded-t"
    >
      <DialogHeader title={`Chọn chi nhánh (${shopBranches.length})`} onClose={props.onClose} />
      <Dialog.Body>
        {shopBranches ? (
          <div
            className={`flex flex-col text-sm sm:text-base v-scrollbar px-4 ${
              isMobile ? "pb-12" : ""
            }`}
            style={{ maxHeight: `calc(96vh - 150px)`, minHeight: `calc(96vh - 350px)` }}
          >
            {shopBranches.map((item: ShopBranch, index) => (
              <div
                className="flex items-center pb-2 mt-2 border-b cursor-pointer"
                key={index}
                onClick={() => {
                  if (item.isOpen) {
                    setSelectedBranch({ ...item });
                    props.onClose();
                  }
                }}
              >
                <div className="flex-1 text-primary">
                  <div className="font-bold ">{item.name}</div>
                  <div className="text-sm text-gray-600 text-ellipsis-2">{item.address}</div>
                  <div>
                    <span
                      className={`font-medium text-sm ${
                        item.isOpen ? "text-primary" : "text-danger"
                      }`}
                    >
                      {item.isOpen ? "Đang mở" : "Đóng cửa"}
                    </span>
                    <span className="text-sm text-primary"> - cách {item.distance}km</span>
                  </div>
                </div>
                {selectedBranch?.id == item.id ? (
                  <i className="text-xl text-primary">
                    {/* <FaCheck /> */}
                    <IoRadioButtonOnOutline className="text-2xl" />
                  </i>
                ) : (
                  <i className="text-xl text-gray-400">
                    <IoRadioButtonOffOutline className="text-2xl" />
                  </i>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Spinner />
        )}
      </Dialog.Body>
    </Dialog>
  );
}
