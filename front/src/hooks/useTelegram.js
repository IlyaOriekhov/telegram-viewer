import { useState, useEffect, useCallback } from "react";
import { telegramAPI } from "../services/api.js";
import { SUCCESS_MESSAGES, TELEGRAM_CONFIG } from "../utils/constants.js";

export const useTelegram = (isAuthenticated = false) => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check Telegram connection status only when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkStatus();
    } else {
      // Reset state when user is not authenticated
      setIsConnected(false);
      setStatus(null);
      setChats([]);
      setMessages([]);
      setError(null);
    }
  }, [isAuthenticated]);

  const checkStatus = useCallback(async () => {
    // Don't check status if user is not authenticated
    if (!isAuthenticated) {
      return null;
    }

    try {
      const statusData = await telegramAPI.getStatus();
      setStatus(statusData);
      setIsConnected(statusData.connected);
      return statusData;
    } catch (error) {
      console.error("Failed to check Telegram status:", error);

      // Don't set error for authentication issues
      if (
        error.message.includes("authenticated") ||
        error.message.includes("401")
      ) {
        console.log("User not authenticated, skipping Telegram status check");
        return null;
      }

      setError(error.message);
      return null;
    }
  }, [isAuthenticated]);

  const connect = useCallback(
    async (phoneNumber) => {
      if (!isAuthenticated) {
        return { success: false, error: "User not authenticated" };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await telegramAPI.connect({
          phone_number: phoneNumber,
        });
        return { success: true, data: response };
      } catch (error) {
        setError(error.message);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const verify = useCallback(
    async (verificationData) => {
      if (!isAuthenticated) {
        return { success: false, error: "User not authenticated" };
      }

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
    [checkStatus, isAuthenticated]
  );

  const disconnect = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false, error: "User not authenticated" };
    }

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
  }, [isAuthenticated]);

  const loadChats = useCallback(async () => {
    if (!isAuthenticated) {
      return { success: false, error: "User not authenticated" };
    }

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
  }, [isAuthenticated]);

  const loadMessages = useCallback(
    async (chatId, limit = TELEGRAM_CONFIG.DEFAULT_MESSAGE_LIMIT) => {
      if (!isAuthenticated) {
        return { success: false, error: "User not authenticated" };
      }

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
    [isAuthenticated]
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
