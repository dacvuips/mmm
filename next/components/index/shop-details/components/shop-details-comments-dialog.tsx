import cloneDeep from "lodash/cloneDeep";
import { useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";
import ImgsViewer from "react-images-viewer";
import { formatDate } from "../../../../lib/helpers/parser";
import { useDevice } from "../../../../lib/hooks/useDevice";
import { ShopComment, ShopCommentService } from "../../../../lib/repo/shop-comment.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Spinner, Img, NotFound } from "../../../shared/utilities/misc";
interface Propstype extends DialogProps {}
export function ShopDetailsCommentsDialog(props: Propstype) {
  const [comments, setComments] = useState<ShopComment[]>();

  useEffect(() => {
    if (props.isOpen) {
      ShopCommentService.getAll({
        query: { filter: { status: "PUBLIC" }, order: { createdAt: -1 } },
      }).then((res) => setComments(res.data));
    } else {
      setComments(null);
    }
  }, [props.isOpen]);

  const { isMobile } = useDevice();
  return (
    <Dialog
      width={"700px"}
      title={`Danh sách bình luận (${comments?.length})`}
      bodyClass="relative bg-white rounded"
      // mobileSizeMode
      // slideFromBottom="all"
      {...props}
      extraDialogClass="rounded-t-3xl lg:rounded-t"
    >
      <Dialog.Body>
        <div
          className={`flex flex-col text-sm sm:text-base px-4 v-scrollbar ${
            isMobile ? "pb-12" : ""
          }`}
          style={{ maxHeight: `calc(96vh - 150px)`, minHeight: `calc(96vh - 350px)` }}
        >
          {comments ? (
            <>
              {comments.length > 0 ? (
                <div>
                  {comments.map((item: ShopComment, index) => (
                    <CommentItem comment={item} key={item.id} />
                  ))}
                </div>
              ) : (
                <NotFound text="Chưa có bình luận" />
              )}
            </>
          ) : (
            <Spinner />
          )}
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
function CommentItem({ comment }: { comment?: ShopComment } & ReactProps) {
  const imgs = useMemo(() => {
    if (comment?.images.length) {
      return comment.images.map((item) => ({ src: item }));
    }
    return [];
  }, [comment]);
  const [show, setShow] = useState(false);
  let [cur, setCur] = useState(0);
  return (
    <div className={`flex items-center justify-between w-full border-b`}>
      <div className={`leading-7 mt-2 pb-2 inline-block`}>
        <h3 className="text-base">{comment.ownerName}</h3>
        <div className={`flex items-center text-sm`}>
          <span className="">{comment.rating}</span>
          <i className={`text-yellow-300 mx-1`}>
            <FaStar />
          </i>
          <span className="px-2">|</span>
          <span className="font-light">{formatDate(comment.createdAt, "datetime")}</span>
        </div>
        <div className="font-light text-ellipsis-3 ">{comment.message}</div>
      </div>
      {comment.images?.length > 0 && (
        <Img
          className="w-16 border border-gray-100 rounded-md shadow-sm"
          src={comment.images[0]}
          lazyload={false}
          onClick={() => {
            setShow(true);
          }}
        >
          {comment.images.length > 1 && (
            <div className="absolute w-5 h-5 text-xs font-semibold text-white rounded-full flex-center bg-primary -bottom-2 -right-2">
              +{comment.images.length - 1}
            </div>
          )}
        </Img>
      )}
      <ImgsViewer
        imgs={imgs}
        width={400}
        currImg={cur}
        preloadNextImg
        spinnnerSize={50}
        isOpen={show}
        onClickPrev={() => {
          if (cur > 0) {
            setCur(--cur);
          }
        }}
        onClickNext={() => {
          if (cur < imgs?.length) {
            setCur(++cur);
          }
        }}
        onClose={() => setShow(false)}
      />
    </div>
  );
}
