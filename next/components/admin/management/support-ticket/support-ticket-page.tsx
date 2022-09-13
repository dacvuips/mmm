import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { RiEyeLine } from "react-icons/ri";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { MemberService } from "../../../../lib/repo/member.repo";
import {
  SupportTicket,
  SupportTicketService,
  SUPTICKET_STATUS,
  SUPTICKET_SUBSTATUS,
} from "../../../../lib/repo/support-ticket.repo";
import { UserService } from "../../../../lib/repo/user.repo";
import {
  Field,
  Form,
  FormProps,
  ImageInput,
  Select,
  Textarea,
} from "../../../shared/utilities/form";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { SupportTicketSlideout } from "../../../shop/support-ticket/components/support-ticket-slideout";

export function SupportTicketPage(props: ReactProps) {
  const [supportTicketId, setSupportTicketId] = useState("");
  const { user, adminPermission } = useAuth();
  const router = useRouter();

  const hasExecutePermission = adminPermission("EXECUTE_TICKETS");
  const [openActionForm, setOpenActionForm] = useState<{
    type: "info" | "cancel" | "consider" | "complete";
    supportTicket: SupportTicket;
  }>();
  const [openReassignForm, setOpenReassignForm] = useState<SupportTicket>();
  useEffect(() => {
    if (router.query["id"]) {
      setSupportTicketId(router.query["id"] as string);
    } else {
      setSupportTicketId(undefined);
    }
  }, [router.query]);
  return (
    <Card>
      <DataTable<SupportTicket>
        crudService={SupportTicketService}
        order={{ createdAt: -1 }}
        fragment={SupportTicketService.fullFragment}
        updateItem={(item) =>
          router.replace({ pathname: location.pathname, query: { id: item.id } })
        }
      >
        <DataTable.Header>
          <DataTable.Title subtitle="Danh sách yêu cầu hỗ trợ">Yêu cầu hỗ trợ</DataTable.Title>
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton refreshAfterTask />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            <Field name="memberId" noError>
              <Select
                autosize
                clearable
                placeholder="Tất cả cửa hàng"
                autocompletePromise={({ id, search }) =>
                  MemberService.getAllAutocompletePromise(
                    { id, search },
                    {
                      fragment: "id shopName shopLogo",
                      parseOption: (data) => ({
                        value: data.id,
                        label: data.shopName,
                        image: data.shopLogo,
                      }),
                    }
                  )
                }
              />
            </Field>
            <Field name="status" noError>
              <Select
                autosize
                clearable
                placeholder="Tất cả trạng thái"
                options={SUPTICKET_STATUS}
              />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4 bg-white">
          <DataTable.Column
            label="Ngày tạo"
            orderBy="createdAt"
            render={(item: SupportTicket) => <DataTable.CellDate value={item.createdAt} />}
          />
          <DataTable.Column
            label="Cửa hàng"
            orderBy="createdAt"
            render={(item: SupportTicket) => <DataTable.CellText value={item.member?.shopName} />}
          />
          <DataTable.Column
            label="Yêu cầu hỗ trợ"
            className="max-w-lg"
            render={(item: SupportTicket) => (
              <DataTable.CellText className="font-semibold" value={item.name} subText={item.desc} />
            )}
          />
          <DataTable.Column
            center
            label="Trạng thái"
            render={(item: SupportTicket) => (
              <DataTable.CellStatus value={item.status} options={SUPTICKET_STATUS} />
            )}
          />
          <DataTable.Column
            center
            label="Chi tiết trạng thái"
            render={(item: SupportTicket) => (
              <DataTable.CellStatus
                type="text"
                value={item.subStatus}
                options={SUPTICKET_SUBSTATUS}
              />
            )}
          />
          <DataTable.Column
            center
            label="Người đang xem xét"
            render={(item: SupportTicket) => <DataTable.CellText value={item.assigner?.name} />}
          />
          <DataTable.Column
            right
            render={(item: SupportTicket) => (
              <>
                <DataTable.CellButton value={item} isUpdateButton icon={<RiEyeLine />} />
                {hasExecutePermission && (
                  <>
                    <DataTable.CellButton hoverDanger value={item} isDeleteButton />
                    <DataTable.CellButton
                      hoverInfo
                      value={item}
                      moreItems={[
                        {
                          text: "Chuyển yêu cầu đến",
                          disabled: item.status != "opening",
                          onClick: async () => {
                            setOpenReassignForm(item);
                          },
                        },
                        {
                          text: "Xác nhận xem xét yêu cầu",
                          disabled: user.id != item.assignerId || item.status == "closed",
                          onClick: async () => {
                            setOpenActionForm({
                              type: "consider",
                              supportTicket: item,
                            });
                          },
                        },
                        {
                          text: "Yêu cầu bổ sung thông tin",
                          disabled: item.status == "closed",
                          onClick: async () => {
                            setOpenActionForm({
                              type: "info",
                              supportTicket: item,
                            });
                          },
                        },
                        {
                          text: "Hoàn thành yêu cầu hỗ trợ",
                          disabled: item.status == "closed",
                          onClick: async () => {
                            setOpenActionForm({
                              type: "complete",
                              supportTicket: item,
                            });
                          },
                        },
                        {
                          text: "Hủy yêu cầu",
                          disabled: item.status == "closed",
                          onClick: async () => {
                            setOpenActionForm({
                              type: "cancel",
                              supportTicket: item,
                            });
                          },
                        },
                      ]}
                    />
                  </>
                )}
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Consumer>
          {({ loadAll }) => (
            <>
              <ActionForm
                isOpen={!!openActionForm}
                onClose={() => {
                  setOpenActionForm(null);
                }}
                supportTicket={openActionForm?.supportTicket}
                type={openActionForm?.type}
                onChange={() => loadAll(true)}
              />
              <ReassignForm
                isOpen={!!openReassignForm}
                onClose={() => setOpenReassignForm(null)}
                supportTicket={openReassignForm}
                onChange={() => loadAll(true)}
              />
              <SupportTicketSlideout
                supportTicketId={supportTicketId}
                loadAll={loadAll}
                isOpen={!!supportTicketId}
                onClose={() => {
                  router.replace({ pathname: router.pathname, query: {} });
                }}
                executeDisabled={!hasExecutePermission}
              />
            </>
          )}
        </DataTable.Consumer>
        <DataTable.Pagination />
      </DataTable>
    </Card>
  );
}

function ActionForm({
  supportTicket,
  type,
  onChange,
  ...props
}: {
  supportTicket: SupportTicket;
  type: "info" | "cancel" | "consider" | "complete";
  onChange;
} & FormProps) {
  const toast = useToast();
  const title = useMemo(() => {
    switch (type) {
      case "consider":
        return "Xác nhận xem xét yêu cầu";
      case "info":
        return "Yêu cầu thêm thông tin";
      case "cancel":
        return "Hủy yêu cầu";
      case "complete":
        return "Hoàn thành yêu cầu";
    }
  }, [type]);

  return (
    <Form
      {...props}
      title={title}
      dialog
      onSubmit={async (data) => {
        try {
          switch (type) {
            case "consider": {
              await SupportTicketService.considerSupportTicket(supportTicket.id, data);
              break;
            }
            case "cancel": {
              await SupportTicketService.cancelSupportTicket(supportTicket.id, data);
              break;
            }
            case "info": {
              await SupportTicketService.requestInfoSupportTicket(supportTicket.id, data);
              break;
            }
            case "complete": {
              await SupportTicketService.completeSupportTicket(supportTicket.id, data);
              break;
            }
          }
          toast.success(`${title} thành công`);
          props.onClose();
          onChange();
        } catch (err) {
          toast.error(`${title} thất bại. ${err.message}`);
        }
      }}
    >
      <Field name="message" label="Nội dung" required>
        <Textarea />
      </Field>
      <Field name="images" label="Hình ảnh">
        <ImageInput multi />
      </Field>
      <Form.Footer />
    </Form>
  );
}

function ReassignForm({
  supportTicket,
  onChange,
  ...props
}: { supportTicket: SupportTicket; onChange } & FormProps) {
  const toast = useToast();
  return (
    <Form
      {...props}
      title={"Chuyển người hỗ trợ"}
      dialog
      onSubmit={async (data) => {
        try {
          await SupportTicketService.assignSupportTicket(supportTicket.id, data.asignerId, {
            message: data.message,
            images: data.images,
          });
          toast.success("Chuyển người thành công");
          props.onClose();
          onChange();
        } catch (error) {
          toast.error("Chuyển người thất bại " + error);
        }
      }}
    >
      <Field name="asignerId" label="Người sẽ nhận yêu cầu hỗ trợ" required>
        <Select
          autocompletePromise={(props) => UserService.getAllAutocompletePromise(props)}
        ></Select>
      </Field>
      <Field name="message" label="Nội dung" required>
        <Textarea />
      </Field>
      <Field name="images" label="Hình ảnh">
        <ImageInput multi />
      </Field>
      <Form.Footer />
    </Form>
  );
}
