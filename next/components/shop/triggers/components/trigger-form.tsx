import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FaPencilAlt, FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { Mention, MentionsInput } from "react-mentions";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { OrderService } from "../../../../lib/repo/order.repo";
import { ProductService } from "../../../../lib/repo/product.repo";
import { TriggerGroup } from "../../../../lib/repo/trigger-group.repo";
import {
  MESSAGING_TAGS,
  SmaxbotType,
  SMAXBOT_TYPES,
  Trigger,
  TriggerActionType,
  TriggerNotificationActionType,
  TRIGGER_ACTION_TYPES,
  TRIGGER_NOTIFICATION_ACTION_TYPES,
} from "../../../../lib/repo/trigger.repo";
import {
  Button,
  Field,
  Form,
  FormProps,
  Input,
  Label,
  Radio,
  Select,
  Switch,
} from "../../../shared/utilities/form";
import { Img, StatusLabel } from "../../../shared/utilities/misc";
import { TabButtons } from "../../../shared/utilities/tab/tab-buttons";
import { useSmaxbotContext } from "../providers/smaxbot-provider";
import { useTriggersContext } from "../providers/triggers-provider";

interface Props extends FormProps {
  trigger: Trigger;
  triggerGroupId: string;
  triggerGroups: TriggerGroup[];
  triggerEditDisable: boolean;
}
export function TriggerForm({
  trigger,
  triggerGroupId,
  triggerGroups,
  triggerEditDisable,
  ...props
}: Props) {
  const [openAction, setOpenAction] = useState<{ action: any; index: number; event: string }>(null);
  const [submittedAction, setSubmittedAction] = useState<{ action: any; index: number }>();

  return (
    <>
      <Form
        dialog
        grid
        defaultValues={trigger}
        width={"650px"}
        extraDialogClass="bg-transparent"
        extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
        extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
        title={`${trigger?.id ? "Chỉnh sửa" : "Tạo"} trigger`}
        {...props}
      >
        <Field
          name="name"
          label="Tên chiến dịch"
          cols={12}
          required
          validation={{ nameValid: (val) => validateKeyword(val) }}
        >
          <Input />
        </Field>
        <Field name="triggerGroupId" label="Nhóm chiến dịch" cols={8}>
          <Select
            defaultValue={triggerGroupId}
            options={triggerGroups?.map((x) => ({ value: x.id, label: x.name })) || []}
          />
        </Field>
        <Field name="active" label=" " cols={4}>
          <Switch placeholder="Kích hoạt" defaultValue={true} />
        </Field>
        <EventFields />
        <ActionFields
          submittedAction={submittedAction}
          onClearSubmittedAction={() => setSubmittedAction(null)}
          onOpenAction={(props) => setOpenAction(props)}
        />
        <Form.Footer
          className="justify-center mt-6"
          cancelText=""
          submitProps={{ className: "h-14 px-16", disabled: triggerEditDisable }}
        />
      </Form>
      <ActionForm
        index={openAction?.index}
        action={openAction?.action}
        event={openAction?.event}
        isOpen={!!openAction}
        onClose={() => setOpenAction(null)}
        onSubmit={(data) => {
          setSubmittedAction({
            action: data,
            index: openAction.index,
          });
          setOpenAction(null);
        }}
      />
    </>
  );
}

function EventFields() {
  const { events, subEvents } = useTriggersContext();
  const { watch, setValue } = useFormContext();

  const event: string = watch("event");

  const eventType = useMemo(() => {
    if (event) {
      return event.split(":")[0];
    }
    return "";
  }, [event]);
  const currentSubEvents: Option[] = useMemo(() => {
    if (eventType) {
      return events
        .find((x) => x.id == eventType)
        ?.events.map((x) => ({ value: x.id, label: x.name }));
    }
    return [];
  }, [eventType]);

  useEffect(() => {
    if (!event) {
      setValue("event", subEvents[0].id);
    }
  }, [event]);

  return (
    <div className="col-span-12 mb-6">
      <Label text="Loại sự kiện" />
      <div className="flex items-center gap-3">
        <TabButtons
          options={events.map((x) => ({ value: x.id, label: x.name }))}
          value={eventType}
          onChange={(type) => {
            if (eventType != type) {
              const selectedEvent = events.find((x) => x.id == type);
              setValue("event", selectedEvent?.events[0].id);
            }
          }}
          flex={false}
          tabClassName={"px-3"}
        />
        <Field className="flex-1" name="event" noError>
          <Select options={currentSubEvents} />
        </Field>
      </div>
    </div>
  );
}

