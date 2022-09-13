import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { FaInfoCircle } from "react-icons/fa";
import { RiAddFill, RiArrowRightLine, RiCloseFill, RiDeleteBin6Line } from "react-icons/ri";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";
import { PAYMENT_METHODS } from "../../../../lib/repo/order.repo";
import { ProductService } from "../../../../lib/repo/product.repo";
import {
  DiscountItem,
  DiscountUnit,
  DISCOUNT_BILL_UNITS,
  DISCOUNT_SHIP_FEE_UNITS,
  OfferItem,
  OfferItemGroup,
  ShopVoucherType,
} from "../../../../lib/repo/shop-voucher.repo";
import { ProductSelectionPopover } from "../../../shared/shop-layout/product-selection-popover";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import {
  Button,
  Checkbox,
  Field,
  Form,
  Input,
  Label,
  Select,
} from "../../../shared/utilities/form";
import { Accordion, Img } from "../../../shared/utilities/misc";

export function VoucherDetailsFields() {
  const productsOptionsPromise = () =>
    ProductService.getAllOptionsPromise({
      query: {
        limit: 0,
      },
      fragment: "id name basePrice",
      parseOption: (data) => ({
        value: data.id,
        label: data.name,
      }),
    });

  const { watch } = useFormContext();
  const type: ShopVoucherType = watch("type");
  const discountUnit: DiscountUnit = watch("discountUnit");

  return (
    <>
      <div className={`col-span-6 grid grid-cols-12 gap-x-5 auto-rows-min`}>
        <Form.Title title="Chi tiết khuyến mãi" />
        <Field name="applyItemIds" label="Các sản phẩm áp dụng" cols={12}>
          <Select optionsPromise={productsOptionsPromise} multi />
        </Field>
        <Field className="-mt-4 -mb-4" name="requireAllApplyItem" cols={12}>
          <Checkbox placeholder="Bắt buộc phải có hết sản phẩm áp dụng" />
        </Field>
        <Field className="-mt-4 -mb-4" name="onlyApplyItem" cols={12}>
          <Checkbox placeholder="Chỉ áp dụng do danh sách áp dụng" />
        </Field>
        <Field name="exceptItemIds" label="Các sản phẩm không áp dụng" cols={12}>
          <Select optionsPromise={productsOptionsPromise} multi />
        </Field>
        <Field name="applyPaymentMethods" label="Phương thức thanh toán áp dụng" cols={12}>
          <Select options={PAYMENT_METHODS} multi />
        </Field>
        <Field name="minItemQty" label="Tổng số món tối thiểu" cols={6}>
          <Input number suffix="món" />
        </Field>
        <Field name="minSubtotal" label="Tổng tiền hàng tối thiểu" cols={6}>
          <Input number suffix="VND" />
        </Field>
        <hr className="col-span-12 mb-4 border-gray-300" />
        {type == "DISCOUNT_ITEM" && <DiscountItemsFields />}
        {type == "OFFER_ITEM" && <OfferItemsFields />}
        {type == "OFFER_ITEM_2" && <OfferItems2Fields />}
        {type == "SAME_PRICE" && <SamePriceFields />}
        {type == "SAME_PRICE_2" && <SamePrice2Fields />}
        {(type == "DISCOUNT_BILL" || type == "SHIP_FEE") && (
          <>
            <Field name="discountUnit" label="Loại giảm giá" cols={6}>
              <Select
                options={type == "SHIP_FEE" ? DISCOUNT_SHIP_FEE_UNITS : DISCOUNT_BILL_UNITS}
                defaultValue="VND"
              />
            </Field>
            <Field name="discountValue" label="Giá trị giảm" cols={6}>
              <Input number suffix={discountUnit == "VND" ? "VND" : "%"} />
            </Field>
            <Accordion isOpen={discountUnit === "PERCENT"} className="col-span-6">
              <Field
                name="maxDiscount"
                label="Giảm tối đa"
                cols={6}
                required={discountUnit === "PERCENT"}
              >
                <Input number suffix="VND" />
              </Field>
            </Accordion>
          </>
        )}
      </div>
    </>
  );
}

