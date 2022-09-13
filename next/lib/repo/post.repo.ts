import { BaseModel, CrudRepository } from "./crud.repo";
import { PostTag } from "./post-tag.repo";
import { Topic, TopicService } from "./topic.repo";

export interface Post extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  excerpt: string;
  slug: string;
  status: string;
  publishedAt: string;
  featureImage: string;
  metaDescription: string;
  metaTitle: string;
  content: string;
  ogDescription: string;
  ogImage: string;
  ogTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterTitle: string;
  priority: number;
  view: number;
  topicIds: string[];
  topics: Topic[];
  seen: boolean;
}
export class PostRepository extends CrudRepository<Post> {
  apiName: string = "Post";
  displayName: string = "bài viết";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
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
  topics{
    ${TopicService.shortFragment}
  }: [Topic]
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
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
  topics{
    ${TopicService.shortFragment}
  }: [Topic]
  `);
}

export const PostService = new PostRepository();

export const POST_STATUSES: Option[] = [
  { value: "DRAFT", label: "Bản nháp", color: "accent" },
  { value: "PUBLIC", label: "Công khai", color: "success" },
];
