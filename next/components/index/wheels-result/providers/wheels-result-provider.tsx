import { createContext, useContext } from 'react';
import { useState } from 'react';

import { useCrud } from '../../../../lib/hooks/useCrud';
import { PaginationQueryProps } from '../../../../lib/hooks/usePaginationQuery';
import { LuckyWheelResult, LuckyWheelResultService } from '../../../../lib/repo/lucky-wheel-result.repo';

export const WheelsResultContext = createContext<
  PaginationQueryProps<LuckyWheelResult> & Partial<{ setLimit: Function; limit: number }>
>({});

export function WheelsResultProvider(props) {
  const [limit, setLimit] = useState(10);
  const context = useCrud(
    LuckyWheelResultService,
    {
      order: { createdAt: -1 },
      limit: limit,
    },
    {
      fragment: LuckyWheelResultService.shortFragment,
      cache: false,
    }
  );
  return (
    <WheelsResultContext.Provider value={{ ...context as any, limit, setLimit }}>
      {props.children}
    </WheelsResultContext.Provider>
  );
}

export const useWheelsResultContext = () => useContext(WheelsResultContext);
