import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RiEyeLine } from "react-icons/ri";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import {
  SupportTicket,
  SupportTicketService,
  SUPTICKET_STATUS,
  SUPTICKET_SUBSTATUS,
} from "../../../lib/repo/support-ticket.repo";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Field } from "../../shared/utilities/form/field";
import { Form } from "../../shared/utilities/form/form";
import { ImageInput } from "../../shared/utilities/form/image-input";
import { Input } from "../../shared/utilities/form/input";
import { Textarea } from "../../shared/utilities/form/textarea";
import { DataTable } from "../../shared/utilities/table/data-table";
import { SupportTicketSlideout } from "./components/support-ticket-slideout";

export function SupportTicketPage(props: ReactProps) {
  const [supportTicketId, setSupportTicketId] = useState("");
  const router = useRouter();
  const toast = useToast();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_TICKETS");
  const [needInfo, setNeedInfo] = useState<SupportTicket>(null);
  const [cancelSup, setCancelSup] = useState<SupportTicket>(null);
  useEffect(() => {
    if (router.query["id"]) {
      setSupportTicketId(router.query["id"] as string);
    } else {
      setSupportTicketId(undefined);
    }
  }, [router.query]);
  return (
    <>
      <DataTable<SupportTicket>
        crudService={SupportTicketService}
        order={{ createdAt: -1 }}
        fragment={SupportTicketService.fullFragment}
        updateItem={(item) => router.replace({ pathname: router.pathname, query: { id: item.id } })}
      >
        <DataTable.Header>
          <ShopPageTitle title="Yêu cầu hỗ trợ" subtitle="Danh sách yêu cầu hỗ trợ" />
          <DataTable.Buttons>
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
            <DataTable.Button primary isCreateButton className="h-12" text={"Tạo yêu cầu hỗ trợ"} disabled={!hasWritePermission} />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search className="h-12" />
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4 bg-white">
          <DataTable.Column
            label="Ngày tạo"
            orderBy="createdAt"
            render={(item: SupportTicket) => <DataTable.CellDate value={item.createdAt} />}
          />

          <DataTable.Column
            label="Yêu cầu hỗ trợ"
            className="max-w-xs"
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
                value={item.subStatus}
                type="text"
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
                <DataTable.CellButton hoverDanger value={item} isDeleteButton disabled={!hasWritePermission} />
                <DataTable.CellButton
                  hoverInfo
                  value={item}
                  moreItems={[
                    {
                      text: "Bổ sung thông tin",
                      disabled: item.subStatus !== "request_more_info",
                      onClick: async () => {
                        hasWritePermission ?
                          setNeedInfo(item)
                          : toast.info("Bạn không có quyền thực hiện thao tác này");
                      },
                    },
                    {
                      text: "Hủy yêu cầu",
                      disabled: item.status == "closed",
                      onClick: async () => {
                        hasWritePermission ?
                          setCancelSup(item)
                          : toast.info("Bạn không có quyền thực hiện thao tác này");
                      },
                    },
                  ]}
                />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />
        <DataTable.Consumer>
          {({ loadAll }) => (
            <>
              <SupportTicketSlideout
                supportTicketId={supportTicketId}
                loadAll={loadAll}
                isOpen={!!supportTicketId}
                onClose={() => {
                  router.replace({ pathname: router.pathname, query: {} });
                }}
                executeDisabled={!hasWritePermission}
              />
              <DataTable.Form grid>
                <Field name="name" required label="Tên yêu cầu" cols={12}>
                  <Input></Input>
                </Field>

                <Field name="desc" label="Nội dung" cols={12} required>
                  <Textarea />
                </Field>
                <Field name="images" label="Danh sách hình ảnh" cols={12}>
                  <ImageInput multi />
                </Field>
              </DataTable.Form>
              <Form
                title={
                  needInfo
                    ? "Bổ sung thông tin cho yêu cầu " + needInfo?.code
                    : "Lý do hủy yêu cầu " + cancelSup?.code
                }
                isOpen={!!needInfo || !!cancelSup}
                onClose={() => {
                  setNeedInfo(null);
                  setCancelSup(null);
                }}
                dialog
                onSubmit={async (data) => {
                  if (needInfo) {
                    try {
                      await SupportTicketService.submitInfoSupportTicket(needInfo.id, data);
                      toast.success("Bổ sung thông tin thành công");
                      setNeedInfo(null);
                      loadAll(true);
                    } catch (error) {
                      toast.error("Bổ sung thông tin thất bại " + error);
                    }
                  } else {
                    try {
                      await SupportTicketService.cancelSupportTicket(cancelSup.id, data);
                      toast.success("Hủy yêu cầu hỗ trợ thành công");
                      setCancelSup(null);
                      loadAll(true);
                    } catch (error) {
                      toast.error("Hủy yêu cầu hỗ trợ thất bại " + error);
                    }
                  }
                }}
              >
                <Field name="message" label="Nội dung" required cols={12}>
                  <Textarea></Textarea>
                </Field>
                <Field name="images" label="Danh sách hình ảnh" cols={12}>
                  <ImageInput multi />
                </Field>
                <Form.Footer submitText="Xác nhận" />
              </Form>
            </>
          )}
        </DataTable.Consumer>
      </DataTable>
    </>
  );
}
