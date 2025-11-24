const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 px-4 py-3 bg-chat-ai rounded-lg max-w-[70px] shadow-sm border border-border">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 rounded-full bg-muted-foreground animate-typing"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 rounded-full bg-muted-foreground animate-typing"
          style={{ animationDelay: '200ms' }}
        />
        <div
          className="w-2 h-2 rounded-full bg-muted-foreground animate-typing"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
};

export default TypingIndicator;