function DiscountItemsFields() {
  const discountItemsRef = useRef();
  const { fields, append, update, remove } = useFieldArray({ name: "discountItems" });
  const toast = useToast();
  const [openDiscountItem, setOpenDiscountItem] = useState<DiscountItem>();
  const discountItems = fields as ({ id: string } & DiscountItem)[];

  return (
    <>
      <div className="col-span-12">
        <Label text="Các sản phẩm được giảm giá" />
        {(discountItems as ({ id: string } & DiscountItem)[])?.map((item, index) => (
          <ProductItem
            type="DISCOUNT_ITEM"
            name={`discountItems.${index}`}
            key={item.productId}
            item={item}
            hasSalePrice
            onClick={() => setOpenDiscountItem(item)}
            onRemove={() => {
              remove(index);
            }}
          />
        ))}
        <Button
          className="px-0 mb-4"
          textPrimary
          icon={<RiAddFill />}
          text="Chọn sản phẩm"
          innerRef={discountItemsRef}
        />
        <ProductSelectionPopover
          reference={discountItemsRef}
          onProductSelect={(item) => {
            if (fields.find((x) => (x as any).productId == item.id)) {
              toast.info("Sản phẩm này đã được chọn");
              return;
            }
            const discountItem: DiscountItem = {
              productId: item.id,
              product: item,
              discountUnit: "VND",
              discountValue: 0,
              maxDiscount: 0,
            };
            append(discountItem);
            setOpenDiscountItem(discountItem);
          }}
        />
        <DiscountItemDialog
          isOpen={!!openDiscountItem}
          onClose={() => setOpenDiscountItem(null)}
          discountItem={openDiscountItem}
          onChange={(item) => {
            const index = discountItems.findIndex((x) => x.productId == openDiscountItem.productId);
            const discountItem = discountItems[index];
            update(index, {
              ...discountItem,
              ...item,
            });
          }}
        />
      </div>
    </>
  );
}

function DiscountItemDialog({
  discountItem,
  onChange,
  ...props
}: {
  discountItem: DiscountItem;
  onChange: ({ discountUnit, discountValue, maxDiscount }) => any;
} & DialogProps) {
  const [discountUnit, setDiscountUnit] = useState<DiscountUnit>();
  const [discountValue, setDiscountValue] = useState<number>();
  const [maxDiscount, setMaxDiscount] = useState();

  useEffect(() => {
    if (discountItem) {
      setDiscountUnit(discountItem.discountUnit);
      setDiscountValue(discountItem.discountValue);
    }
  }, [discountItem]);

  const discountPrice = useMemo(
    () =>
      calculateSalePrice(
        discountItem?.product?.basePrice || 0,
        discountUnit,
        discountValue,
        maxDiscount
      ),
    [discountItem, discountUnit, discountValue, maxDiscount]
  );

  return (
    <>
      <Dialog
        width="480px"
        extraBodyClass="grid grid-cols-12 gap-x-4"
        title="Chỉnh thông tin giảm giá sản phẩm"
        {...props}
      >
        <Dialog.Body>
          <Field label="Sản phẩm" cols={12}>
            <Input value={discountItem?.product?.name} readOnly />
          </Field>
          <Field label="Giá gốc" cols={6}>
            <Input number value={discountItem?.product?.basePrice} readOnly />
          </Field>
          <Field label="Giá sau khi giảm" cols={6}>
            <Input number value={discountPrice} readOnly />
          </Field>
          <Field label="Loại giảm giá" cols={6}>
            <Select
              options={DISCOUNT_BILL_UNITS}
              defaultValue="VND"
              value={discountUnit}
              onChange={setDiscountUnit}
            />
          </Field>
          <Field label="Giá trị giảm" cols={6}>
            <Input
              number
              suffix={discountUnit == "VND" ? "VND" : "%"}
              value={discountValue}
              onChange={(_, val) => setDiscountValue(val)}
            />
          </Field>
          <Accordion isOpen={discountUnit === "PERCENT"} className="col-span-6">
            <Field label="Giảm tối đa" cols={6}>
              <Input
                number
                suffix="VND"
                value={maxDiscount}
                onChange={(_, val) => setMaxDiscount(val)}
              />
            </Field>
          </Accordion>
          <Form.Footer
            onCancel={() => {
              props.onClose();
            }}
            submitProps={{
              submit: false,
              onClick: () => {
                onChange({ discountUnit, discountValue, maxDiscount });
                props.onClose();
              },
            }}
          />
        </Dialog.Body>
      </Dialog>
    </>
  );
}

