import { useEffect, useState } from "react";
import { formatDate } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  SupportTicketComment,
  SupportTicketCommentService,
} from "../../../../lib/repo/support-ticket-comment.repo";
import { SupportTicket, SupportTicketService } from "../../../../lib/repo/support-ticket.repo";
import { Slideout, SlideoutProps } from "../../../shared/utilities/dialog/slideout";
import { Label } from "../../../shared/utilities/form";
import { Field } from "../../../shared/utilities/form/field";
import { Form } from "../../../shared/utilities/form/form";
import { ImageInput } from "../../../shared/utilities/form/image-input";
import { Textarea } from "../../../shared/utilities/form/textarea";
import { Img, NotFound, Spinner } from "../../../shared/utilities/misc";

interface SupportTicketSlideoutPropsType extends SlideoutProps {
  supportTicketId: string;
  loadAll: () => Promise<any>;
  executeDisabled?: boolean;
}
export function SupportTicketSlideout({
  loadAll,
  supportTicketId,
  executeDisabled,
  ...props
}: SupportTicketSlideoutPropsType) {
  const [supportTicket, setSupportTicket] = useState<SupportTicket>();
  const [defaultValues, setDefaultValues] = useState({ message: "", images: [] });
  const [supportTicketComments, setSupportTicketComments] = useState<SupportTicketComment[]>();
  const toast = useToast();

  useEffect(() => {
    setSupportTicket(null);
    setSupportTicketComments(null);
    if (supportTicketId) {
      SupportTicketService.getOne({ id: supportTicketId }).then((res) => {
        setSupportTicket(res);
      });
      loadComments();
    }
  }, [supportTicketId]);

  const loadComments = async () => {
    await SupportTicketCommentService.getAll({
      query: { filter: { ticketId: supportTicketId }, order: { createdAt: 1 } },
    }).then((res) => {
      setSupportTicketComments(res.data);
    });
  };

  return (
    <Slideout width="650px" {...props}>
      {!supportTicket ? (
        <Spinner />
      ) : (
        <div className="h-screen overflow-y-scroll v-scrollbar">
          <div className="flex flex-col p-6">
            <div className="flex items-center">
              <Img
                src={supportTicket?.member?.shopLogo || supportTicket?.assigner?.avatar}
                className="w-14 rounded-full border border-gray-200"
                compress={80}
                lazyload
              />
              <div className="flex-1 pl-3">
                <div className="font-semibold text-primary">{supportTicket?.member?.shopName}</div>
                <div className="text-sm font-semibold">{supportTicket?.member?.phone}</div>
                <div className="text-sm">{`vào lúc ${supportTicket?.createdAt &&
                  formatDate(supportTicket?.createdAt, "hh:mm dd/MM/yyyy")
                  }`}</div>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <div>
                <Label text="Mã yêu cầu" />
                <div className="pl-1">{supportTicket?.code}</div>
              </div>
              <div>
                <Label text="Nội dung" />
                <div className="pl-1 whitespace-pre-wrap">{supportTicket?.desc || "Không có"}</div>
              </div>
              {supportTicket?.images.length > 0 && (
                <div>
                  <Label text="Hình ảnh đính kèm" />
                  <div className="flex flex-wrap gap-3 mt-2">
                    {supportTicket?.images.map((item, index) => (
                      <Img key={item} src={item} className="w-24" showImageOnClick />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label text="Danh sách bình luận" />
                {supportTicketComments ? (
                  supportTicketComments.length > 0 ? (
                    supportTicketComments.map((item) => <OneComment comment={item} key={item.id} />)
                  ) : (
                    <NotFound text="Chưa có bình luận" />
                  )
                ) : (
                  <Spinner />
                )}
              </div>
            </div>
            <Form
              defaultValues={defaultValues}
              allowResetDefaultValues
              onSubmit={async (data) => {
                await SupportTicketCommentService.create({
                  data: { ...data, ticketId: supportTicketId },
                  toast,
                });
                loadComments();
                setDefaultValues({ message: "", images: [] });
              }}
            >
              <Field name="message">
                <Textarea placeholder="Nội dung bình luận" />
              </Field>
              <Field name="images">
                <ImageInput multi />
              </Field>
              <Form.Footer cancelText="" submitText="Bình luận" submitProps={{ disabled: executeDisabled }} />
            </Form>
          </div>
        </div>
      )}
    </Slideout>
  );
}

const OneComment = ({ comment, ...props }: ReactProps & { comment: SupportTicketComment }) => {
  if (!comment) return <Spinner />;
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-x-4 mt-2">
        <img
          src={
            comment.fromMember
              ? comment?.member?.shopLogo || "/assets/default/avatar.png"
              : comment.user?.avatar || "/assets/default/avatar.png"
          }
          className="object-contain w-12 rounded-full"
        />
        <div className="">
          <div className="font-semibold">{comment.name}</div>
          <div className="text-xs">{`vào lúc ${comment?.createdAt && formatDate(comment?.createdAt, "hh:mm dd/MM/yyyy")
            }`}</div>
          <div className="text-xs">{comment?.owner?.phone}</div>
        </div>
      </div>
      <div className="py-2 text-base whitespace-pre-line">{comment?.message}</div>
      <div className="flex flex-wrap gap-3">
        {comment?.images.map((item, index) => (
          <Img
            key={item}
            src={item}
            className="w-24"
            default="/assets/img/defaul.png"
            showImageOnClick
          />
        ))}
      </div>
      <hr className="my-2" />
    </div>
  );
};
