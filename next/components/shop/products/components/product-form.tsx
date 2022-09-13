import cloneDeep from "lodash/cloneDeep";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  RiAddCircleLine,
  RiAddFill,
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowUpLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiImageAddFill,
  RiStarFill,
} from "react-icons/ri";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { useToggle } from "../../../../lib/hooks/useToggle";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Category, CategoryService } from "../../../../lib/repo/category.repo";
import { ProductLabelService, PRODUCT_LABEL_COLORS } from "../../../../lib/repo/product-label.repo";
import { ProductTopping } from "../../../../lib/repo/product-topping.repo";
import { Product, ProductLabel, ProductService } from "../../../../lib/repo/product.repo";
import { ShopBranchService } from "../../../../lib/repo/shop-branch.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Slideout } from "../../../shared/utilities/dialog/slideout";
import { Button } from "../../../shared/utilities/form/button";
import { Editor } from "../../../shared/utilities/form/editor";
import { Field } from "../../../shared/utilities/form/field";
import { Form } from "../../../shared/utilities/form/form";
import { ImageInput } from "../../../shared/utilities/form/image-input";
import { Input } from "../../../shared/utilities/form/input";
import { Label } from "../../../shared/utilities/form/label";
import { Select } from "../../../shared/utilities/form/select";
import { Switch } from "../../../shared/utilities/form/switch";
import { Accordion, Img, Scrollbar, Spinner } from "../../../shared/utilities/misc";
import { AvatarUploader } from "../../../shared/utilities/uploader/avatar-uploader";
import { ProductToppingFields } from "../../product-toppings/components/product-topping-table-form";
import { useProductsContext } from "../providers/products-provider";
import { ToppingSelection } from "./topping-selection";