function OfferItemsFields() {
  const offerItemsRef = useRef();
  const { fields, append, update, remove } = useFieldArray({ name: "offerItems" });
  const toast = useToast();
  const [openOfferItem, setOpenOfferItem] = useState<OfferItem>();
  const offerItems = fields as ({ id: string } & OfferItem)[];

  return (
    <>
      <div className="col-span-12">
        <Label text="Các sản phẩm được tặng" />
        {offerItems?.map((item, index) => (
          <ProductItem
            type="OFFER_ITEM"
            name={`offerItems.${index}`}
            item={item}
            onClick={() => setOpenOfferItem(item)}
            onRemove={() => {
              remove(index);
            }}
          />
        ))}
        <Button
          className="px-0 mb-4"
          textPrimary
          icon={<RiAddFill />}
          text="Chọn sản phẩm"
          innerRef={offerItemsRef}
        />
        <ProductSelectionPopover
          items={offerItems}
          reference={offerItemsRef}
          onProductSelect={(item) => {
            if (offerItems.find((x) => (x as any).productId == item.id)) {
              toast.info("Sản phẩm này đã được chọn");
              return;
            }
            const offerItem = {
              productId: item.id,
              product: item,
              qty: 1,
              note: "",
            };
            append(offerItem);
            setOpenOfferItem(offerItem);
          }}
        />
        <OfferItemDialog
          isOpen={!!openOfferItem}
          onClose={() => setOpenOfferItem(null)}
          offerItem={openOfferItem}
          onChange={(item) => {
            const index = offerItems.findIndex((x) => x.productId == openOfferItem.productId);
            const offerItem = offerItems[index];
            update(index, {
              ...offerItem,
              ...item,
            });
          }}
        />
      </div>
    </>
  );
}

function OfferItems2Fields() {
  const { fields, append, update, remove } = useFieldArray({ name: "offerItemGroups" });
  const offerItemGroups = fields as ({ id: string } & OfferItem[])[];

  return (
    <div className="col-span-12">
      <Label text="Các nhóm sản phẩm được tặng" />
      {offerItemGroups?.map((group, index) => (
        <OfferItemGroupFields index={index} onRemove={() => remove(index)} key={group.id} />
      ))}
      <Button
        outline
        className="mt-2 mb-4 bg-white"
        text="Thêm nhóm"
        onClick={() => {
          append([[]]);
        }}
      />
    </div>
  );
}

