export type TriggerActionModule = {
  type: string;
  handler: (options: any, context: any) => Promise<any>;
};
