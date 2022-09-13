import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { RiChatCheckLine, RiChatDeleteLine } from "react-icons/ri";
import { useShopLayoutContext } from "../../../layouts/shop-layout/providers/shop-layout-provider";
import { validateKeyword } from "../../../lib/constants/validate-keyword";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import {
  ShopComment,
  ShopCommentService,
  ShopTag,
  SHOP_COMMENT_STATUS,
} from "../../../lib/repo/shop-comment.repo";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { ImageDialog } from "../../shared/utilities/dialog/image-dialog";
import { Field } from "../../shared/utilities/form/field";
import { ImageInput } from "../../shared/utilities/form/image-input";
import { Input } from "../../shared/utilities/form/input";
import { Select } from "../../shared/utilities/form/select";
import { Textarea } from "../../shared/utilities/form/textarea";
import { DataTable } from "../../shared/utilities/table/data-table";

export function CommentsPage(props: ReactProps) {
  const toast = useToast();
  const [image, setImage] = useState<string>();
  const { staffPermission } = useAuth();
  const hasExecutePermission = staffPermission("EXECUTE_COMMENTS");
  return (
    <>
      <DataTable<ShopComment> crudService={ShopCommentService} order={{ createdAt: -1 }}>
        <DataTable.Header>
          <ShopPageTitle title="Bình luận" subtitle="Xét duyệt các bình luận của cửa hàng" />
          <DataTable.Buttons>
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
            <DataTable.Button
              primary
              isCreateButton
              className="h-12"
              disabled={!hasExecutePermission}
            />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search className="h-12" />
          <DataTable.Filter>
            <Field name="rating" noError>
              <Select
                className="inline-grid h-12"
                autosize
                clearable
                placeholder="Tất cả đánh giá"
                options={[1, 2, 3, 4, 5].map((rating) => ({
                  value: rating,
                  label: [...Array(rating)].map((x) => "⭐").join(""),
                }))}
              />
            </Field>
            <Field name="status" noError>
              <Select
                className="inline-grid h-12"
                autosize
                clearable
                placeholder="Tất cả trạng thái"
                options={SHOP_COMMENT_STATUS}
              />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <ImageDialog image={image} isOpen={!!image} onClose={() => setImage(null)} />
        <DataTable.Table className="mt-4 bg-white">
          {/* <DataTable.Column
            center
            label="Hình ảnh"
            render={(item: ShopComment) =>
              item.images[0] ? (
                <DataTable.CellImage value={item.images[0]} />
              ) : (
                <DataTable.CellText value={""} />
              )
            }
          /> */}
          <DataTable.Column
            label="Người đăng"
            render={(item: ShopComment) => (
              <DataTable.CellText
                value={
                  <div>
                    <div className="flex text-gray-700">
                      <span className="font-semibold">{item.ownerName}</span>【
                      {item.customerId ? "Khách hàng" : "Cửa hàng"}】
                    </div>
                    <div>{[...Array(item.rating)].map((x) => "⭐").join("")}</div>

                    {item.images.length && (
                      <div className="flex gap-2 mt-0.5">
                        {item.images.map((image) => (
                          <img
                            className="cursor-pointer h-14"
                            src={image}
                            onClick={() => setImage(image)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            )}
          />
          <DataTable.Column
            label="Bình luận"
            render={(item: ShopComment) => (
              <DataTable.CellText
                value={
                  <div>
                    <div className="flex text-gray-700">{item.message}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.tags?.map((tag) => (
                        <span
                          key={tag.name}
                          className="px-2 py-1 text-sm border border-gray-400 rounded-full whitespace-nowrap"
                        >
                          {tag.icon} {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                }
              />
            )}
          />

          <DataTable.Column
            center
            label="Trạng thái"
            render={(item: ShopComment) => (
              <DataTable.CellStatus value={item.status} options={SHOP_COMMENT_STATUS} />
            )}
          />
          <DataTable.Column
            right
            render={(item: ShopComment) => (
              <>
                <DataTable.CellButton
                  value={item}
                  icon={<RiChatCheckLine />}
                  tooltip="Công khai bình luận"
                  disabled={item.status == "PUBLIC" || !hasExecutePermission}
                  refreshAfterTask
                  onClick={async () => {
                    await ShopCommentService.update({ id: item.id, data: { status: "PUBLIC" } })
                      .then((res) => {
                        toast.success("Công khai bình luận thành công");
                      })
                      .catch((err) => {
                        toast.error("Công khai bình luận thất bại", err.message);
                      });
                  }}
                />
                <DataTable.CellButton
                  value={item}
                  icon={<RiChatDeleteLine />}
                  tooltip="Ẩn bình luận"
                  disabled={item.status == "HIDDEN" || !hasExecutePermission}
                  refreshAfterTask
                  onClick={async () => {
                    await ShopCommentService.update({ id: item.id, data: { status: "HIDDEN" } })
                      .then((res) => {
                        toast.success("Ẩn bình luận thành công");
                      })
                      .catch((err) => {
                        toast.error("Ẩn bình luận thất bại", err.message);
                      });
                  }}
                />
                <DataTable.CellButton value={item} isUpdateButton />
                <DataTable.CellButton
                  hoverDanger
                  value={item}
                  isDeleteButton
                  disabled={!hasExecutePermission}
                />
              </>
            )}
          />
        </DataTable.Table>

        <DataTable.Consumer>
          {({ formItem }) => <CommentForm comment={formItem} editComment={!hasExecutePermission} />}
        </DataTable.Consumer>

        <DataTable.Pagination />
      </DataTable>
    </>
  );
}

function CommentForm({
  comment,
  editComment,
}: { comment: ShopComment } & { editComment: boolean }) {
  // const [tags, setTags] = useState<ShopTag[]>([]);

  // useEffect(() => {
  //   setTags(JSON.parse(JSON.stringify(comment?.tags || [])));
  // }, [comment]);

  return (
    <DataTable.Form
      minWidth={700}
      extraDialogClass="bg-transparent"
      extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
      extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
      footerProps={{
        className: "justify-center",
        submitProps: { className: "h-14 w-64", disabled: editComment },
        cancelText: "",
      }}
      grid
      beforeSubmit={(data) => ({
        ...data,
        status: comment?.id ? undefined : "PUBLIC",
        // tags: tags.map((x) => ({ name: x.name, icon: x.icon, qty: x.qty })),
      })}
    >
      <Field
        name="ownerName"
        label="Tên người bình luận"
        cols={7}
        required
        validation={{ owerNameValid: (val) => validateKeyword(val) }}
      >
        <Input />
      </Field>
      <Field name="rating" label="Đánh giá" cols={5} required>
        <Select
          options={[1, 2, 3, 4, 5].map((star) => ({
            value: star,
            label: [...Array(star)].map((x) => "⭐").join(""),
          }))}
          defaultValue={5}
        />
      </Field>
      <Field
        name="message"
        label="Nội dung bình luận"
        cols={12}
        required
        validation={{ messageValid: (val) => validateKeyword(val) }}
      >
        <Textarea />
      </Field>
      <Field name="images" label="Danh sách hình ảnh" cols={12}>
        <ImageInput multi />
      </Field>
      <TagsFields />
    </DataTable.Form>
  );
}

function TagsFields() {
  const { shopConfig } = useShopLayoutContext();
  const { watch, register, setValue } = useFormContext();
  const tags: ShopTag[] = watch("tags");
  register("tags", {
    value: [],
  });

  return (
    <div className="flex flex-wrap col-span-12 gap-2 mb-4">
      {shopConfig.tags.map((tag) => (
        <span
          key={tag.name}
          className={`block whitespace-nowrap rounded-full border text-sm py-2 px-4 mb-1 cursor-pointer ${tags?.find((x) => x.name == tag.name)
            ? "text-white bg-primary border-primary hover:bg-primary-dark hover:border-primary-dark"
            : "text-gray-700 bg-white border-gray-400 hover:bg-primary-light hover:border-primary"
            }`}
          onClick={() => {
            let index = tags.findIndex((x) => x.name == tag.name);
            if (index >= 0) {
              tags.splice(index, 1);
            } else {
              tags.push(tag);
            }
            setValue("tags", [...tags]);
          }}
        >
          {tag.icon} {tag.name}
        </span>
      ))}
    </div>
  );
}
