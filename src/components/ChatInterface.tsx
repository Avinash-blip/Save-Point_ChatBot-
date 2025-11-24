import { Empty, Layout, Switch, Drawer, Button } from 'antd';
import { BulbOutlined, MenuOutlined } from '@ant-design/icons';
import { useChat } from '@/hooks/useChat';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import QuickSuggestions from './QuickSuggestions';
import TypingIndicator from './TypingIndicator';

const { Header, Content, Sider } = Layout;

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
    <Layout className="min-h-screen w-full">
      <Header className="bg-card border-b border-border px-4 flex items-center justify-between h-16 sticky top-0 z-10 shadow-sm">
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            className="text-foreground"
          />
        )}
        <div className="flex items-center gap-2 flex-1 justify-center md:justify-start">
          <BulbOutlined className="text-primary text-2xl" />
          <h1 className="text-xl font-bold text-foreground hidden md:block">
            AI Ops Copilot
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {isDark ? 'Dark' : 'Light'}
          </span>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />
        </div>
      </Header>

      <Layout className="flex-1">
        {isMobile ? (
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width="80%"
            styles={{ body: { padding: 0 } }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <Sider width="30%" className="bg-chat-sidebar min-w-[300px] max-w-[400px]">
            {sidebarContent}
          </Sider>
        )}

        <Layout className="flex-1 flex flex-col">
          <Content className="flex-1 overflow-y-auto bg-background">
            <div className="h-full flex flex-col">
              {!currentChat || currentChat.messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
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
                <div className="flex-1 p-6 space-y-4">
                  {currentChat.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isTyping && (
                    <div className="flex items-end gap-2 mb-4">
                      <TypingIndicator />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </Content>

          <QuickSuggestions onSelectSuggestion={handleSelectSuggestion} />
          <MessageInput onSend={sendMessage} disabled={isTyping} />
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ChatInterface;
