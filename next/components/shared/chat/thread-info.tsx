import formatDistanceToNow from "date-fns/formatDistanceToNow";
import vi from "date-fns/locale/vi";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaRegEdit, FaStoreAlt } from "react-icons/fa";
import { formatDate, parseAddress, parseNumber } from "../../../lib/helpers/parser";
import { useCrud } from "../../../lib/hooks/useCrud";
import { useAuth } from "../../../lib/providers/auth-provider";
import { OrderService, ORDER_STATUS } from "../../../lib/repo/order.repo";
import { SUBSCRIPTION_PLANS } from "../../../lib/repo/shop-subscription.repo";
import { SupportTicketService, SUPTICKET_STATUS } from "../../../lib/repo/support-ticket.repo";
import { ThreadNoteService } from "../../../lib/repo/thread-note.repo";
import { useMessageContext } from "../../shared/chat/message-provider";
import { OrderDetailsDialog } from "../../shared/shop-layout/order-details-dialog";
import { Button, Form } from "../../shared/utilities/form";
import { Textarea } from "../../shared/utilities/form/textarea";
import { Img, NotFound, Spinner, StatusLabel } from "../../shared/utilities/misc";
import { TabGroup } from "../../shared/utilities/tab/tab-group";
import { SupportTicketSlideout } from "../../shop/support-ticket/components/support-ticket-slideout";

export function ThreadInfo({ executeDisabled }: { executeDisabled?: boolean }) {
  const { receiverRole, thread } = useMessageContext();

  const receiver =
    receiverRole == "MEMBER"
      ? thread?.member
      : receiverRole == "CUSTOMER"
        ? thread?.customer
        : thread?.user;
  const address = receiver
    ? receiverRole == "MEMBER"
      ? parseAddress(receiver)
      : receiver.fullAddress
    : "";

  if (!thread) return <></>;
  return (
    <div className="flex flex-col items-center border-l w-72 animate-scale-in-right">
      <div className="w-full p-3">
        <div className="flex items-center">
          <Img
            src={receiver?.shopLogo || receiver?.avatar}
            compress={150}
            className="w-12 border rounded-full"
            showImageOnClick
            avatar
          />
          <div className="flex-1 pl-3">
            <div className="font-semibold">{receiver?.shopName || receiver?.name}</div>
            {receiverRole == "CUSTOMER" && (
              <div className="flex items-center text-sm font-medium text-primary">
                <i className="text-xs pr-1 pb-0.5">
                  <FaPhoneAlt />
                </i>
                {receiver?.phone}
              </div>
            )}
            {receiverRole == "MEMBER" && (
              <a
                className="flex items-center text-sm font-medium underline text-primary hover:underline"
                target="_blank"
                href={`/${receiver.code}`}
              >
                <i className="text-xs pr-1 pb-0.5">
                  <FaStoreAlt />
                </i>
                {receiver.code}
              </a>
            )}
          </div>
        </div>
        {receiverRole == "MEMBER" && (
          <div className="flex items-start pt-1 text-sm text-gray-600">
            <i className="pt-1 pr-1 text-xs text-primary">
              <FaPhoneAlt />
            </i>
            {receiver.phone}
          </div>
        )}
        {address && (
          <div className="flex items-start pt-1 text-sm text-gray-600">
            <i className="pt-1 pr-1 text-xs text-primary">
              <FaMapMarkerAlt />
            </i>
            {address}
          </div>
        )}
        {receiverRole == "MEMBER" && (
          <div className="flex items-center justify-between w-full pt-2">
            <StatusLabel
              options={SUBSCRIPTION_PLANS}
              value={receiver.subscription?.plan}
              type="text"
              extraClassName="pl-0"
            />
            <div className="text-xs text-gray-600">
              còn{" "}
              {formatDistanceToNow(new Date(receiver.subscription?.expiredAt), {
                locale: vi,
                addSuffix: true,
              })}
            </div>
          </div>
        )}
      </div>
      <TabGroup
        name={"chat-tabs-" + receiverRole}
        bodyClassName="w-full flex-1 flex-col flex"
        tabClassName="py-3"
        tabsClassName="bg-gray-100 border-t border-b"
      >
        <TabGroup.Tab label="Ghi chú">
          <ThreadNotes executeDisabled={executeDisabled} />
        </TabGroup.Tab>
        {receiverRole == "CUSTOMER" && (
          <TabGroup.Tab label="Đơn hàng">
            <ThreadOrders />
          </TabGroup.Tab>
        )}
        {receiverRole == "MEMBER" && (
          <TabGroup.Tab label="Ticket">
            <ThreadTickets executeDisabled={executeDisabled} />
          </TabGroup.Tab>
        )}
      </TabGroup>
    </div>
  );
}

