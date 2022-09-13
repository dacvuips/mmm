import { createContext, useContext, useEffect, useState } from 'react';

import { useCrud } from '../../../../lib/hooks/useCrud';
import { PaginationQueryProps } from '../../../../lib/hooks/usePaginationQuery';
import { Order, OrderService } from '../../../../lib/repo/order.repo';

export const OrderContext = createContext<
  PaginationQueryProps<Order> & Partial<{ limit: number; setLimit: Function }>
>({});

export function OrderProvider(props) {
  const [limit, setLimit] = useState(10);
  const context = useCrud(
    OrderService,
    {
      order: { createdAt: -1 },
      limit,
    },
    {
      cache: false,
    },
  );
  return (
    <OrderContext.Provider value={{ ...context as any, limit, setLimit }}>
      {props.children}
    </OrderContext.Provider>
  );
}

export const useOrderContext = () => useContext(OrderContext);
