export type ConversaionCategory = "new" | "active" | "old" | "test" | null;
export interface ConversationInterface {
  id: string;
  title: string;
  user_id: string;
  human_override: boolean;
  start_date: string;
  latest_date: string;
  category: ConversaionCategory;
  alerts: boolean;
}
