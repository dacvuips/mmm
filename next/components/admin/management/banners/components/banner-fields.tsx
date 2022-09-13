import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { BannerActionType, BANNER_ACTIONS } from "../../../../../lib/repo/banner.repo";
import { MemberService } from "../../../../../lib/repo/member.repo";
import { ProductService } from "../../../../../lib/repo/product.repo";
import { ShopVoucherService } from "../../../../../lib/repo/shop-voucher.repo";
import { Field, ImageInput, Input, Select } from "../../../../shared/utilities/form";
import { Accordion } from "../../../../shared/utilities/misc";

export function BannerFields() {
  return (
    <>
      <Field name="image" label="Hình banner" cols={5} required>
        <ImageInput largeImage ratio169 cover />
      </Field>
      <div className="grid-cols-12 col-span-7 gap-3">
        <Field name="actionType" label="Loại hành động" cols={8} required>
          <Select options={BANNER_ACTIONS} />
        </Field>
        <Field name="priority" label="Ưu tiên" cols={4}>
          <Input number />
        </Field>
        <Field name="position" label="Vị trí hiển thị" cols={4}>
          <Input />
        </Field>
        <ActionTypeFields />
      </div>
    </>
  );
}

function ActionTypeFields() {
  const { watch, setValue } = useFormContext();
  const actionType: BannerActionType = watch("actionType");
  const memberId: BannerActionType = watch("memberId");
  const hasShop = useMemo(
    () => actionType == "SHOP" || actionType == "PRODUCT" || actionType == "VOUCHER",
    [actionType]
  );

  return (
    <>
      <Accordion className="col-span-12" isOpen={hasShop}>
        <Field label="Chọn cửa hàng" name="memberId" cols={12} required={hasShop}>
          <Select
            onChange={() => {
              setValue("productId", null);
              setValue("voucherId", null);
            }}
            autocompletePromise={(props) =>
              MemberService.getAllAutocompletePromise(props, {
                fragment: "id shopName shopLogo",
                parseOption: (data) => ({
                  value: data.id,
                  label: data.shopName,
                  image: data.shopLogo,
                }),
              })
            }
          />
        </Field>
      </Accordion>
      <Accordion className="col-span-12" isOpen={actionType == "WEBSITE"}>
        <Field name="link" label="Đường dẫn website" cols={12} required={actionType == "WEBSITE"}>
          <Input type="url" />
        </Field>
      </Accordion>
      <Accordion className="col-span-12" isOpen={memberId && actionType == "PRODUCT"}>
        <Field label="Chọn món" name="productId" cols={12} required={actionType == "PRODUCT"}>
          <Select
            autocompletePromise={(props) =>
              ProductService.getAllAutocompletePromise(props, {
                fragment: "id name image basePrice",
                query: { filter: { memberId: memberId || undefined } },
                parseOption: (data) => ({
                  value: data.id,
                  label: data.name,
                  image: data.image,
                  basePrice: data.basePrice,
                }),
              })
            }
          />
        </Field>
      </Accordion>
      <Accordion className="col-span-12" isOpen={memberId && actionType == "VOUCHER"}>
        <Field label="Chọn món" name="voucherId" cols={12} required={actionType == "VOUCHER"}>
          <Select
            autocompletePromise={({ id, search }) =>
              ShopVoucherService.getAllAutocompletePromise(
                { id, search },
                {
                  fragment: "id code description",
                  query: { filter: { memberId: memberId || undefined } },
                  parseOption: (data) => ({
                    value: data.id,
                    label: `【${data.code}】${data.description}`,
                  }),
                }
              )
            }
          />
        </Field>
      </Accordion>
    </>
  );
}