function ActionFields({
  submittedAction,
  onClearSubmittedAction,
  onOpenAction,
}: {
  submittedAction: { action; index: number };
  onClearSubmittedAction: () => any;
  onOpenAction: ({ action, index, event }: { action: any; index: number; event: string }) => any;
}) {
  const { events } = useTriggersContext();
  const { register, watch, getValues } = useFormContext();
  const { append, remove, update } = useFieldArray({ name: "actions" });
  register("actions", {
    value: [],
  });
  const actions: any[] = watch("actions");
  const event: string = watch("event");
  const eventType = useMemo(() => event?.split(":")[0] || "", [event]);

  useEffect(() => {
    if (submittedAction) {
      if (submittedAction.index >= 0) {
        update(submittedAction.index, {
          ...submittedAction.action,
        });
      } else {
        append(submittedAction.action);
      }
      onClearSubmittedAction();
    }
  }, [submittedAction]);

  const contexts = useMemo(() => {
    const triggerEvent = events.find((x) => x.id == eventType);
    if (triggerEvent?.context) {
      return triggerEvent.context.map((x) => ({
        id: x.id,
        display: x.name,
      }));
    }
    return [];
  }, [event]);

  return (
    <div className="col-span-12 mb-6">
      <Label
        text="Hành động"
        description="Lưu ý: Nếu một biến đang hiển thị dưới dạng {{MÃ_BIẾN}} thay vì TÊN_BIẾN, thì đó là do loại sự kiện được chọn đã bị thay đổi, xin chuyển lại loại sự kiện ban đầu hoặc thay đổi tất cả biến."
      />
      <div className="flex flex-col gap-3">
        {actions?.map((action, index) => (
          <div key={action.toString() + index} className="bg-white border rounded animate-emerge">
            <div className="flex justify-between px-3 py-2 border-b">
              <div>
                <StatusLabel options={TRIGGER_ACTION_TYPES} value={action.type} />
                {action.type == "smaxbot" && (
                  <StatusLabel
                    extraClassName="ml-2"
                    type="text"
                    options={MESSAGING_TAGS}
                    value={action.options.messagingTag}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  className="h-6 px-2"
                  icon={<FaPencilAlt />}
                  tooltip="Điều chỉnh"
                  onClick={() => onOpenAction({ action, index, event: eventType })}
                />
                <Button
                  className="h-6 px-2"
                  hoverDanger
                  icon={<FaRegTrashAlt />}
                  tooltip="Xoá"
                  onClick={() => remove(index)}
                />
              </div>
            </div>
            <div className="px-3 py-2">
              {action.type == "notification" && action.options.title && (
                <div className="font-semibold">{action.options.title}</div>
              )}
              {(action.type != "smaxbot" || action.options.type != "block") && (
                <MentionTextarea value={action.options.text} contexts={contexts} />
              )}
              {action.type == "notification" && action.options.action.type == "WEBSITE" && (
                <a
                  className="text-primary hover:text-primary-dark hover:underline"
                  target="_blank"
                  href={action.options.action.link}
                >
                  {action.options.action.link}
                </a>
              )}
              {action.type == "smaxbot" && action.options.type == "block" && (
                <>
                  {action.options.blockId && (
                    <a
                      className="flex items-center flex-1 p-2 border border-gray-400 rounded hover:border-primary"
                      target="_blank"
                      href={`https://smax.bot/${action.options.botId}/structures/${action.options.blockId}`}
                    >
                      {action.options.pagePicture && (
                        <Img
                          lazyload={false}
                          className="w-12 grow-0 shrink-0"
                          rounded
                          src={action.options.pagePicture}
                        />
                      )}
                      <div className="flex-1 pl-3">
                        <div className="font-semibold text-accent">{action.options.pageName}</div>
                        <div>
                          <strong className="text-gray-700">Block: </strong>
                          <span className="pl-1 font-semibold underline text-primary hover:underline">
                            {action.options.blockName || action.options.blockId}
                          </span>
                        </div>
                      </div>
                    </a>
                  )}
                  <div className="flex flex-col gap-2 px-2 my-3">
                    {action.options.attr?.map((attr) => (
                      <div key={attr.key + attr.value}>
                        <div className="font-semibold">{attr.key}</div>
                        <MentionTextarea value={attr.value} contexts={contexts} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button
        unfocusable
        text={"Thêm hành động mới"}
        textPrimary
        className="justify-start px-0 hover:underline"
        icon={<FaPlus />}
        onClick={() => {
          onOpenAction({ action: {}, index: -1, event: eventType });
        }}
      />
    </div>
  );
}

function ActionForm({
  index,
  action,
  event,
  ...props
}: { index: number; action: any; event: string } & FormProps) {
  return (
    <Form
      dialog
      defaultValues={action}
      width={"450px"}
      title={`${index >= 0 ? "Chỉnh sửa" : "Tạo"} hành động`}
      {...props}
    >
      <ActionTypeFields event={event} />
      <Form.Footer />
    </Form>
  );
}

function ActionTypeFields({ event }: { event: string }) {
  const { events } = useTriggersContext();
  const {
    register,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useFormContext();
  const type: TriggerActionType = watch("type");
  const smaxBotType: SmaxbotType = watch("options.type");

  register("type", {
    required: true,
  });
  useEffect(() => {
    if (!type) {
      setValue("type", TRIGGER_ACTION_TYPES[0].value);
    }
  }, [type]);

  const textFieldName = "options.text";
  register(textFieldName, {
    required: !(type == "smaxbot" && smaxBotType == "block"),
  });
  const text: string = watch(textFieldName);
  const textError = useMemo(() => errors[textFieldName]?.message, [errors[textFieldName]]);

  register("options.body");
  useEffect(() => {
    setValue("options.body", text);
  }, [text]);

  if (type == "smaxbot") {
    register("options.type");
  }
  useEffect(() => {
    if (!smaxBotType) {
      setValue("options.type", SMAXBOT_TYPES[0].value);
    }
  }, [smaxBotType]);

  const contexts = useMemo(() => {
    const triggerEvent = events.find((x) => x.id == event);
    if (triggerEvent?.context) {
      return triggerEvent.context.map((x) => ({
        id: x.id,
        display: x.name,
      }));
    }
    return [];
  }, [event]);

  return (
    <>
      <TabButtons
        className="mb-6"
        options={TRIGGER_ACTION_TYPES}
        value={type}
        onChange={(type) => setValue("type", type)}
      />
      {type == "smaxbot" && (
        <>
          {/* <Field name="options.type" label="" noError className="hidden">
            <Radio options={SMAXBOT_TYPES} />
          </Field> */}
          <Field name="options.messagingTag" label="Loại thông báo">
            <Select options={MESSAGING_TAGS} />
          </Field>
        </>
      )}
      {type == "notification" && (
        <Field
          name="options.title"
          label="Tiêu đề"
          validation={{ valid: (val) => validateKeyword(val) }}
        >
          <Input />
        </Field>
      )}
      <div className={`${type == "smaxbot" && smaxBotType == "block" ? "hidden" : ""}`}>
        <Label
          error={textError}
          text="Nội dung"
          description={`Nhập @ để hiện gợi ý các biến có thể sử dụng. Khi gửi nội dung các biến sẽ được thay bằng dữ liệu động cụ thể.`}
        />
        <MentionTextarea
          error={!!textError}
          value={text}
          onChange={(val) => {
            setValue(textFieldName, val);
            setError(textFieldName, null);
          }}
          contexts={contexts}
        />
        <div className="font-semibold text-sm pt-0.5 min-h-6 text-danger text-right pr-0.5">
          {textError && <span className="form-error animate-emerge-up">{textError}</span>}
        </div>
      </div>
      <NotificationFields />
      <SmaxbotFields contexts={contexts} />
    </>
  );
}

function NotificationFields() {
  const { watch, setValue } = useFormContext();
  const type: TriggerActionType = watch("type");
  const actionType: TriggerNotificationActionType = watch("options.action.type");

  useEffect(() => {
    if (!actionType) {
      setValue("options.action.type", TRIGGER_NOTIFICATION_ACTION_TYPES[0].value);
    }
  }, []);

  if (type != "notification") return <></>;
  return (
    <>
      <Field name="options.action.type" label="Loại thông báo">
        <Select options={TRIGGER_NOTIFICATION_ACTION_TYPES} />
      </Field>
      <Field
        className={`animate-emerge ${actionType != "WEBSITE" ? "hidden" : ""}`}
        name="options.action.link"
        label="Đường dẫn Website"
        required={actionType == "WEBSITE"}
      >
        <Input />
      </Field>
      <Field
        label="Đơn hàng"
        className={`animate-emerge ${actionType != "ORDER" ? "hidden" : ""}`}
        name="options.action.orderId"
        required={actionType == "ORDER"}
      >
        <Select
          autocompletePromise={(props) =>
            OrderService.getAllAutocompletePromise(props, {
              parseOption: (data) => ({ value: data.id, label: data.code }),
            })
          }
        />
      </Field>
      <Field
        label="Sản phẩm"
        className={`animate-emerge ${actionType != "PRODUCT" ? "hidden" : ""}`}
        name="options.action.productId"
        required={actionType == "PRODUCT"}
      >
        <Select
          autocompletePromise={(props) =>
            ProductService.getAllAutocompletePromise(props, {
              parseOption: (data) => ({ value: data.id, label: data.name }),
            })
          }
        />
      </Field>
    </>
  );
}

function SmaxbotFields({ contexts }: { contexts: { id: string; display: string }[] }) {
  const { openSmaxbot } = useSmaxbotContext();
  const {
    register,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useFormContext();
  const type: TriggerActionType = watch("type");
  register("options.botId");
  register("options.botToken");
  register("options.blockId");
  register("options.pageName");
  register("options.pagePicture");
  register("options.blockName");
  const blockId = watch("options.blockId");
  const blockName = watch("options.blockName");
  const botId = watch("options.botId");
  const pageName = watch("options.pageName");
  const pagePicture = watch("options.pagePicture");
  const smaxBotType: SmaxbotType = watch("options.type");

  const { fields, append, remove } = useFieldArray({ name: "options.attr" });

  if (type != "smaxbot" || smaxBotType != "block") return <></>;
  return (
    <>
      <Label text="Kịch bản" />
      {blockId ? (
        <div className="mb-6">
          <a
            className="flex items-center flex-1 p-2 border border-gray-400 rounded"
            target="_blank"
            href={`https://smax.bot/${botId}/structures/${blockId}`}
          >
            {pagePicture && (
              <Img lazyload={false} className="w-12 grow-0 shrink-0" rounded src={pagePicture} />
            )}
            <div className="flex-1 pl-3">
              <div className="font-semibold text-accent">{pageName}</div>
              <div>
                <strong>Block: </strong>
                <span className="pl-1 font-semibold underline text-primary hover:underline hover:text-primary-dark">
                  {blockName || blockId}
                </span>
              </div>
            </div>
          </a>
          <Button
            outline
            className="mt-2"
            text={"Chọn lại"}
            onClick={() => {
              openSmaxbot(botId, blockId).then((res) => {
                if (res) {
                  const { bot_id, bot_token, block_id, page_name, page_picture, block_name } = res;
                  setValue("options.botId", bot_id);
                  setValue("options.botToken", bot_token);
                  setValue("options.blockId", block_id);
                  setValue("options.pageName", page_name);
                  setValue("options.pagePicture", page_picture);
                  setValue("options.blockName", block_name);
                }
              });
            }}
          />
        </div>
      ) : (
        <Button
          className="w-full mb-6"
          outline
          text={"Chọn kịch bản Smaxbot"}
          onClick={() => {
            openSmaxbot().then((res) => {
              if (res) {
                const { bot_id, bot_token, block_id, page_name, page_picture, block_name } = res;
                setValue("options.botId", bot_id);
                setValue("options.botToken", bot_token);
                setValue("options.blockId", block_id);
                setValue("options.pageName", page_name);
                setValue("options.pagePicture", page_picture);
                setValue("options.blockName", block_name);
              }
            });
          }}
        />
      )}
      {blockId && (
        <>
          <Label
            text="Biến kịch bản"
            description={`Nhập @ để hiện gợi ý các biến có thể sử dụng. Khi gửi nội dung các biến sẽ được thay bằng dữ liệu động cụ thể.\n Mã biến chỉ gồm ký tự, số, gạch nối và gạch dưới.`}
          />
          <div className="flex flex-col gap-3">
            {(fields as { id: string; key: string; value: string }[]).map((field, index) => (
              <AttrField
                contexts={contexts}
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
          <Button
            unfocusable
            text={"Thêm biến mới"}
            textPrimary
            className="justify-start px-0 hover:underline"
            icon={<FaPlus />}
            onClick={() => {
              append({ key: "", value: "" });
            }}
          />
        </>
      )}
    </>
  );
}

function AttrField({
  contexts,
  index,
  onRemove,
}: {
  contexts;
  index: number;
  onRemove: () => any;
}) {
  const {
    register,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useFormContext();
  const type: TriggerActionType = watch("type");
  const smaxBotType: SmaxbotType = watch("options.type");
  const textFieldName = `options.attr.${index}.value`;
  const text: string = watch(textFieldName);
  const textError = useMemo(() => errors[textFieldName]?.message, [errors[textFieldName]]);
  register(textFieldName, {
    required: !(type == "smaxbot" && smaxBotType == "block"),
  });

  return (
    <div className="grid grid-cols-12 gap-0.5">
      <div className="col-span-4">
        <Field name={`options.attr.${index}.key`} cols={4} noError validation={{ code: true }}>
          <Input className="mt-0 rounded-r-none" placeholder="Tên biến" />
        </Field>
        <Button
          className="h-auto px-0 mt-1 ml-1 text-xs underline hover:underline"
          hoverDanger
          text={"Xoá"}
          onClick={onRemove}
        />
      </div>
      <MentionTextarea
        className="col-span-8 rounded-tl-none"
        value={text}
        onChange={(val) => {
          setValue(textFieldName, val);
          setError(textFieldName, null);
        }}
        contexts={contexts}
      />
    </div>
  );
}

export function MentionTextarea({
  value,
  onChange,
  contexts,
  error,
  className = "",
}: {
  value: string;
  onChange?: (val: string) => any;
  contexts: { id: string; display: string }[];
  error?: boolean;
} & ReactProps) {
  const ref = useRef<HTMLTextAreaElement>();

  return (
    <>
      <div
        {...(onChange
          ? {
            className: `form-control py-2 focus-within:border-primary cursor-text ${className} ${error ? "error" : ""
              }`,
            onClick: (e) => {
              if (
                ref.current &&
                (e.target as HTMLDivElement).classList.contains("form-control")
              ) {
                ref.current.selectionStart = ref.current.value.length;
                ref.current.selectionEnd = ref.current.value.length;
                ref.current.focus();
              }
            },
          }
          : {})}
      >
        <MentionsInput
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          className="mentions"
          style={{
            minHeight: onChange ? 50 : 25,
          }}
        >
          <Mention
            markup={`{{__id__}}`}
            displayTransform={(id, display) =>
              contexts.find((x) => x.id == id)?.display || `{{${id}}}`
            }
            trigger="@"
            data={contexts}
            className="mentions__mention"
          />
        </MentionsInput>
      </div>
    </>
  );
}