function OfferItemGroupFields({ index, onRemove }: { index: number; onRemove: () => any }) {
  const toast = useToast();
  const offerItemsRef = useRef();
  const { fields, append, update, remove } = useFieldArray({ name: `offerItemGroups.${index}` });
  const group = fields as ({ id: string } & OfferItem)[];
  const [openOfferItem, setOpenOfferItem] = useState<OfferItem>();

  return (
    <>
      <div className="pl-1 mb-2 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mb-1 font-bold text-primary">NHÓM {index + 1}</div>
          <Button
            icon={<RiDeleteBin6Line />}
            tooltip="Xóa nhóm"
            className="ml-auto mr-0"
            hoverDanger
            onClick={() => {
              onRemove();
            }}
          ></Button>
        </div>
        {group?.map((item, itemIndex) => (
          <ProductItem
            type="OFFER_ITEM_2"
            name={`offerItemGroups.${index}.${itemIndex}`}
            item={item}
            onClick={() => {
              setOpenOfferItem(item);
            }}
            onRemove={() => {
              remove(index);
            }}
          />
        ))}
        <Button
          className="px-0"
          textPrimary
          icon={<RiAddFill />}
          text="Chọn sản phẩm"
          innerRef={offerItemsRef}
        />
        <ProductSelectionPopover
          reference={offerItemsRef}
          items={group}
          onProductSelect={(item) => {
            if (group.find((x) => x.productId == item.id)) {
              toast.info("Sản phẩm này đã được chọn");
              return;
            }
            const offerItem: OfferItem = {
              productId: item.id,
              product: item,
              qty: 1,
              note: "",
            };
            append(offerItem);
            setOpenOfferItem(offerItem);
          }}
        />
        <OfferItemDialog
          isOpen={!!openOfferItem}
          onClose={() => setOpenOfferItem(null)}
          offerItem={openOfferItem}
          onChange={(item) => {
            const index = group.findIndex((x) => x.productId == openOfferItem.productId);
            const offerItem = group[index];
            update(index, {
              ...offerItem,
              ...item,
            });
          }}
        />
      </div>
    </>
  );
}

function OfferItemDialog({
  offerItem,
  onChange,
  ...props
}: {
  offerItem: OfferItem;
  onChange: ({ qty, note }) => any;
} & DialogProps) {
  const [qty, setQty] = useState<number>(1);
  const [note, setNote] = useState<string>();

  useEffect(() => {
    if (offerItem) {
      setQty(offerItem.qty);
      setNote(offerItem.note);
    }
  }, [offerItem]);

  return (
    <>
      <Dialog
        width="480px"
        extraBodyClass="grid grid-cols-12 gap-x-4"
        title="Chỉnh thông tin sản phẩm"
        {...props}
      >
        <Dialog.Body>
          <Field label="Sản phẩm" cols={12}>
            <Input value={offerItem?.product?.name} readOnly />
          </Field>
          <Field label="Số lượng" cols={4} required>
            <Input number defaultValue={1} value={qty} onChange={(_, val) => setQty(val)} />
          </Field>
          <Field label="Ghi chú" cols={8}>
            <Input value={note} onChange={setNote} />
          </Field>
          <Form.Footer
            onCancel={() => {
              props.onClose();
            }}
            submitProps={{
              submit: false,
              onClick: () => {
                onChange({ qty, note });
                props.onClose();
              },
            }}
          />
        </Dialog.Body>
      </Dialog>
    </>
  );
}

