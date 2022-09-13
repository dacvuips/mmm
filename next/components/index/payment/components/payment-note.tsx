import { AiOutlinePlus } from "react-icons/ai";
import { FaEdit, FaPencilAlt } from "react-icons/fa";
import { Textarea } from "../../../shared/utilities/form";
import { usePaymentContext } from "../providers/payment-provider";

export function PaymentNote() {
  const { orderInput, setOrderInput } = usePaymentContext();

  return (
    <div className="flex items-start px-4 py-2 bg-white border-b border-gray-200 border-dashed cursor-text focus-within:border-primary lg:px-0">
      {/* <Textarea
        placeholder="Ghi chú đơn hàng..."
        className="flex-1 px-2"
        rows={1}
        controlClassName="border-none resize-none"
        value={orderInput?.note}
        onChange={(val) => setOrderInput({ ...orderInput, note: val })}
      />
      <i className="pt-3 pr-2 text-sm text-gray-600">
        <FaPencilAlt />
      </i> */}
      <div className="flex flex-row items-center justify-start my-2 cursor-pointer ">
        <i className=" text-primary">
          <FaEdit />
        </i>
        <div className="flex flex-row items-center justify-start ml-2">
          <div className="flex items-center">
            <AiOutlinePlus className="text-primary-dark" />
            <Textarea
              placeholder="Ghi chú đơn hàng..."
              className="flex-1 px-2 text-primary"
              rows={1}
              controlClassName="border-none resize-none"
              value={orderInput?.note}
              onChange={(val) => setOrderInput({ ...orderInput, note: val })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
