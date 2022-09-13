import { BaseModel, CrudRepository } from "./crud.repo";
import { SetAnonymousToken } from "../graphql/auth.link";
import { User, UserService } from "./user.repo";
import { Member, MemberService } from "./member.repo";

export interface SupportTicketComment extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  ticketId: string;
  fromMember: boolean;
  memberId: string;
  userId: string;
  name: string;
  message: string;
  images: string[];
  member: Member;
  user: User;
}
export class SupportTicketCommentRepository extends CrudRepository<SupportTicketComment> {
  apiName: string = "SupportTicketComment";
  displayName: string = "bình luận yêu cầu hỗ trợ";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  ticketId: ID
  fromMember: Boolean
  memberId: ID
  userId: ID
  name: String
  message: String
  images: [String]
  member{
    ${MemberService.shortFragment}
  }: Member
  user{
    ${UserService.shortFragment}
  }: User
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  ticketId: ID
  fromMember: Boolean
  memberId: ID
  userId: ID
  name: String
  message: String
  images: [String]
  member{
    ${MemberService.shortFragment}
  }: Member
  user{
    ${UserService.shortFragment}
  }: User
  `);
}
export const SupportTicketCommentService = new SupportTicketCommentRepository();
