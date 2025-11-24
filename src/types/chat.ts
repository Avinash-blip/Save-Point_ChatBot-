export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metrics?: any[];
  isStreaming?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse {
  summary: string;
  time_range: {
    from: string;
    to: string;
  };
  grouping: string;
  metrics: any[];
  raw_answer: string;
}
