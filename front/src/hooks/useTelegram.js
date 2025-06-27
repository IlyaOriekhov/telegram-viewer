import { useState, useEffect, useCallback } from "react";
import { telegramAPI } from "../services/api.js";
import { SUCCESS_MESSAGES, TELEGRAM_CONFIG } from "../utils/constants.js";

export const useTelegram = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check Telegram connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const statusData = await telegramAPI.getStatus();
      setStatus(statusData);
      setIsConnected(statusData.connected);
      return statusData;
    } catch (error) {
      console.error("Failed to check Telegram status:", error);
      setError(error.message);
      return null;
    }
  }, []);

  const connect = useCallback(async (phoneNumber) => {
    setLoading(true);
    setError(null);

    try {
      const response = await telegramAPI.connect({ phone_number: phoneNumber });
      return { success: true, data: response };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const verify = useCallback(
    async (verificationData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await telegramAPI.verify(verificationData);

        if (response.message?.includes("successfully")) {
          setIsConnected(true);
          await checkStatus();
          return {
            success: true,
            message: SUCCESS_MESSAGES.TELEGRAM_CONNECTED,
            data: response,
          };
        }

        return { success: true, data: response };
      } catch (error) {
        setError(error.message);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [checkStatus]
  );

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await telegramAPI.disconnect();
      setIsConnected(false);
      setStatus(null);
      setChats([]);
      setMessages([]);
      return { success: true, message: SUCCESS_MESSAGES.TELEGRAM_DISCONNECTED };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const chatsData = await telegramAPI.getChats();
      setChats(chatsData);
      return { success: true, data: chatsData };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (chatId, limit = TELEGRAM_CONFIG.DEFAULT_MESSAGE_LIMIT) => {
      setLoading(true);
      setError(null);

      try {
        const messagesData = await telegramAPI.getMessages(chatId, limit);
        setMessages(messagesData);
        return { success: true, data: messagesData };
      } catch (error) {
        setError(error.message);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    status,
    chats,
    messages,
    loading,
    error,
    connect,
    verify,
    disconnect,
    loadChats,
    loadMessages,
    checkStatus,
    clearError,
    clearMessages,
  };
};
