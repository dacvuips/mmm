import cloneDeep from "lodash/cloneDeep";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { GiCartwheel } from "react-icons/gi";
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiCloseLine,
  RiFileCopyLine,
  RiGiftLine,
} from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  Gift,
  GIFT_TYPES,
  LuckyWheel,
  LuckyWheelService,
} from "../../../../lib/repo/lucky-wheel.repo";
import { PRODUCT_LABEL_COLORS } from "../../../../lib/repo/product-label.repo";
import { ShopVoucherService } from "../../../../lib/repo/shop-voucher.repo";
import { Button } from "../../../shared/utilities/form/button";
import { DatePicker } from "../../../shared/utilities/form/date";
import { Field } from "../../../shared/utilities/form/field";
import { Form, FormProps } from "../../../shared/utilities/form/form";
import { ImageInput } from "../../../shared/utilities/form/image-input";
import { Input } from "../../../shared/utilities/form/input";
import { Label } from "../../../shared/utilities/form/label";
import { Select } from "../../../shared/utilities/form/select";
import { Switch } from "../../../shared/utilities/form/switch";
import { Textarea } from "../../../shared/utilities/form/textarea";
import { Img } from "../../../shared/utilities/misc";
import { Accordion } from "../../../shared/utilities/misc";
import { LuckyWheelGenerator } from "./lucky-wheels-generator";

