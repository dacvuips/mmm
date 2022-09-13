import { createContext, useContext, useEffect, useState } from "react";
import { SettingService } from "../../../../lib/repo/setting.repo";
export const AboutUsContext = createContext<{
  achievement?: string[];
}>({});

export function AboutUsProvider(props) {
  const [achievement, setAchievement] = useState<string[]>([]);

  useEffect(() => {
    SettingService.getAll({ query: { filter: { key: "LP_CASE_STUDY" }, limit: 1 } }).then((res) =>
      setAchievement(res.data[0]?.value)
    );
  }, []);

  return (
    <AboutUsContext.Provider value={{ achievement }}>{props.children}</AboutUsContext.Provider>
  );
}

export const useAboutUsContext = () => useContext(AboutUsContext);
