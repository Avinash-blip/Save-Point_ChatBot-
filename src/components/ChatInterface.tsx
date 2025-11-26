import { Empty, Switch, Drawer, Button } from 'antd';
import { BulbOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { useChat } from '@/hooks/useChat';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import QuickSuggestions from './QuickSuggestions';
import TypingIndicator from './TypingIndicator';

const ChatInterface = () => {
  const {
    chats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    sendMessage,
    isTyping,
    messagesEndRef,
  } = useChat();

  const { isDark, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleNewChat = () => {
    createNewChat();
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const sidebarContent = (
    <ChatSidebar
      chats={chats}
      currentChatId={currentChatId}
      onSelectChat={handleSelectChat}
      onNewChat={handleNewChat}
      onDeleteChat={deleteChat}
    />
  );

  return (
    <div className="flex h-screen w-full bg-slate-100">
      {isMobile ? (
        <>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            className="absolute top-4 left-4 z-30 text-foreground bg-white/80 backdrop-blur rounded-full shadow"
          />
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width="80%"
            styles={{ body: { padding: 0 } }}
          >
            {sidebarContent}
          </Drawer>
        </>
      ) : (
        <div className="w-[300px] bg-chat-sidebar border-r border-border flex-shrink-0 h-screen flex flex-col">
          {sidebarContent}
        </div>
      )}

      <div className="flex-1 flex flex-col bg-white relative h-screen overflow-hidden">
        <header className="flex-shrink-0 border-b border-border bg-white px-6 py-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BulbOutlined className="text-primary text-2xl" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Current Chat</p>
              <h2 className="text-lg font-semibold text-slate-900">
                {currentChat?.title || 'New Conversation'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewChat}
              className="hidden sm:inline-flex"
            >
              New Chat
            </Button>
          </div>
        </header>

        <QuickSuggestions
          onSelectSuggestion={handleSelectSuggestion}
          className="border-b border-border bg-white px-6"
        />

        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6 space-y-4">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Empty
                description={
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground mb-2">
                      Start a conversation
                    </p>
                    <p className="text-muted-foreground">
                      Ask about trips, transporters, routes, or any logistics data
                    </p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              {currentChat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <MessageInput
          onSend={sendMessage}
          disabled={isTyping}
          className="sticky bottom-0 left-0 right-0"
        />
      </div>
    </div>
  );
};

export default ChatInterface;
