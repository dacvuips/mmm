import { BaseModel, CrudRepository } from "./crud.repo";
import { SetAnonymousToken } from "../graphql/auth.link";
import { User, UserService } from "./user.repo";
import { Member, MemberService } from "./member.repo";

export interface SupportTicket extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  memberId: string;
  name: string;
  desc: string;
  images: string[];
  status: "opening" | "pending" | "processing" | "closed";
  subStatus:
  | "new"
  | "reopening"
  | "considering"
  | "assigning"
  | "request_more_info"
  | "info_completed"
  | "completed"
  | "canceled";
  logs: any[];
  assignerId: string;
  member: Member;
  assigner: User;
}
export interface PublicSupportTicket extends BaseModel {
  id: string;
  coverImage: string;
  name: string;
  fullAddress: string;
  distance: number;
  rating: string;
  ratingQty: string;
  SupportTicketCode: string;
  branchs: {
    name: string;
  }[];
}
export class SupportTicketRepository extends CrudRepository<SupportTicket> {
  apiName: string = "SupportTicket";
  displayName: string = "yêu cầu hỗ trợ";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  code: String
  memberId: ID
  name: String
  desc: String
  images: [String]
  status: String
  subStatus: String
  logs: [Mixed]
  assignerId: ID
  member{
    ${MemberService.shortFragment}
  }: Member
  assigner{
    ${UserService.shortFragment}
  }: User
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  code: String
  memberId: ID
  name: String
  desc: String
  images: [String]
  status: String
  subStatus: String
  logs: [Mixed]
  assignerId: ID
  member{
    ${MemberService.shortFragment}
  }: Member
  assigner{
    ${UserService.shortFragment}
  }: User
  `);
  async submitInfoSupportTicket(id: string, comment: { message: string; images: string[] }) {
    return this.mutate({
      mutation: `
      submitInfoSupportTicket(id: "${id}", comment: $comment) {
          ${this.shortFragment}
        }
      `,
      variablesParams: `($comment: SupportTicketCommentInput!)`,
      options: {
        variables: {
          comment,
        },
      },
    });
  }
  async cancelSupportTicket(id: string, comment: { message: string; images: string[] }) {
    return this.mutate({
      mutation: `
      cancelSupportTicket(id: "${id}", comment: $comment) {
          ${this.shortFragment}
        }
      `,
      variablesParams: `($comment: SupportTicketCommentInput!)`,
      options: {
        variables: {
          comment,
        },
      },
    });
  }
  async considerSupportTicket(id: string, comment: { message: string; images: string[] }) {
    return this.mutate({
      mutation: `
      considerSupportTicket(id: "${id}", comment: $comment) {
          ${this.shortFragment}
        }
      `,
      variablesParams: `($comment: SupportTicketCommentInput!)`,
      options: {
        variables: {
          comment,
        },
      },
    });
  }
  async requestInfoSupportTicket(id: string, comment: { message: string; images: string[] }) {
    return this.mutate({
      mutation: `
      requestInfoSupportTicket(id: "${id}", comment: $comment) {
          ${this.shortFragment}
        }
      `,
      variablesParams: `($comment: SupportTicketCommentInput!)`,
      options: {
        variables: {
          comment,
        },
      },
    });
  }
  async completeSupportTicket(id: string, comment: { message: string; images: string[] }) {
    return this.mutate({
      mutation: `
      completeSupportTicket(id: "${id}", comment: $comment) {
          ${this.shortFragment}
        }
      `,
      variablesParams: `($comment: SupportTicketCommentInput!)`,
      options: {
        variables: {
          comment,
        },
      },
    });
  }
  async assignSupportTicket(
    id: string,
    assignerId: string,
    comment: { message: string; images: string[] }
  ) {
    return this.mutate({
      mutation: `
      assignSupportTicket(id: "${id}", assignerId: "${assignerId}", comment: $comment) {
          ${this.shortFragment}
        }
      `,
      variablesParams: `($comment: SupportTicketCommentInput!)`,
      options: {
        variables: {
          comment,
        },
      },
    });
  }
}
export const SupportTicketService = new SupportTicketRepository();
export const SUPTICKET_STATUS: Option[] = [
  {
    value: "opening",
    label: "Mới tạo",
    color: "success",
  },
  {
    value: "pending",
    label: "Chờ xử lý",
    color: "warning",
  },
  {
    value: "processing",
    label: "Đang xử lý",
    color: "info",
  },
  {
    value: "closed",
    label: "Đã đóng",
    color: "slate",
  },
];
export const SUPTICKET_SUBSTATUS: Option[] = [
  {
    value: "new",
    label: "Mới tạo",
    color: "pink",
  },
  {
    value: "reopening",
    label: "Mở lại",
    color: "danger",
  },
  {
    value: "pending",
    label: "Chờ xử lý",
    color: "warning",
  },
  {
    value: "considering",
    label: "Đang xem xét",
    color: "accent",
  },
  {
    value: "assigning",
    label: "Đang bàn giao",
    color: "warning",
  },
  {
    value: "request_more_info",
    label: "Cần thêm thông tin",
    color: "teal",
  },
  {
    value: "info_completed",
    label: "Đã đủ thông tin",
    color: "warning",
  },
  {
    value: "completed",
    label: "Hoàn thành",
    color: "success",
  },
  {
    value: "canceled",
    label: "Đã hủy",
    color: "slate",
  },
];
