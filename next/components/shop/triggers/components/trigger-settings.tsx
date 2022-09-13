import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { RiInformationLine } from "react-icons/ri";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { useAlert } from "../../../../lib/providers/alert-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  MANYCHAT_STATUS,
  ShopConfigService,
  ZALO_STATUS,
} from "../../../../lib/repo/shop-config.repo";
import { VerticalPageTabs } from "../../../shared/shop-layout/vertical-page-tabs";
import {
  Button,
  Field,
  Form,
  ImageInput,
  Input,
  Label,
  Switch,
  Textarea,
} from "../../../shared/utilities/form";
import { Card } from "../../../shared/utilities/misc";
import { useTriggersContext } from "../providers/triggers-provider";
import { MentionTextarea } from "./trigger-form";

export function TriggerSettings() {
  const [tab, setTab] = useState<string>(TRIGGER_SETTINGS_TABS[0].value);
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_TRIGGERS");
  return (
    <div className="flex gap-3">
      <VerticalPageTabs
        className="min-w-3xs whitespace-nowrap"
        options={TRIGGER_SETTINGS_TABS}
        value={tab}
        onChange={setTab}
      />
      <div className="w-full max-w-4xl mt-2 ml-3">
        {
          {
            notification: <NotificationSettings editDisable={!hasWritePermission} />,
            manychat: <ManyChatSettings editDisable={!hasWritePermission} />,
            zalo: <ZaloSettings editDisable={!hasWritePermission} />,
          }[tab]
        }
      </div>
    </div>
  );
}

function NotificationSettings({ editDisable }: { editDisable: boolean }) {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();

  return (
    <Form
      defaultValues={shopConfig.notifyConfig}
      className="animate-emerge"
      onSubmit={async (data) => await updateShopConfig({ notifyConfig: data })}
    >
      <div className="p-3 mb-3 text-sm font-medium border rounded border-brand bg-brand-light text-brand">
        Nhập @ để hiện gợi ý các biến có thể sử dụng. Khi gửi nội dung các biến sẽ được thay bằng dữ
        liệu động cụ thể.
      </div>
      <Form.Title title="Cấu hình thông báo khách hàng" />
      <MentionTextareaField label="Đơn hàng chờ" textFieldName="orderPending" />
      <MentionTextareaField label="Đơn hàng hủy" textFieldName="orderCanceled" />
      <MentionTextareaField label="Đơn đang làm" textFieldName="orderConfirmed" />
      <MentionTextareaField label="Đơn hoàn thành" textFieldName="orderCompleted" />
      <MentionTextareaField label="Đơn thất bại" textFieldName="orderFailure" />
      <MentionTextareaField label="Tặng điểm thưởng" textFieldName="orderRewardPoint" />

      <Form.Title title="Cấu hình thông báo Nhân viên" />
      <MentionTextareaField
        label="Đơn hàng đang chờ cho nhân viên"
        textFieldName="orderPendingForStaff"
      />
      <MentionTextareaField
        label="Đơn hàng đang hủy cho nhân viên"
        textFieldName="orderCanceledForStaff"
      />
      <MentionTextareaField
        label="Đơn hàng đang được làm món cho nhân viên"
        textFieldName="orderConfirmedForStaff"
      />
      <MentionTextareaField
        label="Đơn hoàn thành cho nhân viên"
        textFieldName="orderCompletedForStaff"
      />
      <MentionTextareaField
        label="Đơn hàng thất bại cho nhân viên"
        textFieldName="orderFailureForStaff"
      />
      <Field label="Thông báo Ahamove" name="ahamoveNotifyEnabled">
        <Switch placeholder="Bật thông báo" />
      </Field>
      <Form.Footer isReverse={false} submitProps={{ disabled: editDisable }} />
    </Form>
  );
}

