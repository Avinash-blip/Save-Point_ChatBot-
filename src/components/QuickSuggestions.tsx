import { Tag } from 'antd';

interface QuickSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
}

const suggestions = [
  'Show me delayed trips from last week',
  'Who is the top transporter?',
  'Count total trips today',
  'Trips with route deviations',
  'Average delivery time analysis',
  'Alert summary for last 30 days',
];

const QuickSuggestions = ({ onSelectSuggestion }: QuickSuggestionsProps) => {
  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {suggestions.map((suggestion, index) => (
          <Tag
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="cursor-pointer px-4 py-2 rounded-full bg-chip-bg hover:bg-primary hover:text-primary-foreground transition-all duration-300 whitespace-nowrap text-sm border-0 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            {suggestion}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;
