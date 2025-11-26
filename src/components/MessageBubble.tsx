import { Message, ChartRecommendation } from '@/types/chat';
import { Avatar, Tag, Collapse } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

interface MessageBubbleProps {
  message: Message;
}

// Helper to format large numbers
const formatNumber = (value: number) =>
  Number.isFinite(value) ? value.toLocaleString() : '0';

// Color palette for stacked segments
const SEGMENT_COLORS: Record<string, string> = {
  long_stoppage: '#f59e0b',      // amber
  route_deviation: '#8b5cf6',    // purple  
  sta_breached: '#ef4444',       // red
  default_0: '#22c55e',          // green
  default_1: '#3b82f6',          // blue
  default_2: '#ec4899',          // pink
  default_3: '#14b8a6',          // teal
  default_4: '#f97316',          // orange
};

// Get color for a metric column
const getSegmentColor = (colName: string, idx: number): string => {
  const lower = colName.toLowerCase();
  if (lower.includes('long_stoppage') || lower.includes('stoppage')) return SEGMENT_COLORS.long_stoppage;
  if (lower.includes('route_deviation') || lower.includes('deviation')) return SEGMENT_COLORS.route_deviation;
  if (lower.includes('sta_breach') || lower.includes('breach')) return SEGMENT_COLORS.sta_breached;
  return SEGMENT_COLORS[`default_${idx % 5}`] || '#6b7280';
};