function ManyChatSettings({ editDisable }: { editDisable: boolean }) {
  const { shopConfig, updateShopConfig, setShopConfig } = useShopLayoutContext();
  const [isManyChatActive, setIsManyChatActive] = useState<boolean>();
  const [openConnectDialog, setOpenConnectDialog] = useState(false);
  const alert = useAlert();
  const toast = useToast();

  const onSubmit = async (data) => {
    await updateShopConfig({
      manychatConfig: {
        active: isManyChatActive,
        mappingField: data.mappingField || shopConfig.manychatConfig.mappingField,
      },
    });
  };

  const connectManyChat = async (data) => {
    try {
      const res = await ShopConfigService.connectManychat(data.apiKey);
      setShopConfig({ ...shopConfig, ...res });
      toast.success("Kết nối ManyChat thành công");
      setOpenConnectDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("Kết nối thất bại. " + err.message);
    }
    return true;
  };
  const disconnectManyChat = () => {
    return alert.danger(
      "Huỷ kết nối ManyChat?",
      "Bạn có chắc chắn muốn huỷ kết nối ManyChat",
      "Huỷ kết nối",
      async () => {
        try {
          const res = await ShopConfigService.disconnectManychat();
          setShopConfig({ ...shopConfig, ...res });
          toast.success("Huỷ kết nối ManyChat thành công");
        } catch (err) {
          console.error(err);
          toast.error("Huỷ kết nối thất bại. " + err.message);
        }
        return true;
      }
    );
  };

  return (
    <>
      <Form
        grid
        defaultValues={shopConfig.manychatConfig}
        className="max-w-screen-sm animate-emerge"
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between col-span-12 pl-1 mt-4 mb-4">
          <Form.Title title="Cấu hình liên kết ManyChat" />
          <Switch
            readOnly={editDisable}
            value={isManyChatActive}
            onChange={setIsManyChatActive}
            placeholder="Bật ManyChat"
          />
        </div>
        <div className="flex items-center p-2 mb-3 -mt-2 text-sm font-semibold text-gray-600 border rounded-sm border-info bg-info-light col-span-full">
          <i className="ml-1 mr-1 text-info">
            <RiInformationLine />
          </i>
          Đăng ký dịch vụ ManyChat tại{" "}
          <a
            target="_blank"
            className="ml-1 underline text-info hover:underline"
            href="https://manychat.com/"
          >
            https://manychat.com/
          </a>
        </div>
        <div className="flex items-center justify-between col-span-12 mb-4">
          <div>
            <Label text="Trạng thái ManyChat" />
            <span className="flex items-center ml-1 font-semibold text-gray-700">
              <div
                className={`w-2.5 h-2.5 mr-2 rounded-full bg-${MANYCHAT_STATUS.find((x) => x.value == shopConfig.manychatConfig.status)?.color
                  }`}
              ></div>
              <span
                className={`text-${MANYCHAT_STATUS.find((x) => x.value == shopConfig.manychatConfig.status)?.color
                  }`}
              >
                {MANYCHAT_STATUS.find((x) => x.value == shopConfig.manychatConfig.status)?.label}
              </span>
            </span>
          </div>
          {shopConfig.manychatConfig.status == "connected" ? (
            <Button
              outline
              hoverDanger
              className="bg-white rounded-full"
              text="Huỷ kết nối ManyChat"
              onClick={() => { !editDisable ? disconnectManyChat : toast.info("Bạn không có quyền hủy kết nối ManyChat") }}
            />
          ) : (
            <Button
              info
              className="rounded-full"
              text="Kết nối Manychat"
              onClick={() => setOpenConnectDialog(true)}
              disabled={editDisable}
            />
          )}
        </div>
        {shopConfig.manychatConfig.pageInfo && (
          <div className="col-span-12 mb-6">
            <Label text="Tài khoản ManyChat" />
            <div
              style={{ minWidth: 320 }}
              className="flex flex-col px-4 py-3 mt-3 border rounded bg-slate-light border-slate gap-y-2"
            >
              <div className="flex justify-between text-gray-700">
                <span>Tên ManyChat </span>
                <strong>{shopConfig.manychatConfig.pageInfo.name}</strong>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Loại hình </span>
                <strong>{shopConfig.manychatConfig.pageInfo.category}</strong>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Khu vực </span>
                <strong>{shopConfig.manychatConfig.pageInfo.timezone}</strong>
              </div>
              {shopConfig.manychatConfig.pageInfo.description && (
                <div className="flex justify-between text-gray-700">
                  <span>Mô tả</span>
                  <strong>{shopConfig.manychatConfig.pageInfo.description}</strong>
                </div>
              )}
            </div>
          </div>
        )}
        <Field label="Trường thông tin liên kết" name="mappingField" cols={12}>
          <Input className="h-12" />
        </Field>
        <Form.Footer
          className="mt-1"
          isReverse={false}
          submitProps={{ large: true, className: "shadow", disabled: editDisable }}
        />
      </Form>

      <Form
        dialog
        title="Kết nối tài khoản ManyChat"
        onSubmit={connectManyChat}
        isOpen={openConnectDialog}
        onClose={() => setOpenConnectDialog(false)}
      >
        <Field name="apiKey" label="API Key ManyChat" required>
          <Input placeholder="Hãy nhập API Key tại đây để kết nối" />
        </Field>
        <Form.Footer submitProps={{ info: true }} />
      </Form>
    </>
  );
}

