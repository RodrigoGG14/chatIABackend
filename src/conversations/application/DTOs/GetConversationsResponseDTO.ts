export interface GetConversationsResponseDTO {
  id: string;
  title: string;
  user_id: string;
  phone: string;
  human_override: boolean;
  start_date: string;
  latest_date: string;
  category: string | null;
  alerts: boolean;
}
