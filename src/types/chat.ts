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

export interface ChartRecommendation {
  chart_type: 
    | "bar" 
    | "horizontal_bar" 
    | "line" 
    | "area" 
    | "pie" 
    | "donut" 
    | "stacked_bar" 
    | "heatmap" 
    | "scatter" 
    | "table_only" 
    | "metric_card"
    | "multi_metric_card";
  x?: string;
  y?: string;
  y_columns?: string[];
  group_by?: string | null;
  reason: string;
  confidence?: number;
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
  chart?: ChartRecommendation;
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
  chart?: ChartRecommendation;
}
