import { BaseModel, CrudRepository } from "./crud.repo";
import { ShopPostTag, ShopPostTagService } from "./shop-post-tag.repo";
import { ShopTopic, ShopTopicService } from "./shop-topic.repo";

export interface ShopPost extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  title: string;
  excerpt: string;
  slug: string;
  status: string;
  publishedAt: string;
  featureImage: string;
  metaDescription: string;
  metaTitle: string;
  content: string;
  tagIds: string[];
  ogDescription: string;
  ogImage: string;
  ogTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterTitle: string;
  priority: number;
  view: number;
  topicIds: string[];
  tags: ShopPostTag[];
  topics: ShopTopic[];
  seen: boolean;
}
export class ShopPostRepository extends CrudRepository<ShopPost> {
  apiName: string = "ShopPost";
  displayName: string = "bài viết";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  title: String
  excerpt: String
  slug: String
  status: String
  publishedAt: DateTime
  featureImage: String
  metaDescription: String
  metaTitle: String
  content: String
  tagIds: [ID]
  priority: Int
  view: Int
  topicIds: [ID]
  tags{
    id
  }: [ShopPostTag]
  topics{
    id
  }: [ShopTopic]
  seen: Boolean
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  title: String
  excerpt: String
  slug: String
  status: String
  publishedAt: DateTime
  featureImage: String
  metaDescription: String
  metaTitle: String
  content: String
  tagIds: [ID]
  ogDescription: String
  ogImage: String
  ogTitle: String
  twitterDescription: String
  twitterImage: String
  twitterTitle: String
  priority: Int
  view: Int
  topicIds: [ID]
  tags{
    ${ShopPostTagService.shortFragment}
  }: [ShopPostTag]
  topics{ ${ShopTopicService.shortFragment}
  }: [ShopTopic]
  seen: Boolean
  `);
}

export const ShopPostService = new ShopPostRepository();

export const POST_STATUSES: Option[] = [
  { value: "DRAFT", label: "Bản nháp", color: "accent" },
  { value: "PUBLIC", label: "Công khai", color: "success" },
];
