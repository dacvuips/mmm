import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { Post, PostService, POST_STATUSES } from "../../../../lib/repo/post.repo";
import { Topic, TopicService } from "../../../../lib/repo/topic.repo";
import { ImageInput, Input } from "../../../shared/utilities/form";
import { Field } from "../../../shared/utilities/form/field";
import { Select } from "../../../shared/utilities/form/select";
import { List } from "../../../shared/utilities/list";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { PostSlideout } from "./components/post-slideout";

export function PostsPage() {
  const { t } = useTranslation();
  const [postId, setPostId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic>();
  const { adminPermission } = useAuth();
  const hasWritePermission = adminPermission("WRITE_POSTS");
  const router = useRouter();
  useEffect(() => {
    if (router.query["create"]) {
      setPostId("");
    } else if (router.query["id"]) {
      setPostId(router.query["id"]);
    } else {
      setPostId(null);
    }
  }, [router.query]);

  return (
    <Card>
      <DataTable<Post>
        crudService={PostService}
        order={{ createdAt: -1 }}
        filter={{ topicIds: selectedTopic?.id }}
        createItem={() => router.replace({ pathname: location.pathname, query: { create: true } })}
        updateItem={(item) =>
          router.replace({ pathname: location.pathname, query: { id: item.id } })
        }
      >
        <div className="flex gap-x-3">
          <DataTable.Consumer>
            {({ loadAll }) => (
              <List<Topic>
                saveDisabled={!hasWritePermission}
                deleteDisabled={!hasWritePermission}
                className="w-56"
                crudService={TopicService}
                selectedItem={selectedTopic}
                onSelect={(item) => setSelectedTopic(item)}
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
                      {item.slug || t("Lọc theo tất cả chủ đề")}
                    </div>
                  </>
                )}
              >
                <List.Form>
                  <Field
                    name="name"
                    label={t("Tên chủ đề")}
                    required
                    cols={6}
                    validation={{ nameValid: (val) => validateKeyword(val) }}
                  >
                    <Input autoFocus />
                  </Field>
                  <Field name="slug" label="Slug" required cols={6} validation={{ slug: true }}>
                    <Input />
                  </Field>
                  <Field name="image" label={t("Hình")}>
                    <ImageInput />
                  </Field>
                  <Field
                    name="group"
                    label={t("Mã nhóm")}
                    validation={{ groupValid: (val) => validateKeyword(val) }}
                  >
                    <Input />
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
                  <Field name="status" noError>
                    <Select
                      placeholder={t("Lọc trạng thái")}
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
                label={t("Tiêu đề bài đăng")}
                render={(item: Post) => (
                  <DataTable.CellText
                    image={item.featureImage}
                    imageClassName="w-16"
                    value={item.title}
                    className="max-w-xs text-ellipsis-2"
                  />
                )}
              />
              <DataTable.Column
                label={t("Chủ đề")}
                center
                render={(item: Post) => (
                  <DataTable.CellText value={item.topics?.map((item) => item.name, "")} />
                )}
              />
              <DataTable.Column
                label={t("Trạng thái")}
                center
                render={(item: Post) => (
                  <DataTable.CellStatus value={item.status} options={POST_STATUSES} />
                )}
              />
              <DataTable.Column
                label={t("Ngày tạo")}
                center
                render={(item: Post) => <DataTable.CellDate value={item.createdAt} />}
              />
              <DataTable.Column
                right
                render={(item: Post) => (
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
          {({ formItem, loadAll }) => (
            <>
              <PostSlideout loadAll={loadAll} postId={postId} editDisabled={!hasWritePermission} />
            </>
          )}
        </DataTable.Consumer>
      </DataTable>
    </Card>
  );
}
