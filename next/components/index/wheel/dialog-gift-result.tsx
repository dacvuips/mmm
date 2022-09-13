import { Gift } from "../../../lib/repo/lucky-wheel.repo";
import { DialogProps, Dialog } from "../../shared/utilities/dialog/dialog";
import { Img } from "../../shared/utilities/misc";
import { Button } from "../../shared/utilities/form/button";
import { HiOutlineX } from "react-icons/hi";
interface Propstype extends DialogProps {
  gift: Gift;
}

export const DialogGiftResult = (props: Propstype) => {
  return (
    <Dialog
      width="350px"
      isOpen={props.isOpen}
      slideFromBottom="none"
      onClose={props.onClose}
      dialogClass="rounded-3xl overflow-hidden relative bg-white"
      extraBodyClass="sm:p-12 p-6"
    >
      <Dialog.Body>
        <div
          className={`w-8 h-8 absolute right-4 top-4 z-200 rounded-full p-2 flex items-center justify-center cursor-pointer`}
          onClick={props.onClose}
        >
          <i className="text-2xl text-gray-600 ">
            <HiOutlineX />
          </i>
        </div>
        <div className="bg-white flex flex-col items-center mt-4">
          <span
            className="font-medium text-xl text-center mb-4"
            style={{ whiteSpace: "break-spaces" }}
          >
            {props.gift.isLose ? "Chúc bạn may mắn lần sau" : "Chúc mừng bạn đã trúng thưởng!"}
          </span>
          <Img
            src={props.gift.image || "/assets/img/wheelGiftDefault.png"}
            className="w-40"
            contain
          />
          <span className="font-medium text-lg mt-4">
            {!props.gift.isLose ? props.gift.name : ""}
          </span>
          <Button text="Xác nhận" onClick={props.onClose} primary className="my-4 rounded-full" />
        </div>
      </Dialog.Body>
    </Dialog>
  );
};