// Format column name for display
const formatColName = (col: string): string => {
  return col
    .replace(/^total_/i, '')
    .replace(/_alerts?$/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

// Metric Card for single values
const SingleMetricCard = ({ value, label }: { value: number | string; label: string }) => (
  <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 text-center">
    <div className="text-3xl font-bold text-blue-700">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-sm text-blue-600 mt-1">{label}</div>
  </div>
);

// Multi-Metric Card for multiple values in single row
const MultiMetricCard = ({ row, columns }: { row: any; columns: string[] }) => (
  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
    {columns.map((col, idx) => {
      const val = row[col];
      const colors = ['blue', 'green', 'purple', 'amber', 'rose'];
      const color = colors[idx % colors.length];
      return (
        <div key={col} className={`bg-${color}-50 rounded-lg p-4 text-center border border-${color}-100`}>
          <div className={`text-xl font-bold text-${color}-700`}>
            {typeof val === 'number' ? val.toLocaleString() : val}
          </div>
          <div className={`text-xs text-${color}-600 mt-1`}>{formatColName(col)}</div>
        </div>
      );
    })}
  </div>
);

// Visual Metrics Card Component - now uses chart recommendation
const MetricsCard = ({ rawRows, grouping, chart }: { rawRows: any[]; grouping?: string; chart?: ChartRecommendation }) => {
  if (!rawRows || rawRows.length === 0) return null;

  const columns = Object.keys(rawRows[0] || {});
  
  // Handle metric_card type (single value)
  if (chart?.chart_type === 'metric_card' && rawRows.length === 1 && columns.length === 1) {
    const val = rawRows[0][columns[0]];
    return <SingleMetricCard value={val} label={formatColName(columns[0])} />;
  }
  
  // Handle multi_metric_card type (single row, multiple values)
  if (chart?.chart_type === 'multi_metric_card' && rawRows.length === 1) {
    const numericCols = columns.filter(c => typeof rawRows[0][c] === 'number');
    if (numericCols.length > 0) {
      return <MultiMetricCard row={rawRows[0]} columns={numericCols} />;
    }
  }
  
  if (columns.length < 2) return null;

  // Identify entity column (first text column) and numeric columns
  const entityCol = columns.find(c => typeof rawRows[0][c] === 'string') || columns[0];
  const numericCols = columns.filter(c => typeof rawRows[0][c] === 'number');
  
  // Filter out null entities
  const validRows = rawRows.filter(r => r[entityCol] && r[entityCol] !== 'null');
  const topEntries = validRows.slice(0, 6);

  // Detect if this is a multi-metric (stacked) scenario
  const isStacked = numericCols.length > 1;

  // Calculate totals
  const rowTotals = validRows.map(r => 
    numericCols.reduce((sum, col) => sum + (Number(r[col]) || 0), 0)
  );
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);
  const maxRowTotal = Math.max(...rowTotals.slice(0, topEntries.length), 1);

  // Determine title
  const title = grouping 
    ? `Performance by ${grouping.charAt(0).toUpperCase() + grouping.slice(1)}`
    : isStacked ? 'Alert Breakdown' : 'Results Summary';

  return (
    <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <span className="text-xs text-slate-500">Total: {formatNumber(grandTotal)}</span>
      </div>

      {/* Legend for stacked bars */}
      {isStacked && (
        <div className="px-4 pt-3 flex flex-wrap gap-3">
          {numericCols.map((col, idx) => (
            <div key={col} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: getSegmentColor(col, idx) }}
              />
              <span className="text-xs text-slate-600">{formatColName(col)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stacked Horizontal Bars */}
      <div className="p-4 space-y-3">
        {topEntries.map((row, rowIdx) => {
          const rowTotal = numericCols.reduce((sum, col) => sum + (Number(row[col]) || 0), 0);
          const barWidthPct = (rowTotal / maxRowTotal) * 100;
          
          return (
            <div key={rowIdx} className="space-y-1">
              {/* Entity name and total */}
              <div className="flex justify-between items-center">
                <span 
                  className="text-xs text-slate-700 font-medium truncate max-w-[60%]" 
                  title={row[entityCol]}
                >
                  {String(row[entityCol]).length > 25 
                    ? String(row[entityCol]).slice(0, 23) + '...' 
                    : row[entityCol]}
                </span>
                <span className="text-xs text-slate-500">{formatNumber(rowTotal)} total</span>
              </div>
              
              {/* Stacked bar */}
              <div 
                className="h-6 bg-slate-100 rounded overflow-hidden flex"
                style={{ width: `${barWidthPct}%`, minWidth: '40px' }}
              >
                {numericCols.map((col, colIdx) => {
                  const val = Number(row[col]) || 0;
                  const segmentPct = rowTotal > 0 ? (val / rowTotal) * 100 : 0;
                  if (segmentPct === 0) return null;
                  return (
                    <div
                      key={col}
                      className="h-full flex items-center justify-center text-[10px] text-white font-medium transition-all"
                      style={{ 
                        width: `${segmentPct}%`, 
                        backgroundColor: getSegmentColor(col, colIdx),
                        minWidth: segmentPct > 8 ? '24px' : '0'
                      }}
                      title={`${formatColName(col)}: ${formatNumber(val)}`}
                    >
                      {segmentPct > 12 && formatNumber(val)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary cards for single-metric view */}
      {!isStacked && topEntries.length > 0 && (
        <div className="px-4 pb-4 grid grid-cols-3 gap-2">
          {topEntries.slice(0, 3).map((row, idx) => {
            const value = Number(row[numericCols[0]]) || 0;
            const pct = grandTotal > 0 ? ((value / grandTotal) * 100).toFixed(1) : '0';
            return (
              <div key={idx} className="bg-slate-50 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 truncate" title={row[entityCol]}>
                  {String(row[entityCol]).slice(0, 15)}
                </div>
                <div className="text-lg font-bold text-slate-800">{formatNumber(value)}</div>
                <div className="text-[10px] text-slate-400">{pct}%</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {validRows.length > 6 && (
        <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 border-t border-slate-100">
          +{validRows.length - 6} more entries
        </div>
      )}
    </div>
  );
};

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
  
  // Show visual metrics card for bot responses with data
  const hasValidData = !isUser && (message.rawRows?.length ?? 0) > 0;
  const showMetricsCard = hasValidData && message.rawRows?.some(r => {
    const vals = Object.values(r);
    return vals.some(v => typeof v === 'number' && v > 0);
  });
  
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
            {/* Visual Metrics Card */}
            {showMetricsCard && (
              <MetricsCard rawRows={message.rawRows!} grouping={message.grouping} chart={message.chart} />
            )}
            {/* Raw data in collapsible */}
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
