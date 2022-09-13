import { useCrud } from "../../../lib/hooks/useCrud";
import { PostService } from "../../../lib/repo/post.repo";
import { Button } from "../../shared/utilities/form";
import { Img, NotFound, Spinner } from "../../shared/utilities/misc";

export function AcademyPage() {
  const { items, loading } = useCrud(PostService, {
    filter: {
      topicIds: { $in: "61de411858339e001d01fbfd" },
    },
  });

  if (!items || loading) return <Spinner />;

  return (
    <div className="flex flex-col pb-24 mt-12 md:mt-24 gap-x-10 md:gap-y-20">
      <div className="flex flex-col gap-y-1 lg:gap-y-8 main-container">
        <div className="mt-10 mb-4 text-3xl font-bold md:text-5xl md:mb-10">Danh sách bài đăng</div>
        {items.length === 0 ? (
          <NotFound text="Bài viết đang cập nhật" />
        ) : (
          <div className="grid gap-6 lg:gap-10 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {items.map((post) => (
              <div
                key={post.id}
                className="z-10 flex flex-col justify-between overflow-hidden bg-white border border-gray-200 shadow-md rounded-2xl"
              >
                <Img src={post.featureImage} ratio169 />
                <div className="flex flex-col justify-between flex-1 px-5 pt-5 lg:pb-5">
                  <div className="mb-1 text-xl font-medium text-left">{post.title}</div>
                  <div className="h-20 overflow-hidden text-lg leading-7 text-left text-gray-700 text-ellipsis-3">
                    {post.excerpt}
                  </div>
                  <Button
                    className="justify-end w-full px-0 mt-3 font-bold uppercase"
                    textPrimary
                    text="Xem chi tiết"
                    href={location.pathname + `/${post.slug}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
