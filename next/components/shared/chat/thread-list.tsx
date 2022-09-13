import { useEffect, useMemo, useRef, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import { FaSearch } from "react-icons/fa";
import { RiMessage3Line, RiPriceTag3Line, RiSettings4Line } from "react-icons/ri";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { CustomerService } from "../../../lib/repo/customer.repo";
import { MemberService } from "../../../lib/repo/member.repo";
import { PRODUCT_LABEL_COLORS } from "../../../lib/repo/product-label.repo";
import { ThreadLabel, ThreadLabelService } from "../../../lib/repo/thread-label.repo";
import { Thread, ThreadService } from "../../../lib/repo/thread.repo";
import { Img, NotFound, StatusLabel } from "../../shared/utilities/misc";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { Button, Field, Input, Label, Select } from "../utilities/form";
import { Popover } from "../utilities/popover/popover";
import { DataTable } from "../utilities/table/data-table";
import { useChatContext } from "./chat-provider";
import { useThreadContext } from "./thread-provider";

export function ThreadList() {
  const {
    threads,
    setThreads,
    total,
    fetchThread,
    receiverRole,
    senderId,
    selectedThread,
    selectThread,
    loadMore,
    selectedLabels,
    setSelectedLabels,
    threadLabels,
    setThreadLabels,
  } = useThreadContext();
  const [openThreadLabelsDialog, setOpenThreadLabelsDialog] = useState(false);
  const [id, setId] = useState("");
  const { unseenThreads } = useChatContext();
  const { user, staff, staffPermission, adminPermission } = useAuth();
  const hasExecutePermission = staffPermission("EXECUTE_CLIENT_CHAT");
  const hasExecutePermissionAdmin = adminPermission("EXECUTE_CHAT");

  console.log("hasExecutePermission", hasExecutePermission);
  console.log("hasExecutePermissionAdmin", hasExecutePermissionAdmin);
  console.log("user", user);
  console.log("staff", staff);
  const handleCheckExecutePermission = useMemo(() => {
    let flag: boolean = false;
    if (user) {
      flag = !hasExecutePermissionAdmin;
    } else if (staff) {
      flag = !hasExecutePermission;
    }
    return flag;
  }, [user, staff]);


  const threadLabelOptions = useMemo(
    () => threadLabels?.map((x) => ({ value: x.id, label: x.name, color: x.color })),
    [threadLabels]
  );

  return (
    <div className="flex flex-col h-full border-r w-72">
      {receiverRole == "CUSTOMER" && (
        <Select
          className="inline-grid h-12 border-none rounded-none"
          clearable
          searchable
          placeholder="Tìm kiếm khách hàng"
          value={id}
          onChange={(val, extraVal) => {
            setId(val);
            if (val) {
              fetchThread(extraVal.data.threadId, true).then((res) => {
                setId("");
              });
            }
          }}
          dropDownIcon={<FaSearch />}
          autocompletePromise={({ id, search }) =>
            CustomerService.getAllAutocompletePromise(
              { id, search },
              {
                fragment: "id name threadId",
                query: {
                  filter: {
                    memberId: senderId,
                    threadId: { $exists: true, $nin: threads?.map((x) => x.id) || [] },
                  },
                },
                parseOption: (data) => ({
                  value: data.id,
                  label: data.name || "[Khách vãng lai]",
                  data,
                }),
              }
            )
          }
          dependency={threads}
        />
      )}
      {receiverRole == "MEMBER" && (
        <Select
          className="inline-grid h-12 border-none rounded-none"
          clearable
          searchable
          placeholder="Tìm kiếm cửa hàng"
          value={id}
          onChange={(val, extraVal) => {
            setId(val);
            if (val) {
              fetchThread(extraVal.data.threadId, true).then((res) => {
                setId("");
              });
            }
          }}
          dropDownIcon={<FaSearch />}
          autocompletePromise={({ id, search }) =>
            MemberService.getAllAutocompletePromise(
              { id, search },
              {
                fragment: "id name threadId shopName code",
                query: {
                  filter: {
                    threadId: { $exists: true, $nin: threads?.map((x) => x.id) || [] },
                  },
                },
                parseOption: (data) => ({
                  value: data.id,
                  label: `[${data.code}] ${data.shopName || "Không có tên"}`,
                  data,
                }),
              }
            )
          }
          dependency={threads}
        />
      )}
      <div className="p-2 border-t">
        <Label text="Lọc theo nhãn">
          <Button
            icon={<RiSettings4Line />}
            tooltip="Quản lý nhãn"
            className="h-auto px-0 ml-auto"
            onClick={() => setOpenThreadLabelsDialog(true)}
          />
        </Label>
        <Select
          multi
          hasColor
          placeholder="Chọn nhãn"
          value={selectedLabels}
          onChange={(val) => setSelectedLabels(val)}
          dependency={threadLabels}
          options={threadLabelOptions}
          dropDownIcon={<RiPriceTag3Line />}
        />
      </div>
      <Scrollbars className="border-t mt-0.5" style={{ flex: "1 1 auto" }}>
        {!threads.length && (
          <NotFound icon={<RiMessage3Line />} text="Không tìm thấy cuộc trò chuyện nào" />
        )}
        {threads.map((thread, index) => {
          const unseenThread = unseenThreads.find((x) => x.id == thread.id);
          return (
            <ThreadItem
              avatar={
                receiverRole == "CUSTOMER" ? thread.customer?.avatar : thread.member?.shopLogo
              }
              name={receiverRole == "CUSTOMER" ? thread.customer?.name : thread.member?.shopName}
              thread={thread}
              key={thread.id}
              selected={selectedThread?.id == thread.id}
              seen={!unseenThread}
              threadLabelOptions={threadLabelOptions}
              onClick={() => {
                selectThread(thread);
              }}
              onThreadChange={(newThread) => {
                thread.threadLabelIds = newThread.threadLabelIds;
                setThreads([...threads]);
              }}
              executeDisabled={handleCheckExecutePermission}
            />
          );
        })}
        {threads.length < total && (
          <Button className="w-full h-12" text={"Tải thêm"} onClick={loadMore} />
        )}
      </Scrollbars>
      <ThreadLabelsDialog
        isOpen={openThreadLabelsDialog}
        onClose={() => {
          setOpenThreadLabelsDialog(false);
        }}
        onItems={setThreadLabels}
        executeDisabled={handleCheckExecutePermission}
      />
    </div>
  );
}

export function ThreadItem({
  avatar,
  thread,
  name,
  selected,
  seen,
  threadLabelOptions,
  onClick,
  onThreadChange,
  executeDisabled,
}: {
  thread: Thread;
  avatar: string;
  name: string;
  selected: boolean;
  seen: boolean;
  threadLabelOptions: Option[];
  onClick: () => any;
  onThreadChange: (thread: Thread) => any;
  executeDisabled: boolean;
}) {
  const ref = useRef();
  const toast = useToast();


  const toggleThreadLabel = (value) => {
    if (executeDisabled) {
      toast.info("Bạn không có quyền gán nhãn");
    } else {
      const threadLabelIds = [...thread.threadLabelIds];
      const index = threadLabelIds.findIndex((x) => x == value);
      if (index >= 0) {
        threadLabelIds.splice(index, 1);
      } else {
        threadLabelIds.push(value);
      }
      ThreadService.update({
        id: thread.id,
        data: {
          threadLabelIds,
        },
      }).then((res) => {
        onThreadChange(res);
      });
    }
  };

  return (
    <div
      className={`flex items-start px-3 py-2 border-b border-gray-100 cursor-pointer group ${selected ? "bg-slate-light" : "hover:bg-gray-50"
        }`}
      onClick={onClick}
    >
      <Img
        src={avatar}
        className={`w-12 border rounded-full ${seen ? "" : "border-primary"}`}
        imageClassName="z-10 bg-white"
        avatar
      >
        {!seen && <div className="pulse-ring" />}
      </Img>
      <div className="flex-1 pt-0.5 pl-2">
        <div
          className={`text-ellipsis-1 ${seen ? "text-gray-600 font-medium" : " text-gray-900 font-semibold"
            }`}
        >
          {name || "[Khách vãng lai]"}
        </div>
        <div
          className={`text-ellipsis-1 font-medium text-sm ${seen ? "text-gray-500" : " text-red"
            }`}
        >
          {thread.snippet}
        </div>
        <div className="flex flex-wrap gap-1">
          {threadLabelOptions
            ?.filter((x) => thread.threadLabelIds.includes(x.value))
            .map((x) => (
              <div
                key={x.value}
                className={`w-5 h-1.5 rounded-sm`}
                data-tooltip={x.label}
                style={{ backgroundColor: x.color }}
              ></div>
            ))}
        </div>
      </div>
      <div>
        {!!threadLabelOptions?.length && (
          <>
            <Button
              className="h-auto px-1 opacity-0 group-hover:opacity-100"
              icon={<RiPriceTag3Line />}
              innerRef={ref}

            />
            <Popover placement="right-start" trigger="hover" reference={ref}>
              <div
                className="flex flex-wrap items-baseline gap-2 p-2 cursor-pointer w-72 min-h-14"
                onClick={(e) => e.stopPropagation()}
              >
                {threadLabelOptions.map((x) => {
                  const isSelected = thread.threadLabelIds.includes(x.value);
                  return (
                    <div
                      key={x.value}
                      className={`px-2 py-1 rounded-full ${isSelected ? "hover:opacity-80" : "hover:bg-gray-50"
                        }`}
                      style={{
                        backgroundColor: isSelected ? x.color : "",
                        color: isSelected ? "white" : x.color,
                        border: `1px solid ${x.color}`,
                      }}
                      onClick={() => toggleThreadLabel(x.value)}
                    >
                      {x.label}
                    </div>
                  );
                })}
              </div>
            </Popover>
          </>
        )}
        <div
          className={`w-2 h-2 mt-2 mx-auto shadow-sm rounded-full ${seen ? "opacity-0" : "bg-red"
            }`}
        ></div>
      </div>
    </div>
  );
}

export function ThreadLabelsDialog({
  onItems,
  executeDisabled,
  ...props
}: { onItems: (items) => any, executeDisabled: boolean } & DialogProps) {
  return (
    <Dialog title="Quản lý nhãn" width={450} {...props}>
      <Dialog.Body>
        <DataTable<ThreadLabel> onItems={onItems} limit={0} crudService={ThreadLabelService}>
          <DataTable.Header>
            <DataTable.Title />
            <DataTable.Buttons>
              <DataTable.Button outline isRefreshButton refreshAfterTask />
              <DataTable.Button primary isCreateButton disabled={executeDisabled} />
            </DataTable.Buttons>
          </DataTable.Header>

          {/* <DataTable.Divider />

          <DataTable.Toolbar>
            <DataTable.Search />
            <DataTable.Filter></DataTable.Filter>
          </DataTable.Toolbar> */}

          <DataTable.Consumer>
            {({ items }) => (
              <DataTable.Table className="mt-4">
                <DataTable.Column
                  label="Tên nhãn"
                  width={180}
                  render={(item: ThreadLabel) => (
                    <DataTable.CellText
                      value={
                        <StatusLabel
                          options={items.map((x) => ({ value: x.id, label: x.name }))}
                          value={item.id}
                          style={{
                            backgroundColor: item.color,
                          }}
                        />
                      }
                    />
                  )}
                />
                <DataTable.Column
                  right
                  render={(item: ThreadLabel) => (
                    <>
                      <DataTable.CellButton value={item} isUpdateButton />
                      <DataTable.CellButton hoverDanger value={item} isDeleteButton disabled={executeDisabled} />
                    </>
                  )}
                />
              </DataTable.Table>
            )}
          </DataTable.Consumer>

          <DataTable.Form grid width={400}
            footerProps={{
              submitProps: { disabled: executeDisabled },
              cancelText: "",
            }} >
            <Field name="name" label="Tên nhãn" required>
              <Input autoFocus />
            </Field>
            <Field name="color" label="Màu nhãn" required>
              <Select options={PRODUCT_LABEL_COLORS} hasColor />
            </Field>
          </DataTable.Form>
          {/* <DataTable.Pagination /> */}
        </DataTable>
      </Dialog.Body>
    </Dialog>
  );
}