interface PropsType extends FormProps {
  luckyWheel: LuckyWheel;
  onChange: () => any;
  editLuckyWheel: boolean;
}
const DEFAULT_LUCKY_WHEEL: Partial<Gift> = {
  name: "Chúc may mắn lần sau",
  code: "THUA",
  image: "https://i.imgur.com/FxESdLz.png",
  type: "VOUCHER",
  isLose: true,
  qty: 0,
  usedQty: 0,
};
export function LuckyWheelForm({ luckyWheel, onChange, editLuckyWheel, ...props }: PropsType) {
  const [gifts, setGifts] = useState<Gift[]>();
  const [openGift, setOpenGift] = useState<Gift>(undefined);
  const [openGiftIndex, setOpenGiftIndex] = useState<number>(-1);
  const [isLose, setIsLose] = useState<boolean>();
  const toast = useToast();

  useEffect(() => {
    if (luckyWheel) {
      setGifts(cloneDeep(luckyWheel.gifts) || []);
    }
  }, [luckyWheel]);

  useEffect(() => {
    if (openGift) {
      setIsLose(openGift.isLose);
    } else if (openGift == null) {
      setIsLose(DEFAULT_LUCKY_WHEEL.isLose);
    } else {
      setIsLose(undefined);
    }
  }, [openGift]);

  const onSubmit = async (data) => {
    if (luckyWheel) {
      await LuckyWheelService.update({
        id: luckyWheel.id,
        data: {
          ...data,
          gifts: gifts.map((gift) => {
            const { id, __typename, ...giftData } = gift as any;
            return {
              ...giftData,
              voucherId: giftData.voucherId || null,
              qty: giftData.qty || 0,
              usedQty: giftData.usedQty || 0,
            };
          }),
        },
        toast,
      }).then((res) => {
        props.onClose();
        onChange();
      });
    } else {
      await LuckyWheelService.create({ data: { ...data }, toast }).then((res) => {
        props.onClose();
        onChange();
      });
    }
  };

  return (
    <>
      <Form
        {...props}
        dialog
        title={`${luckyWheel ? "Chỉnh sửa" : "Tạo"} vòng quay`}
        grid
        width="650px"
        defaultValues={luckyWheel}
        onSubmit={onSubmit}
      >
        <Field
          name="title"
          label="Tên vòng quay"
          cols={8}
          required
          validation={{ titleValid: (val) => validateKeyword(val) }}
        >
          <Input />
        </Field>
        <Field name="code" label="Mã vòng quay" cols={4} validation={{ code: true }}>
          <Input placeholder="Tự tạo nếu để trống" />
        </Field>
        <Field name="startDate" label="Ngày bắt đầu" cols={6} required>
          <DatePicker startOfDay />
        </Field>
        <Field name="endDate" label="Ngày kết thúc" cols={6} required>
          <DatePicker endOfDay />
        </Field>
        {luckyWheel && (
          <>
            {/* <Field name="gamePointRequired" label="Điểm chơi yêu cầu" cols={6}>
              <Input number />
            </Field> */}
            <Field
              name="successRatio"
              label="Tỉ lệ trúng thưởng"
              cols={12}
              validation={{ min: 0, max: 100 }}
            >
              <Input number suffix="%" />
            </Field>
            <Field name="issueNumber" label="Số lượng phát hành" cols={6}>
              <Input number />
            </Field>
            <Field name="issueByDate" label=" " cols={6}>
              <Switch placeholder="Phát hành theo ngày" />
            </Field>
            <Field name="useLimit" label="Số lượng dùng mỗi khách" cols={6}>
              <Input number />
            </Field>
            <Field name="useLimitByDate" label=" " cols={6}>
              <Switch placeholder="Số lượng dùng theo ngày" />
            </Field>
            <WheelFields luckyWheel={luckyWheel} gifts={gifts} setGifts={setGifts} />
            <Field name="bannerImage" label="Ảnh banner" cols={6}>
              <ImageInput largeImage ratio169 />
            </Field>
            <Field name="footerImage" label="Ảnh footer" cols={6}>
              <ImageInput largeImage ratio169 />
            </Field>
            <Field name="backgroundImage" label="Ảnh nền" cols={6}>
              <ImageInput largeImage percent={61} />
            </Field>
            <div className="col-span-6">
              <Field name="backgroundColor" label="Màu nền">
                <Select hasColor clearable placeholder="Mặc định" options={PRODUCT_LABEL_COLORS} />
              </Field>
              <Field name="buttonColor" label="Màu nút">
                <Select hasColor clearable placeholder="Mặc định" options={PRODUCT_LABEL_COLORS} />
              </Field>
              <Field name="btnTitle" label="Tiêu đề nút">
                <Input placeholder="BẮT ĐẦU QUAY" />
              </Field>
            </div>
            <div className="col-span-12">
              <Label text="Danh sách quà tặng" />
              {gifts?.map(
                (gift, index) =>
                  gift && (
                    <div
                      className="relative flex p-2 my-3 border border-gray-300 rounded cursor-pointer group hover:border-primary animate-emerge"
                      onClick={() => {
                        setOpenGift(gift);
                        setOpenGiftIndex(index);
                      }}
                      key={index}
                    >
                      <Img className="w-16" src={gift.image} lazyload={false} />
                      <div className="flex-1 pl-3 text-gray-700">
                        <div className="flex">
                          <div className="flex-1 font-semibold group-hover:text-primary">
                            {gift.name} {gift.code ? `[${gift.code}]` : ""}{" "}
                            {!gift.isLose && (
                              <span className="inline-flex items-center status-label bg-success">
                                <i className="mr-1 text-sm">
                                  <RiGiftLine />
                                </i>
                                Quà
                              </span>
                            )}
                          </div>
                          {!gift.isLose && (
                            <span
                              className={`status-label self-center bg-${GIFT_TYPES.find((x) => x.value == gift.type)?.color
                                }`}
                            >
                              {GIFT_TYPES.find((x) => x.value == gift.type)?.label}
                            </span>
                          )}
                        </div>
                        <div className="text-sm">
                          Số lượng: {parseNumber(gift.qty)} - Đã sử dụng:{" "}
                          {parseNumber(gift.usedQty)}
                        </div>
                        {gift.desc && <div className="text-sm">{gift.desc}</div>}
                      </div>
                      <div
                        className="absolute transform -translate-y-1/2 bg-white rounded opacity-0 border-vertical-group -right-2 top-1/2 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          className="w-6 h-6 px-0"
                          disabled={index == 0}
                          outline
                          icon={<RiArrowUpLine />}
                          onClick={() => {
                            const temp = gifts[index];
                            gifts[index] = gifts[index - 1];
                            gifts[index - 1] = temp;
                            setGifts([...gifts]);
                          }}
                        />
                        <Button
                          className="w-6 h-6 px-0"
                          disabled={index == gifts.length - 1}
                          outline
                          icon={<RiArrowDownLine />}
                          onClick={() => {
                            const temp = gifts[index];
                            gifts[index] = gifts[index + 1];
                            gifts[index + 1] = temp;
                            setGifts([...gifts]);
                          }}
                        />
                        <Button
                          className="w-6 h-6 px-0"
                          outline
                          icon={<RiFileCopyLine />}
                          onClick={() => {
                            const temp = cloneDeep(gifts[index]);
                            gifts.splice(index, 0, temp);
                            setGifts([...gifts]);
                          }}
                        />
                        <Button
                          className="w-6 h-6 px-0"
                          outline
                          icon={<RiCloseLine />}
                          onClick={() => {
                            gifts.splice(index, 1);
                            setGifts([...gifts]);
                          }}
                        />
                      </div>
                    </div>
                  )
              )}
              <Button
                outline
                className="block w-full h-10 my-3"
                text="Tạo quà tặng"
                onClick={() => setOpenGift(null)}
              />
            </div>
          </>
        )}
        <Form.Footer
          submitProps={{
            disabled: editLuckyWheel,
          }}
        />
      </Form>
      <Form
        dialog
        grid
        isOpen={openGift !== undefined}
        onClose={() => setOpenGift(undefined)}
        defaultValues={openGift || DEFAULT_LUCKY_WHEEL}
        title={`${openGift ? "Chỉnh sửa" : "Thêm"} quà`}
        width="550px"
        onSubmit={(data) => {
          if (!isLose && data.type == "VOUCHER" && !data.voucherId) {
            toast.info("Cần chọn khuyến mãi cho quà loại khuyến mãi");
            return;
          }
          if (openGift) {
            gifts[openGiftIndex] = { ...gifts[openGiftIndex], ...data, isLose };
            setGifts([...gifts]);
          } else {
            setGifts([...gifts, { ...data, isLose } as Gift]);
          }
          setOpenGift(undefined);
        }}
      >
        <Field name="name" label="Tên quà" required cols={12}>
          <Input />
        </Field>
        <div className="flex col-span-12 gap-x-5">
          <Field name="image" label="Hình ảnh" className="w-48">
            <ImageInput largeImage />
          </Field>
          <div className="flex-1">
            <Field name="code" label="Mã quà" required>
              <Input />
            </Field>
            <Field name="desc" label="Mô tả">
              <Textarea />
            </Field>
          </div>
        </div>
        <Field name="qty" label="Số lượng" cols={6}>
          <Input number />
        </Field>
        <Field name="usedQty" label="Số lượng đã sử dụng" cols={6}>
          <Input number />
        </Field>
        <Field name="type" label="Loại phần thưởng" cols={6}>
          <Select options={GIFT_TYPES} />
        </Field>
        <Field label=" " cols={6}>
          <Switch
            placeholder="Là phần thưởng"
            value={!isLose}
            onChange={(val) => setIsLose(!val)}
          />
        </Field>
        <VoucherTypeFields />
        <Form.Footer />
      </Form>
    </>
  );
}