function SamePriceFields() {
  const { watch } = useFormContext();
  const offerAllItem: boolean = watch("offerAllItem");
  const toast = useToast();
  const offerItemsRef = useRef();
  const samePrice = watch("samePrice");
  const [openOfferItem, setOpenOfferItem] = useState<OfferItem>();
  const { fields, append, update, remove } = useFieldArray({ name: "offerItems" });
  const offerItems = fields as ({ id: string } & OfferItem)[];

  return (
    <div className="col-span-12">
      <div className="flex">
        <Field name="samePrice" label="Đồng giá">
          <Input number suffix="VND" className="w-60" />
        </Field>
        <div className="flex flex-1 ml-4">
          <Field name="offerAllItem" className="mt-auto mb-0">
            <Checkbox placeholder="Đồng giá tất cả" />
          </Field>
          <i
            className="text-base inline-block ml-1.5 text-gray-500 my-auto"
            data-tooltip="Đồng giá sẽ áp dụng cho tất cả sản phẩm có giá cao hơn mức đồng giá. Trường hợp giá tương đương hoặc thấp hơn thì sẽ không phát sinh đồng giá"
          >
            <FaInfoCircle />
          </i>
        </div>
      </div>
      <Accordion isOpen={offerAllItem}>
        <Field name="offerQty" label="Số lượng tặng">
          <Input className="w-60" number />
        </Field>
        <Field name="offerHighestPrice" className="mt-auto mb-0">
          <Checkbox placeholder="Ưu tiên sản phẩm có giá trị cao nhất" />
        </Field>
      </Accordion>
      <Accordion isOpen={!offerAllItem}>
        <Field name="autoAddOfferItem" className="">
          <Checkbox placeholder="Tự động thêm sản phẩm đồng giá" />
        </Field>
        <Label text="Các sản phẩm đồng giá" />
        {offerItems?.map((item, index) => (
          <ProductItem
            key={item.id}
            type="SAME_PRICE"
            samePrice={samePrice || 0}
            name={`offerItems.${index}`}
            item={item}
            onClick={() => {
              setOpenOfferItem(item);
            }}
            onRemove={() => {
              remove(index);
            }}
          />
        ))}
        <Button
          className="px-0 mb-4"
          textPrimary
          icon={<RiAddFill />}
          text="Chọn sản phẩm"
          innerRef={offerItemsRef}
        />
      </Accordion>

      <ProductSelectionPopover
        items={offerItems}
        reference={offerItemsRef}
        onProductSelect={(item) => {
          if (offerItems.find((x) => x.productId == item.id)) {
            toast.info("Sản phẩm này đã được chọn");
            return;
          }
          const offerItem: OfferItem = {
            productId: item.id,
            product: item,
            qty: 1,
            note: "",
          };
          append(offerItem);
          setOpenOfferItem(offerItem);
        }}
      />

      <OfferItemDialog
        isOpen={!!openOfferItem}
        onClose={() => setOpenOfferItem(null)}
        offerItem={openOfferItem}
        onChange={(item) => {
          const index = offerItems.findIndex((x) => x.productId == openOfferItem.productId);
          const offerItem = offerItems[index];
          update(index, {
            ...offerItem,
            ...item,
          });
        }}
      />
    </div>
  );
}

function SamePrice2Fields() {
  const { fields, append, remove } = useFieldArray({ name: "offerItemGroups2" });
  const offerItemGroups2 = fields as ({ id: string } & OfferItemGroup)[];

  return (
    <div className="col-span-12">
      <Label text="Các nhóm sản phẩm được tặng" />
      {offerItemGroups2?.map((group, index) => (
        <div className="pl-1 mb-2 border-b border-gray-200" key={index}>
          <div className="flex items-center">
            <div className="mb-1 font-bold text-primary">NHÓM {index + 1}</div>
            <Button
              icon={<RiDeleteBin6Line />}
              tooltip="Xóa nhóm"
              className="ml-auto mr-0"
              hoverDanger
              onClick={() => {
                remove(index);
              }}
            ></Button>
          </div>
          <Field name={`offerItemGroups2.${index}.samePrice`} label="Đồng giá nhóm">
            <Input number suffix="VND" className="w-60" />
          </Field>
          <SamePrice2ItemFields index={index} />
        </div>
      ))}
      <Button
        outline
        className="mt-2 mb-4 bg-white"
        text="Thêm nhóm"
        onClick={() => {
          append({ items: [], samePrice: 0 });
        }}
      />
    </div>
  );
}

function SamePrice2ItemFields({ index }: { index: number }) {
  const { watch } = useFormContext();
  const samePrice = watch(`offerItemGroups2.${index}.samePrice`);
  const { fields, append, update, remove } = useFieldArray({
    name: `offerItemGroups2.${index}.items`,
  });
  const offerItems = fields as ({ id: string } & OfferItem)[];
  const offerItemsRef = useRef();
  const toast = useToast();
  const [openOfferItem, setOpenOfferItem] = useState<OfferItem>();

  return (
    <>
      {offerItems.map((item, itemIndex) => (
        <ProductItem
          type="SAME_PRICE_2"
          name={`offerItemGroups2.${index}.items.${itemIndex}`}
          item={item}
          samePrice={samePrice}
          onClick={() => {
            setOpenOfferItem(item);
          }}
          onRemove={() => {
            remove(itemIndex);
          }}
        />
      ))}
      <Button
        className="px-0"
        textPrimary
        icon={<RiAddFill />}
        text="Chọn sản phẩm"
        innerRef={offerItemsRef}
      />
      <ProductSelectionPopover
        reference={offerItemsRef}
        items={offerItems}
        onProductSelect={(item) => {
          if (offerItems?.find((x) => x.productId == item.id)) {
            toast.info("Sản phẩm này đã được chọn");
            return;
          }
          const offerItem: OfferItem = {
            productId: item.id,
            product: item,
            qty: 1,
            note: "",
          };
          append(offerItem);
          setOpenOfferItem(offerItem);
        }}
      />
      <OfferItemDialog
        isOpen={!!openOfferItem}
        onClose={() => setOpenOfferItem(null)}
        offerItem={openOfferItem}
        onChange={(item) => {
          const index = offerItems.findIndex((x) => x.productId == openOfferItem.productId);
          const offerItem = offerItems[index];
          update(index, {
            ...offerItem,
            ...item,
          });
        }}
      />
    </>
  );
}

