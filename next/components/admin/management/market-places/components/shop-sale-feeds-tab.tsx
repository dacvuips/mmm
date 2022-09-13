import React, { useState } from "react";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../../../../../lib/providers/auth-provider";
import { useToast } from "../../../../../lib/providers/toast-provider";
import {
  ShopSaleFeedGroup,
  ShopSaleFeedGroupService,
} from "../../../../../lib/repo/shop-sale-feed-group.repo";
import {
  APPROVAL_STATUSES,
  MARKET_PLACE_STATUSES,
  ShopSaleFeed,
  ShopSaleFeedService,
} from "../../../../../lib/repo/shop-sale-feed.repo";
import { Field, Form, Input, Select } from "../../../../shared/utilities/form";
import { List } from "../../../../shared/utilities/list";
import { DataTable } from "../../../../shared/utilities/table/data-table";

type Props = {};

export function ShopSaleFeedsTab({ }: Props) {
  const [selectedSalesFeedGroup, setSelectedSalesFeedGroup] = useState<ShopSaleFeedGroup>();
  const { adminPermission } = useAuth();
  const hasWritePermission = adminPermission("WRITE_FEEDS");
  const toast = useToast();
  return (
    <>
      <DataTable
        crudService={ShopSaleFeedService}
        order={{ createdAt: -1 }}
        filter={{ shopSaleFeedGroupId: selectedSalesFeedGroup?.id }}
      >
        <div className="flex gap-x-3">
          <DataTable.Consumer>
            {({ loadAll }) => (
              <List<ShopSaleFeedGroup>
                saveDisabled={!hasWritePermission}
                deleteDisabled={!hasWritePermission}
                displayName="Danh mục tag"
                className="w-56"
                crudService={ShopSaleFeedGroupService}
                selectedItem={selectedSalesFeedGroup}
                onSelect={(item) => setSelectedSalesFeedGroup(item)}
                onChange={() => {
                  loadAll(true);
                }}
                renderItem={(item, selected) => (
                  <>
                    <div
                      className={`font-semibold text-sm ${selected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        }`}
                    >
                      {item.name || "Tất cả"}
                    </div>
                  </>
                )}
              >
                <List.Form>
                  <Field name="name" label={"Tên Tag nhóm bài "} required cols={12}>
                    <Input autoFocus />
                  </Field>
                </List.Form>
              </List>
            )}
          </DataTable.Consumer>
          <div className="flex-1">
            <DataTable.Header>
              <DataTable.Toolbar>
                <DataTable.Search />
                <DataTable.Filter>
                  <Field name="approvalStatus" noError>
                    <Select
                      placeholder={"Lọc trạng thái"}
                      clearable
                      autosize
                      options={APPROVAL_STATUSES}
                    />
                  </Field>
                </DataTable.Filter>
              </DataTable.Toolbar>
              <div className="flex gap-x-2">
                <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white" />
              </div>
            </DataTable.Header>
            <DataTable.Table className="mt-4 bg-white">
              <DataTable.Column
                label={"Tiêu đề bài đăng"}
                render={(item: ShopSaleFeed) => (
                  <DataTable.CellText
                    image={item.featureImage}
                    imageClassName="w-16"
                    value={item.name}
                    className="max-w-xs text-ellipsis-2"
                  />
                )}
              />
              <DataTable.Column
                label={"Mô tả ngắn"}
                width={300}
                render={(item: ShopSaleFeed) => (
                  <DataTable.CellText value={item.snippet} className="text-ellipsis-2" />
                )}
              />
              <DataTable.Column
                label={"Trạng thái"}
                center
                render={(item: ShopSaleFeed) => (
                  <DataTable.CellStatus value={item.approvalStatus} options={APPROVAL_STATUSES} />
                )}
              />
              <DataTable.Column
                label={"Ngày tạo"}
                center
                render={(item: ShopSaleFeed) => <DataTable.CellDate value={item.createdAt} />}
              />
              <DataTable.Column
                right
                render={(item: ShopSaleFeed) => (
                  <>
                    <DataTable.CellButton
                      value={item}
                      icon={<AiOutlineCheck />}
                      tooltip="Phê duyệt"
                      disabled={item.approvalStatus == "APPROVED"}
                      refreshAfterTask
                      onClick={async () => {
                        if (hasWritePermission) {
                          const { id } = item;
                          try {
                            await ShopSaleFeedService.approvalShopSaleFeed(id, "APPROVED").then(
                              (res) => {
                                toast.success("Phê duyệt bài thành công");
                              }
                            );
                          } catch (error) {
                            toast.error(error.message);
                          }

                        } else {
                          toast.info("Bạn không có quyền thực hiện thao tác này");
                        }

                      }}
                    />
                    <DataTable.CellButton
                      value={item}
                      icon={<AiOutlineClose />}
                      tooltip="Từ chối"
                      disabled={
                        item.approvalStatus == "REJECTED" || item.approvalStatus == "APPROVED"
                      }
                      refreshAfterTask
                      onClick={async () => {
                        if (hasWritePermission) {
                          const { id } = item;
                          try {
                            await ShopSaleFeedService.approvalShopSaleFeed(id, "REJECTED").then(
                              (res) => {
                                toast.success("Từ chối phê duyệt thành công");
                              }
                            );
                          } catch (error) {
                            toast.error(error.message);
                          }

                        } else {
                          toast.info("Bạn không có quyền từ chối bài viết")
                        }

                      }}
                    />
                    <DataTable.CellButton value={item} isUpdateButton />
                  </>
                )}
              />
            </DataTable.Table>
            <DataTable.Pagination />
          </div>
        </div>
        <DataTable.Consumer>
          {({ formItem, setFormItem, loadAll }) => (
            <Form
              dialog
              defaultValues={formItem}
              grid
              width={600}
              isOpen={formItem ? true : false}
              onClose={() => setFormItem(null)}
              title="Cập nhập nhóm khuyến mãi cửa hàng"
              onSubmit={async (values) => {
                const { id } = formItem;
                try {
                  await ShopSaleFeedService.updateShopSaleFeedAdmin(
                    id,
                    values.shopSaleFeedGroupId
                  ).then((res) => {
                    setFormItem(null);
                    toast.success("Cập nhập nhóm tag thành công");
                    loadAll();
                  });
                } catch (error) {
                  toast.error(error.message);
                }
              }}

            >
              <Field label="Tiều đề bài đăng" name="name" cols={6} readOnly>
                <Input autoFocus />
              </Field>

              <Field label="Trạng thái" name="active" cols={6} readOnly>
                <Select options={MARKET_PLACE_STATUSES} />
              </Field>

              <Field label="Hiển thị trên market place" name="showOnMarketPlace" cols={6} readOnly>
                <Select options={MARKET_PLACE_STATUSES} />
              </Field>
              <Field label="Trạng thái duyệt" name="approvalStatus" cols={6} readOnly>
                <Select options={APPROVAL_STATUSES} />
              </Field>
              <Field label="Tag nhóm bài đăng" name="shopSaleFeedGroupId" cols={6}>
                <Select optionsPromise={() => ShopSaleFeedGroupService.getAllOptionsPromise()} />
              </Field>
              <Form.Footer
                submitProps={{
                  disabled: !hasWritePermission,
                }}
              />
            </Form>
          )}
        </DataTable.Consumer>
      </DataTable>
    </>
  );
}
