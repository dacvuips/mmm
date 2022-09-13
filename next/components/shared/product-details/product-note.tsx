import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { HiOutlineX } from "react-icons/hi";
import { Button, Field, Form, Textarea } from "../utilities/form";

interface Props extends ReactProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => any;
}
export function ProductNote({
  value,
  onChange,
  placeholder = "Ghi chú cho cửa hàng...",
  className = "",
  ...props
}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  // const { product } = useProductDetailsContext();
  // const [noteText, setNoteText] = useState("");
  // const { cartProducts } = useCart();

  // useEffect(() => {
  //   if (product && cartProducts) {
  //     let found = cartProducts.find((cart) => cart.productId == product.id);
  //     if (found) {
  //       setNoteText(found.note);
  //     }
  //   }
  // }, [product]);

  return (
    <>
      {/* <div
        className={`flex px-3 py-1.5 border bg-gray-50 border-gray-200 rounded hover:border-gray-300 hover:bg-gray-100 cursor-pointer ${className}`}
        onClick={() => setOpenDialog(true)}
      >
        {value ? (
          <div className="flex-1 text-gray-700 whitespace-pre-line">{value}</div>
        ) : (
          <div className="flex-1 text-gray-500">{placeholder}</div>
        )}
        <i className="mt-0.5 ml-auto text-primary">
          <FaEdit />
        </i>
      </div> */}
      <div
        className="flex flex-row justify-start items-center my-2 cursor-pointer "
        onClick={() => setOpenDialog(true)}
      >
        <i className=" text-primary">
          <FaEdit />
        </i>
        <div className="flex flex-row items-center justify-start ml-3">
          {value ? (
            <div className="flex-1 text-primary-dark whitespace-pre-line">{value}</div>
          ) : (
            <div className="flex items-center">
              <AiOutlinePlus className="text-primary-dark" />
              <div className="flex-1 text-primary-dark">{placeholder}</div>
            </div>
          )}
        </div>
      </div>
      <Form
        dialog
        // mobileSizeMode
        isOpen={openDialog}
        width="320px"
        defaultValues={{ note: value }}
        allowResetDefaultValues
        onClose={() => setOpenDialog(false)}
        onSubmit={(data) => {
          onChange(data.note);
          setOpenDialog(false);
        }}
        dialogClass="rounded-3xl"
      >
        <div className="flex flex-col items-center w-full text-gray-700">
          <div className="flex items-center justify-between w-full px-1 mb-1">
            <div className="text-lg font-semibold text-center">Ghi chú</div>
            <Button
              className="pr-1"
              iconClassName="text-xl"
              icon={<HiOutlineX />}
              onClick={() => setOpenDialog(false)}
            />
          </div>
          <Field name="note" className="w-full">
            <Textarea
              rows={3}
              placeholder="Nhập ghi chú cho cửa hàng"
              className="w-full border-gray-200"
            />
          </Field>
          <Button text="Xác nhận" primary className="px-12 rounded-full" submit />
        </div>
      </Form>
    </>
  );
}
