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

  // Use a ref to always have the latest chats without stale closure issues
  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const currentChat = chats.find((c) => c.id === currentChatId);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages?.length, scrollToBottom]);

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
      setChats((prev) => {
        const remaining = prev.filter((c) => c.id !== chatId);
        // Update currentChatId if we deleted the current chat
        if (currentChatId === chatId) {
          setTimeout(() => {
            setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
          }, 0);
        }
        return remaining;
      });
    },
    [currentChatId, setChats]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Determine or create chat ID
      let chatId = currentChatId;
      const timestamp = new Date();
      
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp,
      };

      // Add user message immediately
      setChats((prev) => {
        // If no current chat, create a new one with the user message
        if (!chatId) {
          chatId = uuidv4();
          // Schedule setting the current chat ID
          setTimeout(() => setCurrentChatId(chatId!), 0);
          const newChat: Chat = {
            id: chatId,
            title: content.substring(0, 40) + (content.length > 40 ? '...' : ''),
            messages: [userMessage],
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          return [newChat, ...prev];
        }

        // Otherwise, append to existing chat
        return prev.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 
                ? content.substring(0, 40) + (content.length > 40 ? '...' : '')
                : chat.title,
              updatedAt: timestamp,
            };
          }
          return chat;
        });
      });

      // Build history from the ref to get latest state
      const currentChats = chatsRef.current;
      const existingChat = currentChats.find((c) => c.id === chatId);
      const historyPayload = [...(existingChat?.messages ?? []), userMessage]
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      setIsTyping(true);

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
        
        // Append AI response - use functional update to get latest state
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === chatId) {
              // Ensure we don't duplicate - check if last message is already this AI message
              const lastMsg = chat.messages[chat.messages.length - 1];
              if (lastMsg?.id === aiMessage.id) {
                return chat;
              }
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
    [currentChatId, setChats]
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

function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (message.includes('delay') || message.includes('late')) {
    return 'Based on the analytics, I found 23 delayed trips from last week. The average delay was 45 minutes, with the primary causes being traffic congestion (40%) and loading delays (35%). The Delhi-Mumbai route had the highest delay frequency.';
  }

  if (message.includes('transporter') || message.includes('top')) {
    return 'The top transporter this month is Express Logistics with 450 completed trips and a 98.5% on-time delivery rate. They lead in both volume and reliability metrics.';
  }

  if (message.includes('total trips') || message.includes('count')) {
    return 'Today, there are 87 active trips in progress and 156 trips completed. The total trip count for the current month is 3,420 trips across all routes.';
  }

  if (message.includes('route deviation') || message.includes('deviation')) {
    return 'I detected 15 trips with significant route deviations this week. The most common reasons were road closures (8 trips) and weather conditions (5 trips). All drivers provided valid justifications.';
  }

  if (message.includes('delivery time') || message.includes('average')) {
    return 'The average delivery time across all routes is 6.2 hours, which is 12% better than last month. The Chennai-Bangalore route has the best performance with an average of 4.8 hours.';
  }

  if (message.includes('alert') || message.includes('summary')) {
    return 'In the last 30 days, there were 45 alerts generated: 18 for speed violations, 12 for extended stops, 8 for route deviations, and 7 for late arrivals. The alert rate has decreased by 15% compared to the previous month.';
  }

  return 'I\'ve analyzed your query. The data shows normal operations across all metrics. Let me know if you need specific details about trips, transporters, routes, or any other logistics data.';
}
