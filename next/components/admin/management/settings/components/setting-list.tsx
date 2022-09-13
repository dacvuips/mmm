import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { HiCog } from "react-icons/hi";
import { Setting, SettingType, SETTING_TYPES } from "../../../../../lib/repo/setting.repo";
import { Checkbox, Field, Form, Input, Select } from "../../../../shared/utilities/form";
import { Accordion, NotFound, Spinner } from "../../../../shared/utilities/misc";
import { useSettingsContext } from "../providers/settings-provider";
import { SettingItem } from "./setting-item";

interface PropTypes extends ReactProps {}
export function SettingList(props: PropTypes) {
  const [openSettings, setOpenSettings] = useState<Setting>(null);
  const {
    saveSettings,
    settings,
    loadingSettings,
    settingGroup,
    saveSetting,
  } = useSettingsContext();
  const defaultValues = useMemo(() => {
    let values = {};
    if (settings) {
      for (let setting of settings) {
        values[setting.key] = setting.value;
      }
    }
    return values;
  }, [settings]);

  return (
    <>
      {!loadingSettings ? (
        <>
          <Form
            className="bg-white border border-gray-300 rounded shadow-sm"
            onSubmit={async (data) => saveSettings(data)}
            defaultValues={defaultValues}
          >
            <div className="px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">
              {settingGroup?.name}
            </div>
            <div
              className="px-5 py-3 v-scrollbar"
              style={{ maxHeight: "calc(100vh - 220px)", minHeight: "250px" }}
            >
              {!settings?.length ? (
                <>
                  <NotFound text="Chưa có cấu hình nào" icon={<HiCog />}></NotFound>
                </>
              ) : (
                <>
                  {settings.map((setting) => (
                    <SettingItem key={setting.id} setting={setting} />
                  ))}
                </>
              )}
            </div>
            <Form.Footer className="p-3 pt-3 border-t border-gray-200" />
            {/* <div className="flex justify-end px-5 py-3 border-t border-gray-200">
              <Button gray text="Reset dữ liệu" onClick={onInitData} />
              <Button
                primary
                submit
                className="ml-2"
                text="Lưu thay đổi"
                onClick={async () => await saveSettings(mutableSettings)}
              />
            </div> */}
          </Form>
          <Form
            dialog
            grid
            width="550px"
            title={`${openSettings ? "Cập nhật" : "Tạo"} cấu hình`}
            defaultValues={openSettings}
            isOpen={!!openSettings}
            onClose={() => setOpenSettings(null)}
            onSubmit={async (data) => {
              await saveSetting(data.id, data).then((res) => {
                setOpenSettings(null);
              });
            }}
          >
            <Field name="name" label="Tên cấu hình" cols={6} required>
              <Input autoFocus />
            </Field>
            <Field name="key" label="Mã cấu hình" cols={6} required validation={{ code: true }}>
              <Input />
            </Field>
            <Field name="type" label="Loại cấu hình" cols={6} required>
              <Select options={SETTING_TYPES} readOnly={!!openSettings?.id} />
            </Field>
            <Field name="isActive" label=" " cols={6}>
              <Checkbox placeholder="Đang hoạt động" />
            </Field>
            <SettingTypeFields />
            <Field name="readOnly" cols={6}>
              <Checkbox placeholder="Không thể chỉnh sửa" />
            </Field>
            <Field name="isPrivate" cols={6}>
              <Checkbox placeholder="Chế độ riêng tư" />
            </Field>
            <Form.Footer />
          </Form>
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
}

function SettingTypeFields() {
  const { watch } = useFormContext();
  const type: SettingType = watch("type");

  return (
    <>
      <Accordion className="col-span-12" isOpen={type == "object"}>
        <Field
          name="valueKeys"
          label="Nhập tên các trường tuỳ chỉnh"
          cols={12}
          required={type == "object"}
        >
          <Input multi />
        </Field>
      </Accordion>
    </>
  );
}
