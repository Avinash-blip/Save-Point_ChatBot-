import { useState, useCallback, useRef, useEffect } from 'react';
import { Chat, Message } from '@/types/chat';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { sendChatMessage } from '@/utils/api';

export function useChat() {
  const [chats, setChats] = useLocalStorage<Chat[]>('ai-ops-chats', []);
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    chats.length > 0 ? chats[0].id : null
  );
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((c) => c.id === currentChatId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  }, [setChats]);

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        const remainingChats = chats.filter((c) => c.id !== chatId);
        setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
      }
    },
    [chats, currentChatId, setChats]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      let chatId = currentChatId;
      if (!chatId) {
        chatId = uuidv4();
        setCurrentChatId(chatId);
      }

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      const existingChat = chats.find((c) => c.id === chatId);
      const pendingHistory = [...(existingChat?.messages ?? []), userMessage];
      const historyPayload = pendingHistory
        .slice(-6)
        .map((message) => ({ role: message.role, content: message.content }));

      setChats((prev) => {
        const timestamp = new Date();
        const existingIndex = prev.findIndex((chat) => chat.id === chatId);

        if (existingIndex === -1) {
          const newChat: Chat = {
            id: chatId!,
            title: content.substring(0, 40) + (content.length > 40 ? '...' : ''),
            messages: [userMessage],
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          return [newChat, ...prev];
        }

        return prev.map((chat) => {
          if (chat.id === chatId) {
            const updatedMessages = [...chat.messages, userMessage];
            const title =
              chat.messages.length === 0
                ? content.substring(0, 40) + (content.length > 40 ? '...' : '')
                : chat.title;
            return {
              ...chat,
              messages: updatedMessages,
              title,
              updatedAt: timestamp,
            };
          }
          return chat;
        });
      });

      setIsTyping(true);

      // Call backend API
      try {
        const apiResponse = await sendChatMessage(content, historyPayload);
        const aiMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: apiResponse.summary || 'No summary returned.',
          timestamp: new Date(),
          metrics: apiResponse.metrics,
          timeRange: apiResponse.time_range,
          grouping: apiResponse.grouping,
          rawAnswer: apiResponse.insight_summary || apiResponse.raw_answer,
          rawRows: apiResponse.raw_rows,
          chart: apiResponse.chart,
        };
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, aiMessage],
                updatedAt: new Date(),
              };
            }
            return chat;
          })
        );
      } catch (err) {
        console.error('Failed to get AI response:', err);
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I could not process your request. Please try again.',
          timestamp: new Date(),
        };
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, errorMessage],
                updatedAt: new Date(),
              };
            }
            return chat;
          })
        );
      } finally {
        setIsTyping(false);
      }
    },
    [chats, currentChatId, setChats]
  );

  return {
    chats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    sendMessage,
    isTyping,
    messagesEndRef,
  };
}
