export interface Message {
  warrior: string | "user" | "system" | "phrase";
  content: string;
  timestamp: Date;
} 