interface PropsType extends DialogProps {
  id: string;
  category: Category;
}
export function ProductForm({ id, category, ...props }: PropsType) {
  const toast = useToast();
  const { onProductChange } = useProductsContext();
  const [labels, setLabels] = useState<ProductLabel[]>(null);
  const [openLabel, setOpenLabel] = useState<ProductLabel>(undefined);
  const { shopConfig } = useShopLayoutContext();
  const [openAdvance, setOpenAdvance] = useState(false);
  const [product, setProduct] = useState<Product>(undefined);
  const { staffPermission } = useAuth();

  useEffect(() => {
    setProduct(undefined);
    if (id) {
      ProductService.getOne({ id }).then((res) => {
        setProduct(cloneDeep(res));
      });
    } else if (id === null) {
      setProduct(null);
    }
  }, [id]);

  useEffect(() => {
    setLabels(cloneDeep(product?.labels || []));
  }, [product]);

  return (
    <>
      <Slideout width={product ? "1080px" : "650px"} isOpen={props.isOpen} onClose={props.onClose}>
        <Scrollbar height={"100vh"}>
          <Form
            className="p-6"
            grid
            extraDialogClass="bg-transparent"
            extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
            extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
            {...(product !== undefined ? { title: `${product ? "Chỉnh sửa" : "Thêm"} món` } : {})}
            defaultValues={product}
            validate={{
              toppings: (data) => {
                if (data.toppings.find((topping) => !topping.name)) {
                  toast.info("Cần nhập đầy đủ tên topping");
                  return "Bắt buộc";
                }
                if (
                  data.toppings.find((topping) => topping.options.find((option) => !option.name))
                ) {
                  toast.info("Cần nhập đầy đủ tên lựa chọn");
                  return "Bắt buộc";
                }
                return "";
              },
            }}
            onSubmit={async (data) => {
              const { categoryId } = data;
              try {
                if (data?.toppings?.find((topping) => !topping.name)) {
                  toast.info("Cần nhập đầy đủ tên topping");
                  return "Bắt buộc";
                }
                if (
                  data?.toppings?.find((topping) => topping?.options?.find((option) => !option.name))
                ) {
                  toast.info("Cần nhập đầy đủ tên lựa chọn toppings");
                  return "Bắt buộc";
                }
                let res = await ProductService.createOrUpdate({
                  id: product?.id,
                  data: {
                    ...data,
                    toppings: product?.id
                      ? data.toppings?.filter((topping) => topping.options?.length) || []
                      : undefined,
                    labelIds: product?.id ? labels.map((x) => x.id) : undefined,
                    categoryId: product?.id ? categoryId : category.id,
                  },
                  toast,
                });
                onProductChange(res, category);
                props.onClose();
              } catch (err) {
                console.error(err);
              }
            }}
          >
            {product === undefined ? (
              <Spinner className="col-span-12 py-20" />
            ) : (
              <>
                <div
                  className={`${product ? "col-span-6" : "col-span-12"
                    } grid grid-cols-12 gap-x-5 auto-rows-min`}
                >
                  <Form.Title title="Thông tin món" />
                  {product && <ImageFields />}
                  <Field name="name" label="Tên sản phẩm" cols={12} required
                    validation={{
                      nameValidator: (value) => validateKeyword(value)
                    }}
                  >
                    <Input className="h-12 mt-2" />
                  </Field>
                  <Field name="basePrice" label="Giá bán" cols={12} required

                  >
                    <Input className="h-12 mt-2" number currency />
                  </Field>
                  <Field name="" label="Mã SKU" cols={12} validation={{ code: true }}>
                    <Input className="h-12 mt-2" />
                  </Field>
                  {product && (
                    <>
                      <Field name="downPrice" label="Giá bị giảm" cols={6}>
                        <Input className="h-12 mt-2" number currency />
                      </Field>
                      <Field
                        name="saleRate"
                        label="Phần trăm giảm"
                        cols={6}
                        validation={{ min: 0, max: 100 }}
                      >
                        <Input className="h-12 mt-2" number suffix="%" />
                      </Field>
                      <Field
                        name="limitSale"
                        label="Số lượng tồn kho giới hạn"
                        description="Nhập 0 nếu không giới hạn"
                        cols={6}
                      >
                        <Input className="h-12 mt-2" number />
                      </Field>
                      <Field name="limitSaleByDay" label=" " cols={6}>
                        <Switch placeholder="Giới hạn tồn kho theo ngày" className="pt-8 text-sm" />
                      </Field>
                      <Field name="branchIds" label="Cửa hàng có sản phẩm" cols={12}>
                        <Select
                          className="inline-grid h-12"
                          optionsPromise={() => ShopBranchService.getAllOptionsPromise()}
                          multi
                        />
                      </Field>
                      <Field name="subtitle" label="Mô tả ngắn" cols={12}>
                        <Input className="h-12 mt-2" />
                      </Field>
                      <Field label="Danh mục" name="categoryId" cols={12}>
                        <Select
                          className="h-12 mt-2"
                          optionsPromise={() =>
                            CategoryService.getAll({ query: { limit: 0 } }).then((res) =>
                              res.data.map((x) => ({ value: x.id, label: x.name }))
                            )
                          }
                        />
                      </Field>
                      <RatingField />
                      <Field name="soldQty" label="Đã bán" cols={4}>
                        <Input className="h-12 mt-2" number />
                      </Field>
                      <Field name="upsaleProductIds" label="Món mua kèm" cols={12}>
                        <Select
                          className="inline-grid h-12"
                          optionsPromise={() =>
                            ProductService.getAllOptionsPromise({
                              fragment: "id name image basePrice",
                              parseOption: (data) => ({
                                value: data.id,
                                label: data.name,
                                image: data.image,
                                basePrice: data.basePrice,
                              }),
                              query: {
                                filter: { _id: { $ne: product.id } },
                              },
                            })
                          }
                          placeholder="Nhập hoặc tìm kiếm món mua kèm"
                          multi
                          hasImage
                        />
                      </Field>
                      <div className="col-span-12 mb-6">
                        <Label text="Nhãn sản phẩm (Tối đa 1 nhãn)" />
                        <div className="flex flex-wrap gap-3 mt-2">
                          {labels?.map((label, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center px-4 py-2 font-semibold text-gray-100 rounded-full cursor-pointer hover:text-white whitespace-nowrap animate-emerge"
                              style={{ backgroundColor: label.color }}
                              onClick={() => setOpenLabel(label)}
                            >
                              <span className="mr-1">{label.name}</span>
                              <i
                                className="text-gray-100 rounded-full hover:bg-white hover:text-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  labels.splice(index, 1);
                                  setLabels([...labels]);
                                }}
                              >
                                <RiCloseLine />
                              </i>
                            </div>
                          ))}
                          {labels?.length < 1 && (
                            <Button
                              className="inline-flex bg-white rounded-full animate-emerge"
                              icon={<RiAddCircleLine />}
                              outline
                              text="Thêm nhãn"
                              onClick={() => setOpenLabel(null)}
                            />
                          )}
                        </div>
                      </div>
                      <Field
                        name="cover"
                        label="Ảnh chi tiết món"
                        description="Tỉ lệ 4:3. Dùng ảnh sản phẩm nếu không có."
                        cols={5}
                      >
                        <ImageInput percent={75} cover largeImage />
                      </Field>
                      <Field
                        name="image_16_9"
                        label="Ảnh chi tiết món"
                        description="Tỉ lệ 16:9. Dùng ảnh sản     phẩm nếu không có."
                        cols={7}
                      >
                        <ImageInput ratio169 cover largeImage />
                      </Field>
                      <Field name="images" label="Danh sách hình ảnh" cols={12}>
                        <ImageInput multi />
                      </Field>
                      <Field label="Mô tả chi tiết" name="intro" cols={12}>
                        <Editor />
                      </Field>
                      <Field name="youtubeLink" label="Đường dẫn youtube" cols={12}>
                        <Input className="h-12" type="url" />
                      </Field>

                      <div
                        className="flex justify-between cursor-pointer col-span-full group"
                        onClick={() => setOpenAdvance(!openAdvance)}
                      >
                        <Form.Title className="group-hover:text-primary" title="Cài đặt nâng cao" />
                        <i
                          className={`transform flex-center transition group-hover:text-primary w-6 h-6 text-2xl origin-center ${openAdvance ? "rotate-180" : ""
                            }`}
                        >
                          <RiArrowDownSLine />
                        </i>
                      </div>
                      <Accordion
                        isOpen={openAdvance}
                        className="grid grid-cols-12 col-span-12 gap-x-5"
                      >
                        {shopConfig.rewardPointConfig.rewardBy === "product" && (
                          <Field name="rewardPoint" label="Điểm thưởng" cols={6}>
                            <Input className="h-12 mt-2" number />
                          </Field>
                        )}
                        <Field name="commission2" label="Hoa hồng cộng tác viên" cols={6}>
                          <Input className="h-12 mt-2" number currency />
                        </Field>
                      </Accordion>
                    </>
                  )}
                </div>
                {product && <ToppingFields />}
                <Form.Footer
                  className="justify-center"
                  cancelText=""
                  submitText={`${product ? "Chỉnh sửa" : "Thêm"} món`}
                  submitProps={{
                    className: "h-14 w-64",
                    disabled: !staffPermission("WRITE_PRODUCTS"),
                  }}
                />
              </>
            )}
          </Form>

          <Form
            dialog
            width={450}
            defaultValues={openLabel}
            isOpen={openLabel !== undefined}
            onClose={() => setOpenLabel(undefined)}
            title={`${openLabel ? "Chỉnh sửa" : "Thêm"} nhãn`}
            onSubmit={async (data) => {
              const { name, color } = data;
              if (openLabel) {
                if (!name || !color) {
                  toast.info("Cần nhập tên và màu nhãn");
                  return;
                }
                let label = await ProductLabelService.update({
                  id: openLabel.id,
                  data: { name, color },
                  toast,
                });
                const index = labels.findIndex((x) => x.id == label.id);
                labels[index] = label;
                setLabels([...labels]);
              } else {
                if (data.create) {
                  if (!name || !color) {
                    toast.info("Cần nhập tên và màu nhãn");
                    return;
                  }
                  let label = await ProductLabelService.create({
                    data: { name, color },
                    toast,
                  });
                  setLabels([...labels, label]);
                } else {
                  if (!data.labelData) {
                    toast.info("Cần nhập tên và màu nhãn");
                    return;
                  }
                  setLabels([...labels, data.labelData]);
                }
              }
              setOpenLabel(undefined);
            }}
          >
            <LabelFields openLabel={openLabel} labels={product?.labels} />
          </Form>
        </Scrollbar>
      </Slideout>
    </>
  );
}