function ZaloSettings({ editDisable }: { editDisable: boolean }) {
  const { shopConfig, updateShopConfig, setShopConfig } = useShopLayoutContext();
  const [eventFollowOA, setEventFollowOA] = useState<any>();
  const router = useRouter();
  const toast = useToast();
  const alert = useAlert();

  const onSubmit = async (data) => {
    await updateShopConfig({
      zaloConfig: { ...data, eventFollowOA },
    });
  };

  const generataZaloAuthLink = async () => {
    try {
      let res = await ShopConfigService.generateZaloAuthLink(location.href);
      if (res) {
        router.push(res);
      }
    } catch (err) {
      console.error(err);
      toast.error("Kết nối thất bại. " + err.message);
    }
  };

  const connectZalo = async (code) => {
    try {
      const res = await ShopConfigService.connectZalo(code);
      setShopConfig({ ...shopConfig, ...res });
      toast.success("Kết nối Zalo thành công");
    } catch (err) {
      console.error(err);
      toast.error("Kết nối thất bại. " + err.message);
    } finally {
      const url = new URL(location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("oa_id");
      url.searchParams.delete("state");
      url.searchParams.delete("code_challenge");
      router.push(url.toString(), null, { shallow: true });
    }
    return true;
  };
  const disconnectZalo = () => {
    return alert.danger(
      "Huỷ kết nối Zalo?",
      "Bạn có chắc chắn muốn huỷ kết nối Zalo",
      "Huỷ kết nối",
      async () => {
        try {
          const res = await ShopConfigService.disconnectZalo();
          setShopConfig({ ...shopConfig, ...res });
          toast.success("Huỷ kết nối Zalo thành công");
        } catch (err) {
          console.error(err);
          toast.error("Huỷ kết nối thất bại. " + err.message);
        }
        return true;
      }
    );
  };
  useEffect(() => {
    const { code } = router.query;
    if (!code) return;
    connectZalo(code);
  }, [router.query]);
  return (
    <Form
      grid
      defaultValues={shopConfig.zaloConfig}
      className="max-w-screen-sm animate-emerge"
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between col-span-12 pt-4 pl-1 mt-8 mb-4 border-t border-gray-300">
        <Form.Title title="Cấu hình liên kết Zalo" />
        <Field name="active" noError>
          <Switch placeholder="Bật zalo" readOnly={editDisable} />
        </Field>
      </div>
      <div className="flex items-center justify-between col-span-12 mb-4">
        <div>
          <Label text="Trạng thái Zalo" />
          <span className="flex items-center ml-1 font-semibold text-gray-700">
            <div
              className={`w-2.5 h-2.5 mr-2 rounded-full bg-${ZALO_STATUS.find((x) => x.value == shopConfig.zaloConfig.status)?.color
                }`}
            ></div>
            <span
              className={`text-${ZALO_STATUS.find((x) => x.value == shopConfig.zaloConfig.status)?.color
                }`}
            >
              {ZALO_STATUS.find((x) => x.value == shopConfig.zaloConfig.status)?.label}
            </span>
          </span>
        </div>
        {shopConfig.zaloConfig.status == "connected" ? (
          <Button
            outline
            hoverDanger
            className="bg-white rounded-full"
            text="Huỷ kết nối Zalo"
            onClick={() => { !editDisable ? disconnectZalo : toast.info("Bạn không có quyền huỷ kết nối Zalo") }}
          />
        ) : (
          <Button
            info
            className="rounded-full"
            text="Kết nối Zalo"
            onClick={() => { !editDisable ? generataZaloAuthLink : toast.info("Bạn không có quyền kết nối Zalo") }}

          />
        )}
      </div>
      {shopConfig.zaloConfig.oaInfo && (
        <div className="col-span-12 mb-6">
          <Label text="Thông tin ZaloOA" />
          <div
            style={{ minWidth: 320 }}
            className="flex flex-col px-4 py-3 mt-3 border rounded bg-slate-light border-slate gap-y-2"
          >
            <div className="flex justify-between text-gray-700">
              <span>Tên ZaloOA </span>
              <strong>{shopConfig.zaloConfig.oaInfo.name}</strong>
            </div>
            {shopConfig.zaloConfig.oaInfo.description && (
              <div className="flex justify-between text-gray-700">
                <span>Mô tả </span>
                <strong>{shopConfig.zaloConfig.oaInfo.description}</strong>
              </div>
            )}
          </div>
        </div>
      )}
      {eventFollowOA && (
        <Card className="col-span-12 mb-6">
          <div className="flex">
            <Label text="Tính năng follow OA event" />
            <Switch
              placeholder="Bật"
              value={eventFollowOA.active}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, active: val })}
            />
          </div>
          <Field label="Tiêu đề">
            <Input
              value={eventFollowOA.title}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, title: val })}
            />
          </Field>
          <Field label="Tiêu đề phụ">
            <Input
              value={eventFollowOA.subTitle}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, subTitle: val })}
            />
          </Field>
          <Field label="Tin nhắn">
            <Textarea
              value={eventFollowOA.message}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, message: val })}
            />
          </Field>
          <Field label="Tiêu đề nút bấm">
            <Input
              value={eventFollowOA.btnTitle}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, btnTitle: val })}
            />
          </Field>
          <Field label="Hình ảnh">
            <ImageInput
              multi
              value={eventFollowOA.image}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, image: val })}
            />
          </Field>
        </Card>
      )}
      <Form.Footer
        className="mt-1"
        isReverse={false}
        submitProps={{ large: true, className: "shadow", disabled: editDisable }}
      />
    </Form>
  );
}

const TRIGGER_SETTINGS_TABS = [
  { value: "notification", label: "Thông báo" },
  { value: "manychat", label: "ManyChat" },
  { value: "zalo", label: "Zalo" },
];

function MentionTextareaField({ textFieldName, label }: { textFieldName: string; label: string }) {
  const { orderContexts } = useTriggersContext();
  const {
    register,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useFormContext();

  register(textFieldName);
  const text: string = watch(textFieldName);
  const textError = useMemo(() => errors[textFieldName]?.message, [errors[textFieldName]]);

  return (
    <div>
      <Label error={textError} text={label} />
      <MentionTextarea
        error={!!textError}
        value={text || ""}
        onChange={(val) => {
          setValue(textFieldName, val);
          setError(textFieldName, null);
        }}
        contexts={orderContexts}
      />
      <div className="font-semibold text-sm pt-0.5 min-h-6 text-danger text-right pr-0.5">
        {textError && <span className="form-error animate-emerge-up">{textError}</span>}
      </div>
    </div>
  );
}
