export interface Message {
  id: string;
  channel_id: string;
  sender_id: string; // references users
  content: string;
  sent_at: string;
  edited_at: string;
  was_unsent: string;
}