function ThreadNotes({ executeDisabled, ...props }: { executeDisabled?: boolean }) {
  const { thread } = useMessageContext();

  const [note, setNote] = useState("");

  const threadNoteCrud = useCrud(
    ThreadNoteService,
    {
      filter: { threadId: thread?.id },
      order: { createdAt: -1 },
    },
    {
      fetchingCondition: !!thread,
    }
  );

  return (
    <>
      {threadNoteCrud.items ? (
        <>
          <div className="flex flex-col gap-3 p-3">
            {threadNoteCrud.items.map((note) => (
              <div key={note.id} className="p-2 whitespace-pre-wrap rounded bg-slate-light">
                <div>{note.text}</div>
                <div className="text-sm font-medium text-primary">
                  {formatDate(note.createdAt, "datetime")}
                </div>
              </div>
            ))}
            {!threadNoteCrud.items.length && (
              <NotFound icon={<FaRegEdit />} text="Chưa có ghi chú nào" />
            )}
          </div>

          <Form
            className="sticky bottom-0 p-3 mt-auto bg-white border-t"
            onSubmit={async () => {
              if (!note.trim()) {
                return;
              }
              try {
                let res = await ThreadNoteService.create({
                  data: { threadId: thread.id, text: note },
                });
                setNote("");
                threadNoteCrud.loadAll();
              } catch (error) {
                console.error(error);
              }
            }}
          >
            <Textarea value={note} onChange={setNote} placeholder="Ghi chú khách hàng" />
            <Form.Footer
              cancelText=""
              submitProps={{ className: "w-full", disabled: executeDisabled }}
              submitText="Thêm ghi chú"
            />
          </Form>
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
}

function ThreadOrders() {
  const { receiver } = useMessageContext();
  const [orderId, setOrderId] = useState<string>();

  const threadOrderCrud = useCrud(
    OrderService,
    {
      filter: { buyerId: receiver.id },
      order: { createdAt: -1 },
      limit: 2,
    },
    {
      fetchingCondition: !!receiver,
    }
  );
  useEffect(() => {
    threadOrderCrud.loadAll(true);
  }, []);

  return (
    <>
      {threadOrderCrud.items ? (
        <div className="flex flex-col gap-3 p-3">
          {threadOrderCrud.items.map((order) => (
            <div
              key={order.id}
              className="px-3 py-2 border rounded cursor-pointer hover:border-primary"
              onClick={() => setOrderId(order.id)}
            >
              <div className="flex justify-between">
                <div className="font-semibold">{order.code}</div>
                <div className="text-sm text-gray-600">
                  {formatDate(order.createdAt, "datetime")}
                </div>
              </div>

              <div className="flex justify-between">
                <StatusLabel options={ORDER_STATUS} value={order.status} />
                {/* <div className="text-sm text-gray-600">{parseNumber(order.itemCount)} món</div> */}
                <div className="font-semibold text-primary">{parseNumber(order.amount, true)}</div>
              </div>
            </div>
          ))}
          {!threadOrderCrud.items.length && (
            <NotFound icon={<FaRegEdit />} text="Chưa có đơn hàng nào" />
          )}
          {threadOrderCrud.items.length < threadOrderCrud.pagination.total && (
            <Button outline text={"Tải thêm"} onClick={threadOrderCrud.loadMore} />
          )}
          <OrderDetailsDialog
            orderId={orderId}
            isOpen={!!orderId}
            onClose={() => {
              setOrderId("");
            }}
          />
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
}

function ThreadTickets({ executeDisabled, ...props }: { executeDisabled?: boolean }) {
  const { receiver } = useMessageContext();
  const [openSupportTicketId, setOpenSupportTicketId] = useState<string>();

  const ticketCrud = useCrud(
    SupportTicketService,
    {
      filter: { memberId: receiver.id },
      order: { createdAt: -1 },
      limit: 2,
    },
    {
      fetchingCondition: !!receiver,
    }
  );

  return (
    <>
      {ticketCrud.items ? (
        <div className="flex flex-col gap-3 p-3">
          {ticketCrud.items.map((ticket) => (
            <div
              key={ticket.id}
              className="px-3 py-2 border rounded cursor-pointer hover:border-primary"
              onClick={() => setOpenSupportTicketId(ticket.id)}
            >
              <div className="flex justify-between">
                <div className="font-semibold">{ticket.code}</div>
                <StatusLabel type="text" options={SUPTICKET_STATUS} value={ticket.status} />
              </div>
              <div>{ticket.desc}</div>
              <div className="text-sm text-gray-600">
                {formatDate(ticket.createdAt, "datetime")}
              </div>
            </div>
          ))}
          {!ticketCrud.items.length && <NotFound icon={<FaRegEdit />} text="Chưa có ticket nào" />}
          {ticketCrud.items.length < ticketCrud.pagination.total && (
            <Button outline text={"Tải thêm"} onClick={ticketCrud.loadMore} />
          )}
          <SupportTicketSlideout
            supportTicketId={openSupportTicketId}
            loadAll={() => ticketCrud.loadAll(true)}
            isOpen={!!openSupportTicketId}
            onClose={() => {
              setOpenSupportTicketId("");
            }}
            executeDisabled={executeDisabled}
          />
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
}
