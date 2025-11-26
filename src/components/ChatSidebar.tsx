import { Chat } from '@/types/chat';
import { List, Button, Empty, Typography, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { format, isToday, isYesterday } from 'date-fns';

const { Text } = Typography;

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const ChatSidebar = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) => {
  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const buildTitle = (chat: Chat) => {
    if (chat.messages.length === 0) return 'New Conversation';
    const firstUserMessage =
      chat.messages.find((msg) => msg.role === 'user')?.content || chat.messages[0].content;
    const words = firstUserMessage.split(/\s+/);
    const truncated = words.slice(0, 12).join(' ');
    return truncated + (words.length > 12 ? '…' : '');
  };

  return (
    <div className="h-full flex flex-col bg-chat-sidebar border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-primary text-xl" />
            <h1 className="text-lg font-semibold text-foreground">AI Ops Copilot</h1>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onNewChat}
          block
          className="shadow-sm"
        >
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <Empty
            description="No conversations yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="mt-8"
          />
        ) : (
          <List
            dataSource={chats}
            renderItem={(chat) => {
              const isActive = chat.id === currentChatId;
              const lastMessage = chat.messages.at(-1);
              const preview = lastMessage
                ? lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '…' : '')
                : 'No messages yet';
              const timestamp = formatTimestamp(new Date(chat.updatedAt));

              return (
                <List.Item
                  key={chat.id}
                  className={`cursor-pointer transition-all duration-200 border-b border-border hover:bg-chat-sidebar-hover group ${
                    isActive ? 'bg-white border-l-4 border-l-primary shadow-sm' : ''
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                  style={{ padding: '12px 16px' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Text
                        strong
                        className={`text-sm truncate ${
                          isActive ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {buildTitle(chat)}
                      </Text>
                      <Popconfirm
                        title="Delete this chat?"
                        description="This action cannot be undone."
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                    <Text className="text-xs text-muted-foreground block truncate">
                      {preview}
                    </Text>
                    <Text className="text-xs text-muted-foreground block mt-1">
                      {timestamp}
                    </Text>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
