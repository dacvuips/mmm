import React, { createContext, useContext, useEffect, useState } from "react";
import { Post, PostService } from "../../../../lib/repo/post.repo";

export const RecruitContext = createContext<{
  posts?: Post[];
}>({});

export function RecruitProvider(props) {
  const [posts, setPosts] = useState<Post[]>();
  useEffect(() => {
    PostService.getAll({
      query: { filter: { topicIds: "61c53de1933d5142f477373d" } },
    })
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error: ", err));
  }, []);

  return <RecruitContext.Provider value={{ posts }}>{props.children}</RecruitContext.Provider>;
}

export const useRecruitContext = () => useContext(RecruitContext);
