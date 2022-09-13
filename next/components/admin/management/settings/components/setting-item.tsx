import { RiLock2Line } from "react-icons/ri";
import { Setting } from "../../../../../lib/repo/setting.repo";
import { Field } from "../../../../shared/utilities/form";
import { ImageInput } from "../../../../shared/utilities/form/image-input";
import { Input } from "../../../../shared/utilities/form/input";
import { Switch } from "../../../../shared/utilities/form/switch";
import { Textarea } from "../../../../shared/utilities/form/textarea";

interface PropTypes extends ReactProps {
  setting: Partial<Setting>;
}
export function SettingItem({ setting, ...props }: PropTypes) {
  return (
    <div className="pb-3">
      <div className="text-gray-600 font-semibold pl-1 pb-1 flex">
        <span
          className={`flex ${setting.isActive ? "" : "line-through"} ${
            setting.readOnly ? "text-gray-400" : ""
          }`}
          data-tooltip={setting.isActive ? "" : "Không hoạt động"}
        >
          {setting.name}
        </span>
        {setting.isPrivate && (
          <i className="text-xl ml-2" data-tooltip="Chế độ riêng tư">
            <RiLock2Line />
          </i>
        )}
        {/* <div
          className="h-6 pl-4 pr-2 flex items-center text-gray-600 hover:text-primary cursor-pointer ml-auto"
          ref={ref}
          onClick={(e) => e.preventDefault()}
        >
          <i className="text-2xl">
            <RiMoreFill />
          </i>
        </div>
        <Dropdown placement="right-start" reference={ref}>
          <Dropdown.Item text="Chỉnh sửa" onClick={() => props.onEdit(setting)} />
          <Dropdown.Item hoverDanger text="Xoá" onClick={() => props.onDelete(setting)} />
        </Dropdown> */}
      </div>
      {
        {
          boolean: (
            <Field name={setting.key} readOnly={setting.readOnly}>
              <Switch />
            </Field>
          ),
          image: (
            <Field name={setting.key} readOnly={setting.readOnly}>
              <ImageInput />
            </Field>
          ),
          string: (
            <Field name={setting.key} readOnly={setting.readOnly}>
              <Input />
            </Field>
          ),
          number: (
            <Field name={setting.key} readOnly={setting.readOnly}>
              <Input number />
            </Field>
          ),
          richText: (
            <Field name={setting.key} readOnly={setting.readOnly}>
              <Textarea />
            </Field>
          ),
          object: (
            <>
              {Object.keys(setting.value).map((key, index, arr) => (
                <Field name={`${setting.key}.key`} key={key} readOnly={setting.readOnly}>
                  <Input
                    prefix={key}
                    prefixClassName="bg-gray-100 border-r border-gray-400 min-w-4xs"
                    className={`${index == 0 ? "" : "rounded-t-none"} ${
                      index == arr.length - 1 ? "" : "rounded-b-none"
                    } min-w`}
                  />
                </Field>
              ))}
            </>
          ),
          array: (
            <Field name={setting.key} readOnly={setting.readOnly}>
              <Input multi />
            </Field>
          ),
        }[setting.type]
      }
    </div>
  );
}
