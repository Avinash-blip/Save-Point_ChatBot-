import { Message } from '@/types/chat';
import { Avatar, Tag, Collapse } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const showTimeRange =
    !isUser &&
    message.timeRange &&
    (message.timeRange.from?.length || message.timeRange.to?.length);
  // Metrics section removed from rendering as requested
  const showMetrics = false; 
  const formatNumber = (value: number) =>
    Number.isFinite(value) ? value.toLocaleString() : '0';
  const hasRawData = !isUser && (message.rawRows?.length ?? 0) > 0;

  const renderRawTable = () => {
    if (!message.rawRows || message.rawRows.length === 0) return null;
    const columns = Object.keys(message.rawRows[0] ?? {});
    if (columns.length === 0) {
      return <p className="text-xs text-slate-500">No raw data available.</p>;
    }
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {message.rawRows.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="border-t border-slate-100">
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 whitespace-nowrap text-slate-600">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {message.rawRows.length > 10 && (
          <div className="px-3 py-2 text-[11px] text-slate-400 border-t border-slate-100">
            Showing first 10 of {message.rawRows.length} rows.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex mb-4 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-end gap-3 max-w-[85%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <Avatar
          size={36}
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          className={`shadow ${
            isUser ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        />
        <div className="flex flex-col gap-1 min-w-0">
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm transition-all ${
              isUser
                ? 'bg-blue-500 text-white rounded-br-none text-right'
                : 'bg-white border border-slate-200 rounded-bl-none text-left'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content || message.rawAnswer}
            </p>
            {!isUser && showTimeRange && (
              <div className="mt-3 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                <span className="font-semibold uppercase tracking-wide">Time range</span>
                <Tag color="blue" className="m-0">
                  {[message.timeRange?.from, message.timeRange?.to]
                    .filter(Boolean)
                    .join(' → ')}
                </Tag>
              </div>
            )}
            {!isUser && showMetrics && (
              <div className="hidden">
                {/* Metrics visualization disabled per requirements */}
              </div>
            )}
            {!isUser && hasRawData && (
              <Collapse
                className="mt-3"
                ghost
                items={[
                  {
                    key: 'raw-data',
                    label: 'View raw data (optional)',
                    children: renderRawTable(),
                  },
                ]}
              />
            )}
          </div>
          <span className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
