import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import cloneDeep from "lodash/cloneDeep";
import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  RiAddCircleLine,
  RiCloseCircleFill,
  RiCoupon2Line,
  RiCupFill,
  RiLinksLine,
  RiStarFill,
  RiYoutubeFill,
} from "react-icons/ri";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { PRODUCT_LABEL_COLORS } from "../../../../lib/repo/product-label.repo";
import { ProductService } from "../../../../lib/repo/product.repo";
import { ShopBanner } from "../../../../lib/repo/shop-banner.repo";
import {
  ShopProductGroup,
  ShopTag,
  SHOP_BANNER_ACTIONS,
  SHOP_BANNER_TYPES,
} from "../../../../lib/repo/shop-config.repo";
import { ShopVoucherService } from "../../../../lib/repo/shop-voucher.repo";
import { VideoDialog } from "../../../shared/shop-layout/video-dialog";
import {
  Button,
  Editor,
  Field,
  Form,
  ImageInput,
  Input,
  Label,
  Select,
  Switch,
} from "../../../shared/utilities/form";
import { Accordion, Img } from "../../../shared/utilities/misc";
import { Popover } from "../../../shared/utilities/popover/popover";

export function ConfigSettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const [shopTags, setShopTags] = useState<ShopTag[]>();
  const [openShopTag, setOpenShopTag] = useState<ShopTag>(undefined);
  const [openShopTagIndex, setOpenShopTagIndex] = useState(-1);
  const [shopBanners, setShopBanners] = useState<Partial<ShopBanner>[]>(undefined);
  const [openShopBanner, setOpenShopBanner] = useState<Partial<ShopBanner>>(undefined);
  const [openShopBannerIndex, setOpenShopBannerIndex] = useState(-1);
  const [shopProductGroups, setShopProductGroups] = useState<ShopProductGroup[]>();
  const [openProductGroup, setOpenProductGroup] = useState<ShopProductGroup>(undefined);
  const [openProductGroupIndex, setOpenProductGroupIndex] = useState(-1);
  const [videoOpen, setVideoOpen] = useState("");
  const [typeBanner, setTypeBanner] = useState<"image" | "youtube">("image");
  const [fullProductIds, setFullProductIds] = useState([]);
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");

  useEffect(() => {
    if (shopConfig) {
      setShopTags(cloneDeep(shopConfig.tags));
      setShopBanners(cloneDeep(shopConfig.banners));
      setShopProductGroups(cloneDeep(shopConfig.productGroups));
    }
  }, [shopConfig]);

  const onSubmit = async (data) => {
    await updateShopConfig({
      ...data,
      tags: shopTags.map((x) => {
        const { __typename, ...item } = x as any;
        return item;
      }),
      banners: shopBanners.map((x) => {
        const { __typename, product, voucher, voucherText, ...item } = x as any;
        return item;
      }),
      productGroups: shopProductGroups.map((x) => {
        const { __typename, products, ...item } = x as any;
        return item;
      }),
    });
  };

  return (
    <>
      <Form
        defaultValues={shopConfig}
        className="max-w-screen-sm animate-emerge"
        onSubmit={onSubmit}
      >
        <Form.Title className="pt-2" title="M??u ch??? ?????o" />
        <div className="flex w-full gap-x-5">
          <Field
            className="flex-1"
            label="M??u ch??nh"
            tooltip="M??u th????ng hi???u c???a h??ng, d??ng trong h???u h???t c??c tr?????ng h???p."
            name="primaryColor"
          >
            <Input placeholder="M???c ?????nh" type="color" />
            {/* <Select hasColor clearable placeholder="M???c ?????nh" options={PRODUCT_LABEL_COLORS} /> */}
          </Field>
          <Field
            className="flex-1"
            label="M??u ph???"
            tooltip="M??u ph??? c???a th????ng hi???u d??ng ??? m???t s??? ch??? nh?? s??? ti???n, gi?? s???n ph???m, m?? khuy???n m??i,... "
            name="accentColor"
          >
            {/* <Select hasColor clearable placeholder="M???c ?????nh" options={PRODUCT_LABEL_COLORS} /> */}
            <Input placeholder="M???c ?????nh" type="color" />
          </Field>
        </div>
        <Form.Title title="N???i dung" />
        <Label text="Tin nh???n SMS" />
        <div className="flex w-full gap-x-5">
          <Field className="flex-1" name="smsOrder">
            <Switch placeholder="G???i SMS ????n h??ng" />
          </Field>
          <Field className="flex-1" name="smsOtp">
            <Switch placeholder="G???i SMS OTP" />
          </Field>
        </div>
        <Field label="Th??ng tin chung" name="intro">
          <Editor minHeight="calc(60vh - 150px)" maxWidth="none" placeholder="N???i dung b??i vi???t" />
        </Field>
        <Form.Title title="Gi???i h???n ?????t h??ng" />
        <div className="flex w-full gap-x-5">
          <Field
            className="flex-1"
            label="Gi???i h???n s??? ????n ???????c ?????t c??ng 1 l??c"
            description="Nh???p 0 n???u kh??ng gi???i h???n"
            name="limitOpenOrder"
          >
            <Input number />
          </Field>
          <Field
            className="flex-1"
            label="Gi???i h???n s??? s???n ph???m trong 1 ????n h??ng"
            description="Nh???p 0 n???u kh??ng gi???i h???n"
            name="limitItem"
          >
            <Input number />
          </Field>
        </div>

        <Form.Title title="????nh gi?? c???a qu??n" />
        <RatingField />

        <Field label="S??? l?????ng ng?????i ???? mua h??ng" name="soldQty">
          <Input className="h-12" number suffix="ng?????i ???? mua h??ng" />
        </Field>
        <Field label="S??? l?????ng ng?????i ???? ????nh gi??" name="ratingQty">
          <Input className="h-12" number suffix="ng?????i ???? ????nh gi??" />
        </Field>
        <Field label="Ti??u ????? upsale" name="upsaleTitle">
          <Input className="h-12" />
        </Field>
        <Label text="Tag ????nh gi??" />
        <div className="flex flex-wrap gap-3 mt-1 mb-4">
          {shopTags?.map((tag, index) => (
            <button
              type="button"
              className="flex items-center bg-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-300 py-1.5 px-3 rounded-full"
              key={index}
              onClick={() => {
                setOpenShopTag(tag);
                setOpenShopTagIndex(index);
              }}
            >
              <span>
                {tag.icon} {tag.name} ({tag.qty}){" "}
              </span>
              <i
                className="ml-1 text-lg text-gray-400 cursor-pointer hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  shopTags.splice(index, 1);
                  setShopTags([...shopTags]);
                }}
              >
                <RiCloseCircleFill />
              </i>
            </button>
          ))}
          <button
            type="button"
            className="flex items-center bg-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-300 py-1.5 px-3 rounded-full"
            onClick={() => setOpenShopTag(null)}
            disabled={disabled}
          >
            <i>
              <RiAddCircleLine />
            </i>
            <span className="ml-2 font-semibold">Th??m tag ????nh gi??</span>
          </button>
        </div>
        <Form.Title title="Banner" />
        <div className="flex flex-col mt-1 mb-4 gap-y-2">
          {shopBanners?.map((banner, index) => (
            <div
              key={index}
              className="flex items-center w-full p-3 bg-white border border-gray-300 rounded cursor-pointer hover:border-primary"
              onClick={() => {
                setOpenShopBanner(banner);
                setOpenShopBannerIndex(index);
                setTypeBanner(banner.type);
              }}
            >
              {banner.type == "image" ? (
                <>
                  <Img className="w-40 rounded" ratio169 src={banner.image} />
                  <div className="flex-1 px-4">
                    <div className="flex font-semibold text-gray-500">
                      <i className="mt-1 mr-1">
                        {
                          {
                            WEBSITE: <RiLinksLine />,
                            PRODUCT: <RiCupFill />,
                            VOUCHER: <RiCoupon2Line />,
                          }[banner.actionType]
                        }
                      </i>
                      <span>
                        {SHOP_BANNER_ACTIONS.find((x) => x.value == banner.actionType)?.label}
                      </span>
                    </div>
                    {banner.actionType == "PRODUCT" && <div>{banner.product?.name}</div>}
                    {banner.actionType == "VOUCHER" && (
                      <div>
                        {(banner as any).voucherText ||
                          (banner?.voucher?.code != undefined
                            ? `???${banner?.voucher?.code}???${banner?.voucher?.description}`
                            : "Ch??a ch???n m?? khuy???n m??i")}
                      </div>
                    )}
                    {banner.actionType == "WEBSITE" && (
                      <a className="block w-full text-ellipsis-1">{banner.link}</a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoOpen(banner.youtubeLink);
                    }}
                  >
                    <Img
                      src={`https://img.youtube.com/vi/${new URL(
                        banner.youtubeLink
                      ).searchParams.get("v")}/default.jpg`}
                      className="w-40"
                      ratio169
                    >
                      <div className="absolute top-0 left-0 z-50 flex w-full h-full">
                        <i className="m-auto text-3xl text-danger">
                          <RiYoutubeFill />
                        </i>
                      </div>
                    </Img>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="flex font-semibold text-gray-500">
                      <i className="mt-1 mr-1">
                        <RiYoutubeFill />
                      </i>
                      <span>YouTube</span>
                    </div>
                  </div>
                </>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  value={banner.isPublic}
                  onChange={(isPublic) => {
                    banner.isPublic = isPublic;
                    setShopBanners([...shopBanners]);
                  }}
                />
              </div>
              <Button
                className="text-gray-400"
                icon={<RiCloseCircleFill />}
                iconClassName={"text-xl"}
                hoverDanger
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  shopBanners.splice(index, 1);
                  setShopBanners([...shopBanners]);
                }}
              />
            </div>
          ))}
          <div
            className={`w-full p-3 text-gray-600 bg-white border border-gray-300 rounded cursor-pointer flex-center hover:border-primary hover:text-primary ${disabled ? "opacity-70" : ""
              }`}
            onClick={() => {
              if (disabled) return;
              setOpenShopBanner({});
              setOpenShopBannerIndex(-1);
            }}
          >
            <i className="text-xl">
              <RiAddCircleLine />
            </i>
            <span className="ml-1 font-semibold">Th??m banner</span>
          </div>
        </div>
        <Form.Title className="text-lg" title="C??c nh??m s???n ph???m ????? xu???t" />
        <div className="flex flex-col mt-1 mb-4 gap-y-2">
          {shopProductGroups?.map((group, index) => (
            <div
              key={index}
              className="w-full p-3 pt-2 bg-white border border-gray-300 rounded cursor-pointer hover:border-primary"
              onClick={() => {
                setOpenProductGroup(group);
                setOpenProductGroupIndex(index);
              }}
            >
              <div className="flex items-center">
                <div className="flex-1 pr-2 font-semibold">{group.name}</div>
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    value={group.isPublic}
                    onChange={(isPublic) => {
                      group.isPublic = isPublic;
                      setShopProductGroups([...shopProductGroups]);
                    }}
                  />
                  <Button
                    className="text-gray-400"
                    icon={<RiCloseCircleFill />}
                    iconClassName={"text-xl"}
                    hoverDanger
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      shopProductGroups.splice(index, 1);
                      setShopProductGroups([...shopProductGroups]);
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {group.products?.map((product) => (
                  <div className="flex flex-col col-span-1" key={product.id}>
                    <Img className="w-full rounded" src={product.image} />
                    <div className="my-1 font-semibold text-gray-700">
                      {product.name || product.label}
                    </div>
                    <div className="mt-auto font-semibold text-danger">
                      {parseNumber(product.basePrice, true)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div
            className={`w-full p-3 text-gray-600 bg-white border border-gray-300 rounded cursor-pointer flex-center hover:border-primary hover:text-primary ${disabled ? "opacity-70" : ""
              }`}
            onClick={() => {
              if (disabled) return;
              setOpenProductGroup(null);
            }}
          >
            <i className="text-xl">
              <RiAddCircleLine />
            </i>
            <span className="ml-1 font-semibold">Th??m nh??m s???n ph???m</span>
          </div>
        </div>
        <Form.Footer
          className="mt-1"
          isReverse={false}
          submitProps={{
            large: true,
            className: "shadow",
            disabled,
          }}
        />
      </Form>

      <Form
        dialog
        grid
        width={450}
        title={`${openShopTag ? "Ch???nh s???a" : "Th??m"} tag ????nh gi??`}
        defaultValues={openShopTag}
        isOpen={openShopTag !== undefined}
        onClose={() => setOpenShopTag(undefined)}
        onSubmit={(data) => {
          if (openShopTag) {
            shopTags[openShopTagIndex] = data;
            setShopTags([...shopTags]);
          } else {
            setShopTags([...shopTags, data]);
          }
          setOpenShopTag(undefined);
        }}
      >
        <IconField />
        <Field name="name" label="T??n tag" cols={7} required>
          <Input />
        </Field>
        <Field name="qty" label="S??? l?????ng" cols={5} required>
          <Input number />
        </Field>
        <Form.Footer
          submitProps={{
            disabled,
          }}
        />
      </Form>

      <Form
        dialog
        grid
        width={400}
        title={`${openShopBannerIndex >= 0 ? "Ch???nh s???a" : "Th??m"} banner`}
        defaultValues={openShopBanner}
        allowResetDefaultValues
        isOpen={openShopBanner !== undefined}
        onClose={() => setOpenShopBanner(undefined)}
        onSubmit={(data) => {
          if (openShopBanner.type) {
            shopBanners[openShopBannerIndex] = {
              ...shopBanners[openShopBannerIndex],
              ...data,
            } as any;
            setShopBanners([...shopBanners]);
            setOpenShopBannerIndex(null);
          } else {
            setShopBanners([
              ...shopBanners,
              {
                ...data,
                isPublic: true,
                type: typeBanner,
                actionType: typeBanner == "youtube" ? "NONE" : data.actionType,
                image: typeBanner == "youtube" ? "" : data.image,
              },
            ]);
          }
          setOpenShopBanner(undefined);
          setOpenShopBannerIndex(null);
        }}
      >
        <Field label="Lo???i banner" cols={12} required>
          <Select
            options={SHOP_BANNER_TYPES}
            value={typeBanner}
            onChange={(val) => setTypeBanner(val)}
          />
        </Field>
        <Accordion className="col-span-12" isOpen={typeBanner == "youtube"}>
          <Field
            name="youtubeLink"
            label="???????ng d???n youtube"
            cols={12}
            required={typeBanner == "youtube"}
          >
            <Input type="url" />
          </Field>
        </Accordion>
        <Accordion className="col-span-12" isOpen={typeBanner == "image"}>
          <Field name="image" label="H??nh banner" cols={12} required={typeBanner == "image"}>
            <ImageInput largeImage ratio169 cover />
          </Field>
          <Field
            name="actionType"
            label="Lo???i h??nh ?????ng"
            cols={12}
            required={typeBanner == "image"}
          >
            <Select options={SHOP_BANNER_ACTIONS} />
          </Field>
          <ActionTypeFields required={typeBanner == "image"} />
        </Accordion>
        <Form.Footer
          submitProps={{
            disabled,
          }}
        />
      </Form>

      <Form
        dialog
        grid
        title={`${openProductGroup ? "Ch???nh s???a" : "Th??m"} nh??m s???n ph???m`}
        defaultValues={openProductGroup}
        isOpen={openProductGroup !== undefined}
        onClose={() => setOpenProductGroup(undefined)}
        onSubmit={(data) => {
          if (openProductGroup) {
            shopProductGroups[openProductGroupIndex] = {
              ...shopProductGroups[openProductGroupIndex],
              products: data.productIds.map(
                (id) =>
                  shopProductGroups[openProductGroupIndex].products.find((x) => x.id == id) ||
                  fullProductIds?.find((x) => x.value == id)
              ),
              ...data,
            };
            setShopProductGroups([...shopProductGroups]);
          } else {
            setShopProductGroups([
              ...shopProductGroups,
              { ...data, products: fullProductIds, isPublic: true },
            ]);
          }
          setOpenProductGroup(undefined);
        }}
      >
        <Field name="name" label="T??n nh??m s???n ph???m" cols={12} required>
          <Input />
        </Field>
        <Field name="productIds" label="S???n ph???m" cols={12} required>
          <Select
            onChange={(data, fullData) => setFullProductIds(fullData)}
            optionsPromise={() =>
              ProductService.getAllOptionsPromise({
                fragment: "id name image basePrice",
                parseOption: (data) => ({
                  value: data.id,
                  label: data.name,
                  image: data.image,
                  basePrice: data.basePrice,
                }),
              })
            }
            multi
            hasImage
          />
        </Field>
        <Form.Footer
          submitProps={{
            disabled,
          }}
        />
      </Form>
      <VideoDialog
        videoUrl={videoOpen}
        onClose={() => setVideoOpen("")}
        isOpen={!!videoOpen}
      ></VideoDialog>
    </>
  );
}

function RatingField() {
  const { watch } = useFormContext();
  const rating = watch("rating");

  return (
    <Field name="rating" label="????nh gi??" validation={{ min: 0, max: 5 }} cols={8}>
      <Input
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

function IconField() {
  const { setValue } = useFormContext();
  const ref = useRef();

  return (
    <>
      <Field
        name="icon"
        label="Emoji"
        description="Tr??n Windows c?? th??? d??ng t??? h???p ph??m 'Windows + .' v?? tr??n Mac d??ng t??? h???p 'Control + Command + Spacebar'"
        cols={12}
      >
        <Input
          suffixInputFocus={false}
          suffix={
            <Button
              unfocusable
              className="bg-gray-100 border-l border-gray-300 rounded-l-none"
              innerRef={ref}
              text="Ch???n Emoji"
            />
          }
        />
      </Field>
      <Popover reference={ref} className="w-80" trigger="click" placement="top">
        <Picker
          native
          color="#0d57ef"
          i18n={EMOJI_MART_I18N}
          onSelect={(emoji) => {
            setValue("icon", (emoji as any).native);
            (ref.current as any)._tippy.hide();
          }}
        />
      </Popover>
    </>
  );
}

function ActionTypeFields({ required }: { required: boolean }) {
  const { watch, setValue, register } = useFormContext();
  const actionType = watch("actionType");
  register("product.name");
  register("voucherText");

  return (
    <>
      <Accordion className="col-span-12" isOpen={actionType == "WEBSITE"}>
        <Field
          name="link"
          label="???????ng d???n website"
          cols={12}
          required={actionType == "WEBSITE" && required}
        >
          <Input type="url" />
        </Field>
      </Accordion>
      <Accordion className="col-span-12" isOpen={actionType == "PRODUCT"}>
        <Field
          name="productId"
          label="Ch???n m??n"
          cols={12}
          required={actionType == "PRODUCT" && required}
        >
          <Select
            onChange={(data, fullData) => setValue("product.name", fullData?.label)}
            optionsPromise={() =>
              ProductService.getAllOptionsPromise({
                fragment: "id name image basePrice",
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
      <Accordion className="col-span-12" isOpen={actionType == "VOUCHER"}>
        <Field
          name="voucherId"
          label="Ch???n khuy???n m??i"
          cols={12}
          required={actionType == "VOUCHER" && required}
        >
          <Select
            onChange={(data, fullData) => setValue("voucherText", fullData?.label)}
            autocompletePromise={({ id, search }) =>
              ShopVoucherService.getAllAutocompletePromise(
                { id, search },
                {
                  fragment: "id code description",
                  parseOption: (data) => ({
                    value: data.id,
                    label: `???${data.code}???${data.description}`,
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

const EMOJI_MART_I18N = {
  search: "T??m ki???m",
  clear: "Xo??", // Accessible label on "clear" button
  notfound: "Kh??ng c?? Emoji",
  skintext: "Ch???n m??u da m???c ?????nh",
  categories: {
    search: "K???t qu??? t??m ki???m",
    recent: "S??? d???ng g???n ????y",
    smileys: "M???t c?????i & C???m x??c",
    people: "Con ng?????i & C?? th???",
    nature: "?????ng v???t & Thi??n nhi??n",
    foods: "Th???c ??n & ????? u???ng",
    activity: "Ho???t ?????ng",
    places: "Du l???ch & ?????a ??i???m",
    objects: "????? v???t",
    symbols: "Bi???u t?????ng",
    flags: "C???",
    custom: "Tu??? ch???nh",
  },
  categorieslabel: "Danh m???c Emoji", // Accessible title for the list of categories
  skintones: {
    1: "M??u da m???c ?????nh",
    2: "M??u da s??ng",
    3: "M??u da s??ng v???a",
    4: "M??u da v???a",
    5: "M??u da t???i v???a",
    6: "M??u da t???i",
  },
};
