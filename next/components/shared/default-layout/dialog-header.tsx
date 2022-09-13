import { AiFillCloseCircle, AiOutlineClose } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { useDevice } from "../../../lib/hooks/useDevice";
import { useCart } from "../../../lib/providers/cart-provider";
import { Dialog } from "../utilities/dialog/dialog";
import { Button } from "../utilities/form";

export function DialogHeader({
  title,
  onClose,
  cleanCart,
}: {
  title: string;
  onClose: () => any;
  cleanCart?: boolean;
}) {
  const { isMobile } = useDevice();
  const { clearCartProducts, totalQty } = useCart();
  return (
    <Dialog.Header>
      <div
        className="py-3 pl-3 bg-white border-b cursor-pointer rounded-t-3xl flex-center group relative"
        onClick={onClose}
      >
        {cleanCart && (
          <Button
            className="text-red-500 group-hover:text-red-700 text-sm absolute left-0 top-1"
            hoverWhite
            text="Xóa hết"
            onClick={() => clearCartProducts()}
          />
        )}

        <div className="flex-1 font-medium text-center text-gray-800 group-hover:text-gray-800 min-h-8">
          {title} {cleanCart && <span className="text-gray-800">({totalQty})</span>}
        </div>
        <Button
          className="text-gray-300 group-hover:text-gray-400 absolute right-0 top-1"
          hoverWhite
          // icon={isMobile ? <FaChevronDown /> : <AiOutlineClose />}
          icon={<AiFillCloseCircle />}
          iconClassName="text-3xl"
        />
      </div>
    </Dialog.Header>
  );
}
DialogHeader.displayName = "Header";
