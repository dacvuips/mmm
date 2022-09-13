import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TriggerEvent, TriggerService, TriggerSubEvent } from "../../../../lib/repo/trigger.repo";
import { Spinner } from "../../../shared/utilities/misc";
export const TriggersContext = createContext<
  Partial<{
    events: TriggerEvent[];
    subEvents: TriggerSubEvent[];
    orderContexts: { id: string; display: string }[];
  }>
>({});
export function TriggersProvider(props) {
  const [events, setEvents] = useState<TriggerEvent[]>();
  const subEvents: TriggerSubEvent[] = useMemo(
    () => events?.reduce((arr, event) => [...arr, ...event.events], []) || [],
    [events]
  );
  const orderContexts: { id: string; display: string }[] = useMemo(() => {
    if (events) {
      const orderEvent = events.find((x) => x.id == "order");
      if (orderEvent) {
        return orderEvent.context.map((x) => ({ id: `order.${x.id}`, display: x.name })) || [];
      } else {
        return [];
      }
    }
    return [];
  }, [events]);

  useEffect(() => {
    TriggerService.getTriggerEvents().then((res) => {
      setEvents(res);
      console.log(events);
    });
  }, []);

  return (
    <TriggersContext.Provider value={{ orderContexts, events, subEvents }}>
      {events ? <>{props.children}</> : <Spinner />}
    </TriggersContext.Provider>
  );
}

export const useTriggersContext = () => useContext(TriggersContext);
