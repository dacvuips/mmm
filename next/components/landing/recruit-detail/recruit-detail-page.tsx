import { useEffect, useState } from "react";
import { Post, PostService } from "../../../lib/repo/post.repo";
import { Spinner, NotFound } from "../../shared/utilities/misc";

interface Props {
  id: string;
}

export default function RecruitDetailPage({ id, ...props }: Props) {
  const [post, setPost] = useState<Post>();

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await PostService.getOne({ id });
        setPost(data);
      } catch (error) {
        console.error("error: ", error);
      }
    })();
  }, []);

  if (post === undefined) return <Spinner />;
  if (post === null) return <NotFound text="Không có bài viết này" />;

  return (
    <div className="">
      <div className="pb-24 pt-36 main-container">
        <div className="text-2xl font-semibold text-center text-gray-700">{post.title}</div>
        <div className="max-w-screen-xl p-12 mt-4 text-gray-500 bg-white border-2 border-gray-100 rounded-lg">
          <div
            className="ck-content"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