function ImageFields() {
  const { watch, setValue, register } = useFormContext();
  register("image");
  const image = watch("image");
  const avatarUploaderRef = useRef<any>();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  return (
    <div className="col-span-12 mb-3">
      <Label text="Hình sản phẩm" />
      <div className="flex">
        <div className="w-24 h-24 overflow-hidden bg-white border border-gray-300 rounded-lg flex-center">
          {image ? (
            <Img className="w-full" compress={300} lazyload={false} src={image} showImageOnClick />
          ) : (
            <i className="text-4xl text-gray-500">
              <RiImageAddFill />
            </i>
          )}
        </div>
        <div className="flex-col flex-1 p-4 ml-4 bg-white border border-gray-300 border-dashed rounded flex-center">
          <span className="text-sm">
            Ảnh PNG, JPEG, JPG không vượt quá 10Mb. Tỉ lệ khuyến nghị 1:1.
          </span>
          <Button
            className="px-3 text-sm h-9 hover:underline"
            textPrimary
            text="Tải ảnh lên"
            isLoading={uploadingAvatar}
            onClick={() => {
              avatarUploaderRef.current().onClick();
            }}
          />
          <AvatarUploader
            onRef={(ref) => {
              avatarUploaderRef.current = ref;
            }}
            onUploadingChange={setUploadingAvatar}
            onImageUploaded={(val) => setValue("image", val)}
          />
        </div>
      </div>
    </div>
  );
}

