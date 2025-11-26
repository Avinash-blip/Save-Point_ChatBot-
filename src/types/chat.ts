export interface TimeRange {
  from: string;
  to: string;
}

export interface Metric {
  entity: string;
  total: number;
  delayed: number;
  delay_pct: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metrics?: Metric[];
  timeRange?: TimeRange;
  grouping?: string;
  rawAnswer?: string;
  rawRows?: any[];
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
  time_range: TimeRange;
  grouping: string;
  metrics: Metric[];
  raw_answer: string;
  insight_summary: string;
  raw_rows: any[];
}
