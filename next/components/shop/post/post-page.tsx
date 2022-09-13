import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { validateKeyword } from "../../../lib/constants/validate-keyword";
import { useAuth } from "../../../lib/providers/auth-provider";
import { POST_STATUSES } from "../../../lib/repo/post.repo";
import { ShopPost, ShopPostService } from "../../../lib/repo/shop-post.repo";
import { ShopTopic, ShopTopicService } from "../../../lib/repo/shop-topic.repo";
import { Field } from "../../shared/utilities/form/field";
import { ImageInput } from "../../shared/utilities/form/image-input";
import { Input } from "../../shared/utilities/form/input";
import { Select } from "../../shared/utilities/form/select";
import { List } from "../../shared/utilities/list";
import { Card } from "../../shared/utilities/misc";
import { DataTable } from "../../shared/utilities/table/data-table";
import { ShopPostSlideout } from "./components/post-slideout";

export function ShopPostPage(props) {
  const [shopPostId, setShopPostId] = useState(null);
  const [selectedShopTopic, setSelectedShopTopic] = useState<ShopTopic>();
  const router = useRouter();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_POSTS");

  useEffect(() => {
    if (router.query["create"]) {
      setShopPostId("");
    } else if (router.query["id"]) {
      setShopPostId(router.query["id"]);
    } else {
      setShopPostId(null);
    }
  }, [router.query]);

  return (
    <Card>
      <DataTable<ShopPost>
        crudService={ShopPostService}
        order={{ createdAt: -1 }}
        fragment={ShopPostService.fullFragment}
        filter={{ topicIds: selectedShopTopic?.id }}
        createItem={() => router.replace({ pathname: location.pathname, query: { create: true } })}
        updateItem={(item) =>
          router.replace({ pathname: location.pathname, query: { id: item.id } })
        }
      >
        <div className="flex gap-x-3">
          <div className="w-72">
            <DataTable.Consumer>
              {({ loadAll }) => (
                <List<ShopTopic>
                  deleteDisabled={!hasWritePermission}
                  saveDisabled={!hasWritePermission}
                  crudService={ShopTopicService}
                  selectedItem={selectedShopTopic}
                  onSelect={(item) => setSelectedShopTopic(item)}
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
                      <div className="text-xs text-gray-600">
                        {item.slug || "Lọc theo tất cả chủ đề"}
                      </div>
                    </>
                  )}
                >
                  <List.Form>
                    <Field
                      name="name"
                      label="Tên chủ đề"
                      required
                      cols={6}
                      validation={{ nameValid: (val) => validateKeyword(val) }}
                    >
                      <Input autoFocus />
                    </Field>
                    <Field name="slug" label="Slug" required cols={6} validation={{ slug: true }}>
                      <Input />
                    </Field>
                    <Field name="image" label="Hình" cols={12}>
                      <ImageInput />
                    </Field>
                    <Field
                      name="group"
                      label="Mã Nhóm"
                      cols={12}
                      validation={{ groupValid: (val) => validateKeyword(val) }}
                    >
                      <Input />
                    </Field>
                  </List.Form>
                </List>
              )}
            </DataTable.Consumer>
          </div>
          <div className="flex-1">
            <DataTable.Header>
              <DataTable.Toolbar>
                <DataTable.Search />
                <DataTable.Filter>
                  <Field name="status" noError>
                    <Select
                      placeholder="Lọc trạng thái"
                      clearable
                      autosize
                      options={POST_STATUSES}
                    />
                  </Field>
                </DataTable.Filter>
              </DataTable.Toolbar>
              <div className="flex gap-x-2">
                <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white" />
                <DataTable.Button primary isCreateButton disabled={!hasWritePermission} />
              </div>
            </DataTable.Header>
            <DataTable.Table className="mt-4 bg-white">
              <DataTable.Column
                label="Ảnh"
                center
                render={(item: ShopPost) => (
                  <DataTable.CellImage value={item.featureImage} center />
                )}
              />
              <DataTable.Column
                label="Tiêu đề bài đăng"
                center
                render={(item: ShopPost) => (
                  <DataTable.CellText value={item.title} className="max-w-xs text-ellipsis-2" />
                )}
              />
              <DataTable.Column
                label="Chủ đề"
                center
                render={(item: ShopPost) => (
                  <DataTable.CellText value={item.topics?.map((item) => item.name).join(", ")} />
                )}
              />
              <DataTable.Column
                label="Trạng thái"
                center
                render={(item: ShopPost) => (
                  <DataTable.CellStatus value={item.status} options={POST_STATUSES} />
                )}
              />
              <DataTable.Column
                label="Ngày tạo"
                center
                render={(item: ShopPost) => <DataTable.CellDate value={item.createdAt} />}
              />

              {/* <DataTable.Column
                label="Ngày chỉnh sửa"
                center
                render={(item: ShopPost) => <DataTable.CellDate value={item.updatedAt} />}
              /> */}
              <DataTable.Column
                right
                render={(item: ShopPost) => (
                  <>
                    <DataTable.CellButton value={item} isUpdateButton />
                    <DataTable.CellButton
                      value={item}
                      isDeleteButton
                      disabled={!hasWritePermission}
                    />
                  </>
                )}
              />
            </DataTable.Table>
            <DataTable.Pagination />
          </div>
        </div>
        <DataTable.Consumer>
          {({ loadAll }) => (
            <>
              <ShopPostSlideout loadAll={loadAll} shopPostId={shopPostId} />
            </>
          )}
        </DataTable.Consumer>
      </DataTable>
    </Card>
  );
}