function WheelFields({ luckyWheel, gifts, setGifts }: { luckyWheel: LuckyWheel; gifts; setGifts }) {
  const [openWheel, setOpenWheel] = useState<LuckyWheel>();
  const { watch, setValue } = useFormContext();
  const wheelImage = watch("wheelImage");
  const pinImage = watch("pinImage");
  const toast = useToast();

  return (
    <>
      <Field name="wheelImage" label="Ảnh vòng quay" cols={6} required>
        <ImageInput value={wheelImage} largeImage />
      </Field>
      <Field name="pinImage" label="Ảnh pin" cols={6}>
        <ImageInput value={pinImage} largeImage />
      </Field>
      <LuckyWheelGenerator
        isOpen={!!openWheel}
        onClose={() => setOpenWheel(null)}
        luckyWheel={openWheel}
        onWheelChange={(wheel) => {
          luckyWheel.designConfig = wheel.designConfig;
          if (wheel.wheelImage) {
            luckyWheel.wheelImage = wheel.wheelImage;
            setValue("wheelImage", wheel.wheelImage);
          }
          if (wheel.pinImage) {
            luckyWheel.pinImage = wheel.pinImage;
            setValue("pinImage", wheel.pinImage);
          }
        }}
      />
      <div className="col-span-12 mb-4 -mt-4">
        <Button
          className="pl-0 underline"
          icon={<GiCartwheel />}
          text="Công cụ tạo ảnh vòng quay và ảnh pin"
          onClick={() => {
            if (gifts.length < 2) {
              toast.info("Yêu cầu phải có ít nhất 2 phần quà");
              return;
            }
            setOpenWheel({ ...luckyWheel, gifts });
          }}
        />
      </div>
    </>
  );
}
function VoucherTypeFields() {
  const { watch } = useFormContext();
  const type = watch("type");

  return (
    <Accordion className="col-span-12" isOpen={type == "VOUCHER"}>
      <Field name="voucherId" label="Khuyến mãi" cols={12}>
        <Select
          autocompletePromise={({ id, search }) =>
            ShopVoucherService.getAllAutocompletePromise(
              { id, search },
              {
                fragment: "id code description",
                parseOption: (data) => ({
                  value: data.id,
                  label: `【${data.code}】${data.description}`,
                }),
              }
            )
          }
        />
      </Field>
      <Field name="voucherQty" label="Số voucher được tặng" cols={6} required>
        <Input number />
      </Field>
      <Field name="voucherExpiredDay" label="Số ngày sử dụng" cols={6} required>
        <Input number />
      </Field>
    </Accordion>
  );
}
