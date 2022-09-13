import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { POST_STATUSES, ShopPost, ShopPostService } from "../../../../lib/repo/shop-post.repo";
import { ShopTopicService } from "../../../../lib/repo/shop-topic.repo";
import { Slideout, SlideoutProps } from "../../../shared/utilities/dialog/slideout";
import {
  Button,
  Editor,
  Field,
  Form,
  ImageInput,
  Input,
  Select,
  Textarea,
} from "../../../shared/utilities/form";
import { Spinner } from "../../../shared/utilities/misc";

interface Props extends SlideoutProps {
  shopPostId: string;
  loadAll: () => Promise<any>;
}

export function ShopPostSlideout({ shopPostId, loadAll, ...props }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [shopPost, setShopPost] = useState<Partial<ShopPost>>(null);
  const toast = useToast();
  const [selectedLocale, setSelectedLocale] = useState("vi");
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_POSTS");

  useEffect(() => {
    if (shopPostId !== null) {
      if (shopPostId) {
        ShopPostService.getOne({ id: shopPostId }).then((res) => {
          setShopPost(res);
        });
      } else {
        setShopPost({});
      }
    } else {
      setShopPost(null);
    }
  }, [shopPostId]);

  const onSubmit = async (data) => {
    if (!data.title) {
      toast.info(null, t("Bắt buộc nhập tiêu đề bài viết."));
      return;
    }
    await ShopPostService.createOrUpdate({ id: shopPost.id, data: { ...data } })
      .then((res) => {
        toast.success(`${shopPost.id ? t("Cập nhật") : t("Tạo")} ${t("bài viết thành công")}`);
        loadAll();
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          `${shopPost.id ? t("Cập nhật") : t("Tạo")} ${t("bài viết thất bại")}. ${err.message}`
        );
      });
  };

  const onClose = () => router.replace({ pathname: location.pathname, query: {} });

  return (
    <Slideout isOpen={shopPostId !== null} onClose={onClose}>
      {!shopPost ? (
        <Spinner />
      ) : (
        <Form className="flex h-full" defaultValues={shopPost} onSubmit={onSubmit}>
          <div className="flex-1 w-screen max-w-screen-lg p-10 v-scrollbar">
            <Field
              name="title"
              locale={selectedLocale}
              validation={{ titleValid: (val) => validateKeyword(val) }}
            >
              <Textarea
                controlClassName=""
                rows={1}
                className="text-3xl font-semibold text-gray-700 border-0 shadow-none resize-none no-scrollbar"
                placeholder={`(${t("Tiêu đề bài viết")})`}
              />
            </Field>
            <Field
              name="content"
              locale={selectedLocale}
              validation={{ contentValid: (val) => validateKeyword(val) }}
            >
              <Editor
                minHeight="calc(100vh - 150px)"
                noBorder
                controlClassName=""
                className="bg-transparent border-0"
                maxWidth="none"
                placeholder={t("Nội dung bài viết")}
              />
            </Field>
          </div>
          <div className="flex flex-col w-full max-w-xs border-l border-gray-300 bg-gray-50">
            <div className="p-4 v-scrollbar" style={{ height: "calc(100% - 64px)" }}>
              <Field name="featureImage" label={t("Hình đại diện")}>
                <ImageInput largeImage ratio169 placeholder={t("Tỉ lệ 16:9")} />
              </Field>
              <Field
                name="excerpt"
                label={t("Mô tả ngắn bài viết")}
                locale={selectedLocale}
                validation={{ excerptValid: (val) => validateKeyword(val) }}
              >
                <Textarea placeholder={t("Nên để khoảng 280 ký tự")} />
              </Field>
              <Field
                name="slug"
                label={t("Slug bài viết")}
                tooltip={t(
                  "common:Chỉ cho phép chữ, số và dấu gạch ngang, không có khoảng trắng.Ví dụ: bai-viet-123"
                )}
                validation={{ code: true }}
              >
                <Input placeholder={`(${t("Tự tạo nếu để trống")})`} />
              </Field>
              <Field name="priority" label={t("Ưu tiên bài viết")}>
                <Input number placeholder={t("Ưu tiên cao sẽ hiện lên đầu.")} />
              </Field>
              <Field name="topicIds" label={t("Chọn chủ đề")}>
                <Select
                  multi
                  clearable={false}
                  placeholder="Chọn chủ đề"
                  createablePromise={() => ShopTopicService.getAllCreatablePromise()}
                />
              </Field>
              <Field name="status" label={t("Trạng thái")}>
                <Select
                  placeholder={t("Chọn trạng thái")}
                  options={POST_STATUSES}
                  defaultValue="DRAFT"
                />
              </Field>
            </div>
            <FooterButtons
              onClose={onClose}
              shopPost={shopPost}
              disabledEditPost={!hasWritePermission}
            />
          </div>
        </Form>
      )}
    </Slideout>
  );
}

function FooterButtons({ onClose, shopPost, disabledEditPost }) {
  const { t } = useTranslation();
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <>
      <div className="flex items-center h-16 px-4 mt-auto border-t border-gray-300 gap-x-2">
        <Button outline text={t("Đóng")} onClick={onClose} />
        <Button
          submit
          className="flex-1"
          primary
          isLoading={isSubmitting}
          text={`${shopPost.id ? t("Cập nhật") : t("Tạo")} ${t("bài viết")}`}
          disabled={disabledEditPost}
        />
      </div>
    </>
  );
}
