import { createContext, useContext, useEffect, useState } from "react";
import { Post, PostService } from "../../../../lib/repo/post.repo";
export const LadingHomeContext = createContext<Partial<{ posts: Post[] }>>({});

export function LadingHomeProvider(props) {
  const [posts, setPosts] = useState<Post[]>();
  async function loadPost() {
    await PostService.getAll({ query: { filter: { topicIds: "619240eae483be0e1c5a1d26" } } })
      .then((res) => setPosts(res.data))
      .catch((err) => setPosts([]));
  }
  useEffect(() => {
    loadPost();
  }, []);

  return (
    <LadingHomeContext.Provider value={{ posts }}>{props.children}</LadingHomeContext.Provider>
  );
}

export const useLadingHomeContext = () => useContext(LadingHomeContext);
