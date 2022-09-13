import { useRouter } from "next/router";
import { useMemo } from "react";

export function useQuery(field: string) {
  const router = useRouter();
  const id = useMemo(() => {
    if (router.query[field]) {
      return router.query[field] as string;
    } else {
      return undefined;
    }
  }, [router.query]);

  return id;
}