function ToppingFields() {
  const { fields, append, move, remove } = useFieldArray({ name: "toppings" });
  const [openToppingSelection, setOpenToppingSelection] = useState(false);

  return (
    <div className={`col-span-6 grid grid-cols-12 gap-x-5 auto-rows-min`}>
      <Form.Title title="Thông tin tuỳ chọn" />
      <div className="col-span-12">
        <Label
          text="Danh sách topping"
          description="Chọn topping từ mẫu và chỉnh sửa lại cho phù hợp"
        />
        {(fields as ({ id: string } & ProductTopping)[])?.map((topping, index) => (
          <div
            className="grid grid-cols-12 p-4 mt-3 bg-white rounded shadow-md gap-x-5"
            key={topping.id}
          >
            <div className="flex col-span-12 mb-1 font-semibold uppercase text-primary">
              <span>Topping {index + 1}</span>
              <Button
                className="h-auto px-2 ml-auto"
                icon={<RiArrowUpLine />}
                tooltip="Di chuyển lên"
                disabled={index == 0}
                onClick={() => {
                  move(index, index - 1);
                }}
              />
              <Button
                className="h-auto px-2"
                icon={<RiArrowDownLine />}
                tooltip="Di chuyển xuống"
                disabled={index == fields.length - 1}
                onClick={() => {
                  move(index, index + 1);
                }}
              />
              <Button
                className="h-auto px-2 pr-0"
                icon={<RiDeleteBin6Line />}
                text="Xoá"
                hoverDanger
                onClick={() => {
                  remove(index);
                }}
              />
            </div>
            <ProductToppingFields name={`toppings.${index}`} productTopping={topping} />
          </div>
        ))}
        <Button
          className="px-0 my-3"
          textPrimary
          icon={<RiAddFill />}
          text="Chọn mẫu topping"
          onClick={() => setOpenToppingSelection(true)}
        />
        <Dialog isOpen={openToppingSelection} onClose={() => setOpenToppingSelection(false)}>
          <ToppingSelection
            onToppingSelect={(topping) => {
              append(topping);
              setOpenToppingSelection(false);
            }}
          />
        </Dialog>
      </div>
    </div>
  );
}

function LabelFields({ openLabel, labels }) {
  const { watch, register, setValue } = useFormContext();
  const create: boolean = watch("create");
  register("labelData");

  return (
    <>
      {!openLabel && (
        <>
          <Field
            name="label"
            label="Chọn nhãn"
            className={`${create ? "opacity-70 pointer-events-none" : ""}`}
          >
            <Select
              readOnly={create}
              optionsPromise={() =>
                ProductLabelService.getAllOptionsPromise({
                  query: { limit: 0, filter: { _id: { $nin: labels.map((x) => x.id) } } },
                  parseOption: (data) => ({
                    value: data.id,
                    label: data.name,
                    color: data.color,
                    data,
                  }),
                })
              }
              onChange={(_, fullData) => {
                setValue("labelData", fullData.data);
              }}
              hasColor
            />
          </Field>
          <hr />
          <Field className="my-2" noError name="create">
            <Switch placeholder="Tạo nhãn mới" />
          </Field>
        </>
      )}
      <div className={`${create || openLabel ? "" : "opacity-70 pointer-events-none"}`}>
        <Field name="name" label="Tên nhãn" validation={{
          labelValidator: (val) => validateKeyword(val)
        }}>
          <Input readOnly={!create && !openLabel} />
        </Field>
        <Field name="color" label="Màu nhãn">
          <Select options={PRODUCT_LABEL_COLORS} hasColor readOnly={!create && !openLabel} />
        </Field>
      </div>
      <Form.Footer submitText={`${openLabel ? "Chỉnh sửa" : create ? "Thêm" : "Chọn"} nhãn`} />
    </>
  );
}

function RatingField() {
  const { watch } = useFormContext();
  const rating = watch("rating");

  return (
    <Field name="rating" label="Đánh giá" validation={{ min: 0, max: 5 }} cols={8}>
      <Input
        className="h-12 mt-2"
        number
        decimal
        suffix={
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map((star) => {
              let width = "0";
              const rest = rating - star + 1;
              if (rest >= 1) {
                width = "100%";
              } else if (rest > 0) {
                let percent = rest * 100 + 2;
                width = (percent > 100 ? 100 : percent) + "%";
              }
              return (
                <div className="relative mr-2" key={star}>
                  <i className="text-xl text-gray-400">
                    <RiStarFill />
                  </i>
                  <i
                    className="absolute top-0 left-0 h-full overflow-hidden text-xl text-yellow-400"
                    style={{ width }}
                  >
                    <RiStarFill />
                  </i>
                </div>
              );
            })}
          </div>
        }
      />
    </Field>
  );
}
