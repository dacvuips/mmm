import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';

import { useCrud } from '../../../../lib/hooks/useCrud';
import { PaginationQueryProps } from '../../../../lib/hooks/usePaginationQuery';
import { LuckyWheel, LuckyWheelService } from '../../../../lib/repo/lucky-wheel.repo';
import { LuckyWheelDialog } from '../../wheel/lucky-wheel-dialog';

export const WheelsContext = createContext<
  PaginationQueryProps<LuckyWheel> & Partial<{ luckyWheel: LuckyWheel }>
>({});

export function WheelsProvider(props) {
  const context = useCrud(
    LuckyWheelService,
    {
      order: { createdAt: -1 },
    },
    {
      fragment: LuckyWheelService.shortFragment,
      cache: false,
    }
  );
  const [luckyWheel, setLuckyWheel] = useState<LuckyWheel>();
  const router = useRouter();
  const { wheel } = router.query;

  useEffect(() => {
    if (!wheel) return;
    LuckyWheelService.getAll({
      query: { filter: { code: wheel } },
      fragment: LuckyWheelService.fullFragment,
      cache: false,
    })
      .then((res) => setLuckyWheel(res.data[0]))
      .catch((err) => setLuckyWheel(null));
  }, [wheel]);
  return (
    <WheelsContext.Provider value={{ ...context as any, luckyWheel }}>
      {props.children}
      {luckyWheel && (
        <LuckyWheelDialog
          width={600}
          code={wheel as string}
          isOpen={!!wheel}
          // mobileSizeMode
          // slideFromBottom="all"
          onClose={() => {
            const url = new URL(location.href);
            url.searchParams.delete("wheel");
            router.push(url.toString(), null, { shallow: true });
          }}
        />
      )}
    </WheelsContext.Provider>
  );
}

export const useWheelsContext = () => useContext(WheelsContext);
