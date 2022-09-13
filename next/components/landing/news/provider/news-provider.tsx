import { createContext, useContext, useEffect, useState } from "react";
import { Post, PostService } from "../../../../lib/repo/post.repo";
import { Topic, TopicService } from "../../../../lib/repo/topic.repo";
export const NewsContext = createContext<Partial<{ topics: { tp: Topic; posts: Post[] }[] }>>({});

export function NewsProvider(props) {
  const [topics, setTopics] = useState<{ tp: Topic; posts: Post[] }[]>();
  async function loadPost() {
    let topicsLoad: { tp: Topic; posts: Post[] }[] = [];
    let posts: Post[] = [];
    await PostService.getAll({ query: { limit: 0 } })
      .then((res) => {
        posts = res.data;
      })
      .catch((err) => console.error(err));
    await TopicService.getAll().then((res) => {
      res.data.forEach((item) => {
        let newTop: { tp: Topic; posts: Post[] } = { tp: null, posts: null };
        newTop.tp = item;
        let postsTp = posts.filter((p) => (p.topicIds.find((id) => item.id == id) ? true : false));
        // filter PUBLIC postsTp
        const filteredPosts = postsTp.filter((post) => post.status === "PUBLIC");
        newTop.posts = filteredPosts;
        // if topic has not PUBLIC post -> don't show!
        if (newTop.posts.length > 0) topicsLoad.push(newTop);
      });
    });
    setTopics(topicsLoad);
  }
  useEffect(() => {
    loadPost();
  }, []);

  return <NewsContext.Provider value={{ topics }}>{props.children}</NewsContext.Provider>;
}

export const useNewsContext = () => useContext(NewsContext);