function ProductItem({
  name,
  type,
  item,
  hasSalePrice = false,
  samePrice,
  onRemove,
  onClick,
}: {
  name: string;
  type: ShopVoucherType;
  hasSalePrice?: boolean;
  item: DiscountItem | OfferItem;
  samePrice?: number;
  onRemove: () => any;
  onClick: () => any;
}) {
  const { register } = useFormContext();
  const { isSubmitting } = useFormState();

  let fieldNames = [];
  switch (type) {
    case "DISCOUNT_ITEM": {
      fieldNames = ["productId", "discountUnit", "discountValue", "maxDiscount"];
      break;
    }
    case "OFFER_ITEM":
    case "OFFER_ITEM_2":
    case "SAME_PRICE":
    case "SAME_PRICE_2": {
      fieldNames = ["productId", "qty", "note"];
    }
  }
  for (let fieldName of fieldNames) {
    register(`${name}.${fieldName}`);
  }

  return (
    <div
      className={`flex bg-white ${isSubmitting ? "opacity-60 pointer-events-none" : ""
        } border border-gray-300 hover:border-primary transition-colors duration-150 shadow-sm rounded mb-2 p-3 cursor-pointer`}
      key={item.productId}
      onClick={onClick}
    >
      <Img className="rounded w-14" src={item.product.image} compress={50} />
      <div className="flex-1 pl-3 font-semibold">
        <div className="text-gray-800">{item.product.name}</div>
        {(item as OfferItem).note && (
          <div className="text-sm font-normal text-gray-600">{(item as OfferItem).note}</div>
        )}
        <div className="flex items-center">
          <span className="text-gray-600 line-through">
            {parseNumber(item.product.basePrice, true)}
          </span>
          <i className="mx-3">
            <RiArrowRightLine />
          </i>
          {hasSalePrice ? (
            <span className="text-danger">
              {parseNumber(
                calculateSalePrice(
                  item.product.basePrice,
                  (item as DiscountItem).discountUnit,
                  (item as DiscountItem).discountValue,
                  (item as DiscountItem).maxDiscount
                ),
                true
              )}
            </span>
          ) : (
            <>
              {samePrice !== undefined ? (
                <span className="text-danger">
                  {parseNumber(samePrice, true)}{" "}
                  <span className="pl-1 text-sm font-normal text-gray-600">
                    (tối đa {(item as OfferItem).qty} món)
                  </span>
                </span>
              ) : (
                <span className="text-success">Tặng {(item as OfferItem).qty}</span>
              )}
            </>
          )}
        </div>
      </div>
      <Button
        className="w-8 h-8 px-0"
        iconClassName="text-2xl"
        icon={<RiCloseFill />}
        hoverDanger
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    </div>
  );
}
const calculateSalePrice = (
  basePrice,
  discountUnit: "VND" | "PERCENT",
  discountValue,
  maxDiscount
) => {
  if (!discountUnit || !discountValue) return basePrice;

  let discount = 0;
  if (discountUnit == "VND") {
    discount = discountValue;
  } else {
    discount = (basePrice * discountValue) / 100;
  }
  if (maxDiscount && discountUnit == "PERCENT")
    discount = discount > maxDiscount ? maxDiscount : discount;
  return basePrice - discount;
};
