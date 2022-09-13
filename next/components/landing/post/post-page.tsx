import cloneDeep from "lodash/cloneDeep";
import React, { useEffect, useState } from "react";
import { HiClock } from "react-icons/hi";
import { formatDate } from "../../../lib/helpers/parser";
import { Post, PostService } from "../../../lib/repo/post.repo";
import { NotFound, Spinner } from "../../shared/utilities/misc";

export function PostPage({ id, ...props }: ReactProps & { id: string }) {
  const [post, setPost] = useState<Post>(undefined);
  useEffect(() => {
    if (!id) return;
    PostService.getOne({ id })
      .then((res) => setPost(cloneDeep(res)))
      .catch((err) => {
        setPost(null);
      });
  }, [id]);
  if (post === undefined) return <Spinner />;
  if (post === null) return <NotFound text="Không tìm thấy điều khoản dịch vụ" />;
  return (
    <>
      <div className="">
        <div className="min-h-screen pb-24 pt-36 main-container">
          <div className="text-2xl font-semibold text-center text-gray-700 uppercase">
            {post.title}
          </div>
          <div className="max-w-screen-xl p-2 mt-4 text-gray-500 bg-white border-2 border-gray-100 rounded-lg">
            <div className="flex items-stretch px-4 pt-1 text-sm text-center text-gray-500">
              <i className="text-lg">
                <HiClock />
              </i>
              <span className="ml-2 ">{formatDate(post.createdAt, "HH:mm dd/MM/yyyy")}</span>
            </div>
            <div
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html: post.content,
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}
