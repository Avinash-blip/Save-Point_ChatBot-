import { Message } from '@/types/chat';
import { Avatar } from 'antd';
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

  return (
    <div
      className={`flex items-end gap-2 mb-4 animate-fade-in ${
        isUser ? 'flex-row-reverse ml-auto' : 'flex-row'
      } max-w-[75%] ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <Avatar
        size={32}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        className={`flex-shrink-0 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      />
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-lg shadow-sm transition-all duration-300 ${
            isUser
              ? 'bg-chat-user text-foreground rounded-br-none'
              : 'bg-chat-ai text-foreground border border-border rounded-bl-none'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">{timestamp}</span>
      </div>
    </div>
  );
};

export default MessageBubble;
