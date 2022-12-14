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
        Nh???p @ ????? hi???n g???i ?? c??c bi???n c?? th??? s??? d???ng. Khi g???i n???i dung c??c bi???n s??? ???????c thay b???ng d???
        li???u ?????ng c??? th???.
      </div>
      <Form.Title title="C???u h??nh th??ng b??o kh??ch h??ng" />
      <MentionTextareaField label="????n h??ng ch???" textFieldName="orderPending" />
      <MentionTextareaField label="????n h??ng h???y" textFieldName="orderCanceled" />
      <MentionTextareaField label="????n ??ang l??m" textFieldName="orderConfirmed" />
      <MentionTextareaField label="????n ho??n th??nh" textFieldName="orderCompleted" />
      <MentionTextareaField label="????n th???t b???i" textFieldName="orderFailure" />
      <MentionTextareaField label="T???ng ??i???m th?????ng" textFieldName="orderRewardPoint" />

      <Form.Title title="C???u h??nh th??ng b??o Nh??n vi??n" />
      <MentionTextareaField
        label="????n h??ng ??ang ch??? cho nh??n vi??n"
        textFieldName="orderPendingForStaff"
      />
      <MentionTextareaField
        label="????n h??ng ??ang h???y cho nh??n vi??n"
        textFieldName="orderCanceledForStaff"
      />
      <MentionTextareaField
        label="????n h??ng ??ang ???????c l??m m??n cho nh??n vi??n"
        textFieldName="orderConfirmedForStaff"
      />
      <MentionTextareaField
        label="????n ho??n th??nh cho nh??n vi??n"
        textFieldName="orderCompletedForStaff"
      />
      <MentionTextareaField
        label="????n h??ng th???t b???i cho nh??n vi??n"
        textFieldName="orderFailureForStaff"
      />
      <Field label="Th??ng b??o Ahamove" name="ahamoveNotifyEnabled">
        <Switch placeholder="B???t th??ng b??o" />
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
      toast.success("K???t n???i ManyChat th??nh c??ng");
      setOpenConnectDialog(false);
    } catch (err) {
      console.error(err);
      toast.error("K???t n???i th???t b???i. " + err.message);
    }
    return true;
  };
  const disconnectManyChat = () => {
    return alert.danger(
      "Hu??? k???t n???i ManyChat?",
      "B???n c?? ch???c ch???n mu???n hu??? k???t n???i ManyChat",
      "Hu??? k???t n???i",
      async () => {
        try {
          const res = await ShopConfigService.disconnectManychat();
          setShopConfig({ ...shopConfig, ...res });
          toast.success("Hu??? k???t n???i ManyChat th??nh c??ng");
        } catch (err) {
          console.error(err);
          toast.error("Hu??? k???t n???i th???t b???i. " + err.message);
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
          <Form.Title title="C???u h??nh li??n k???t ManyChat" />
          <Switch
            readOnly={editDisable}
            value={isManyChatActive}
            onChange={setIsManyChatActive}
            placeholder="B???t ManyChat"
          />
        </div>
        <div className="flex items-center p-2 mb-3 -mt-2 text-sm font-semibold text-gray-600 border rounded-sm border-info bg-info-light col-span-full">
          <i className="ml-1 mr-1 text-info">
            <RiInformationLine />
          </i>
          ????ng k?? d???ch v??? ManyChat t???i{" "}
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
            <Label text="Tr???ng th??i ManyChat" />
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
              text="Hu??? k???t n???i ManyChat"
              onClick={() => { !editDisable ? disconnectManyChat : toast.info("B???n kh??ng c?? quy???n h???y k???t n???i ManyChat") }}
            />
          ) : (
            <Button
              info
              className="rounded-full"
              text="K???t n???i Manychat"
              onClick={() => setOpenConnectDialog(true)}
              disabled={editDisable}
            />
          )}
        </div>
        {shopConfig.manychatConfig.pageInfo && (
          <div className="col-span-12 mb-6">
            <Label text="T??i kho???n ManyChat" />
            <div
              style={{ minWidth: 320 }}
              className="flex flex-col px-4 py-3 mt-3 border rounded bg-slate-light border-slate gap-y-2"
            >
              <div className="flex justify-between text-gray-700">
                <span>T??n ManyChat </span>
                <strong>{shopConfig.manychatConfig.pageInfo.name}</strong>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Lo???i h??nh </span>
                <strong>{shopConfig.manychatConfig.pageInfo.category}</strong>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Khu v???c </span>
                <strong>{shopConfig.manychatConfig.pageInfo.timezone}</strong>
              </div>
              {shopConfig.manychatConfig.pageInfo.description && (
                <div className="flex justify-between text-gray-700">
                  <span>M?? t???</span>
                  <strong>{shopConfig.manychatConfig.pageInfo.description}</strong>
                </div>
              )}
            </div>
          </div>
        )}
        <Field label="Tr?????ng th??ng tin li??n k???t" name="mappingField" cols={12}>
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
        title="K???t n???i t??i kho???n ManyChat"
        onSubmit={connectManyChat}
        isOpen={openConnectDialog}
        onClose={() => setOpenConnectDialog(false)}
      >
        <Field name="apiKey" label="API Key ManyChat" required>
          <Input placeholder="H??y nh???p API Key t???i ????y ????? k???t n???i" />
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
      toast.error("K???t n???i th???t b???i. " + err.message);
    }
  };

  const connectZalo = async (code) => {
    try {
      const res = await ShopConfigService.connectZalo(code);
      setShopConfig({ ...shopConfig, ...res });
      toast.success("K???t n???i Zalo th??nh c??ng");
    } catch (err) {
      console.error(err);
      toast.error("K???t n???i th???t b???i. " + err.message);
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
      "Hu??? k???t n???i Zalo?",
      "B???n c?? ch???c ch???n mu???n hu??? k???t n???i Zalo",
      "Hu??? k???t n???i",
      async () => {
        try {
          const res = await ShopConfigService.disconnectZalo();
          setShopConfig({ ...shopConfig, ...res });
          toast.success("Hu??? k???t n???i Zalo th??nh c??ng");
        } catch (err) {
          console.error(err);
          toast.error("Hu??? k???t n???i th???t b???i. " + err.message);
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
        <Form.Title title="C???u h??nh li??n k???t Zalo" />
        <Field name="active" noError>
          <Switch placeholder="B???t zalo" readOnly={editDisable} />
        </Field>
      </div>
      <div className="flex items-center justify-between col-span-12 mb-4">
        <div>
          <Label text="Tr???ng th??i Zalo" />
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
            text="Hu??? k???t n???i Zalo"
            onClick={() => { !editDisable ? disconnectZalo : toast.info("B???n kh??ng c?? quy???n hu??? k???t n???i Zalo") }}
          />
        ) : (
          <Button
            info
            className="rounded-full"
            text="K???t n???i Zalo"
            onClick={() => { !editDisable ? generataZaloAuthLink : toast.info("B???n kh??ng c?? quy???n k???t n???i Zalo") }}

          />
        )}
      </div>
      {shopConfig.zaloConfig.oaInfo && (
        <div className="col-span-12 mb-6">
          <Label text="Th??ng tin ZaloOA" />
          <div
            style={{ minWidth: 320 }}
            className="flex flex-col px-4 py-3 mt-3 border rounded bg-slate-light border-slate gap-y-2"
          >
            <div className="flex justify-between text-gray-700">
              <span>T??n ZaloOA </span>
              <strong>{shopConfig.zaloConfig.oaInfo.name}</strong>
            </div>
            {shopConfig.zaloConfig.oaInfo.description && (
              <div className="flex justify-between text-gray-700">
                <span>M?? t??? </span>
                <strong>{shopConfig.zaloConfig.oaInfo.description}</strong>
              </div>
            )}
          </div>
        </div>
      )}
      {eventFollowOA && (
        <Card className="col-span-12 mb-6">
          <div className="flex">
            <Label text="T??nh n??ng follow OA event" />
            <Switch
              placeholder="B???t"
              value={eventFollowOA.active}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, active: val })}
            />
          </div>
          <Field label="Ti??u ?????">
            <Input
              value={eventFollowOA.title}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, title: val })}
            />
          </Field>
          <Field label="Ti??u ????? ph???">
            <Input
              value={eventFollowOA.subTitle}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, subTitle: val })}
            />
          </Field>
          <Field label="Tin nh???n">
            <Textarea
              value={eventFollowOA.message}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, message: val })}
            />
          </Field>
          <Field label="Ti??u ????? n??t b???m">
            <Input
              value={eventFollowOA.btnTitle}
              onChange={(val) => setEventFollowOA({ ...eventFollowOA, btnTitle: val })}
            />
          </Field>
          <Field label="H??nh ???nh">
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
  { value: "notification", label: "Th??ng b??o" },
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
