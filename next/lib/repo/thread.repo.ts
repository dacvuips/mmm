import { useLayoutEffect, useRef, useState } from "react";
import { BaseModel, CrudRepository } from "./crud.repo";
import { Customer } from "./customer.repo";
import { Member } from "./member.repo";
import { ThreadMessage } from "./thread-message.repo";
import { User } from "./user.repo";

export interface Thread extends BaseModel {
  channel?: "channel" | "member"; // Kênh trao đổi
  snippet?: string; // Tin nhắn gần nhất
  lastMessageAt?: Date; // Thời điểm tin nhắn gần nhất
  messageId?: string; // Mã tin nhắn gần nhất
  memberId?: string; // Mã chủ shop
  customerId?: string; // Mã khách hàng
  userId?: string; // Mã quản lý
  status?: ThreadStatus; // Trạng thái trao đổi
  id: string;
  seen: boolean;
  seenAt: string;
  createdAt: string;
  updatedAt: string;
  member: Member;
  customer: Customer;
  user: User;
  message: ThreadMessage;
  threadLabelIds: string[];
}
export class ThreadRepository extends CrudRepository<Thread> {
  apiName: string = "Thread";
  displayName: string = "Cuộc trò truyện";
  shortFragment: string = this.parseFragment(`
    id: String    
    createdAt: DateTime
    updatedAt: DateTime
    channel: String 
    snippet: String
    lastMessageAt: DateTime
    messageId: ID
    memberId: ID
    customerId: ID
    userId: ID
    status: String
    seen: Boolean
    seenAt: DateTime
    member { 
      id code shopLogo shopName
    }
    customer { 
      id avatar name
    }
    user { 
      id avatar name
    }
    threadLabelIds
  `);
  fullFragment: string = this.parseFragment(`
    id: String    
    createdAt: DateTime
    updatedAt: DateTime
    channel: String 
    snippet: String
    lastMessageAt: DateTime
    messageId: ID
    memberId: ID
    customerId: ID
    userId: ID
    status: String
    seen: Boolean
    seenAt: DateTime
    member {
      id: String
      code: String
      username: String
      name: String
      avatar: String
      phone: String
      shopName: String
      shopLogo: String
      address: String
      province: String
      district: String
      ward: String
      subscription { 
        plan: String
        expiredAt: DateTime
      }
    }
    customer { 
      id: String
      code: String
      phone: String
      avatar: String
      fullAddress: String
      name: string
    }
    user { 
      id: String
      email: string
      name: string
      phone: string
    }
    threadLabelIds
  `);
  async markThreadSeen(threadId: string): Promise<Thread> {
    return await this.query({
      query: `markThreadSeen(threadId: "${threadId}") {
          ${this.shortFragment}
        }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  subscribeThread(condition: boolean) {
    const [value, setValue] = useState<{
      thread: Thread;
      message: ThreadMessage;
    }>();
    const subscription = useRef(null);
    useLayoutEffect(() => {
      if (condition) {
        subscription.current = this.subscribe({
          query: `threadStream { 
            thread { id snippet }
            message { id sender { memberId customerId userId } }
        }`,
        }).subscribe(
          (res) => {
            const data = res.data.g0;
            setValue(data);
          },
          (err) => {
            console.error(err);
          }
        );
      } else {
        subscription.current?.unsubscribe();
      }
      return () => {
        subscription.current?.unsubscribe();
      };
    }, [condition]);

    return value;
  }
}

export const ThreadService = new ThreadRepository();

export type ThreadChannel = "member" | "customer";
export const THREAD_CHANNELS: Option<ThreadChannel>[] = [
  { value: "member", label: "cửa hàng" },
  { value: "customer", label: "khách hàng" },
];

export type ThreadStatus = "new" | "opening" | "closed";
export const THREAD_STATUS: Option<ThreadStatus>[] = [
  {
    value: "new",
    label: "Mở mới",
  },
  {
    value: "opening",
    label: "Đang tương tác",
  },
  {
    value: "closed",
    label: "Đã kết thúc",
  },
];

export enum ThreadMessageType {
  general = "general", // Chung
}
export type ThreadRole = "ADMIN" | "MEMBER" | "CUSTOMER";
