import React, { useState } from "react";
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import TelegramConnect from "./components/Telegram/TelegramConnect.jsx";
import ChatList from "./components/Telegram/ChatList.jsx";
import MessageList from "./components/Telegram/MessageList.jsx";
import Layout from "./components/Layout/Layout.jsx";
import Loading from "./components/UI/Loading.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useTelegram } from "./hooks/useTelegram.js";
import "./styles/globals.css";

const App = () => {
  // Auth state
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    error: authError,
    login,
    register,
    logout,
    clearError: clearAuthError,
  } = useAuth();

  // Telegram state - передаємо isAuthenticated
  const {
    isConnected: telegramConnected,
    status: telegramStatus,
    chats,
    messages,
    loading: telegramLoading,
    error: telegramError,
    connect: telegramConnect,
    verify: telegramVerify,
    disconnect: telegramDisconnect,
    loadChats,
    loadMessages,
    clearError: clearTelegramError,
    clearMessages,
  } = useTelegram(isAuthenticated); // Передаємо стан аутентифікації

  // UI state
  const [showRegister, setShowRegister] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  // Handle auth actions
  const handleLogin = async (credentials) => {
    clearAuthError();
    const result = await login(credentials);
    if (result.success) {
      setShowRegister(false);
    }
    return result;
  };

  const handleRegister = async (userData) => {
    clearAuthError();
    const result = await register(userData);
    if (result.success) {
      setShowRegister(false);
    }
    return result;
  };

  const handleLogout = async () => {
    await logout();
    setSelectedChat(null);
  };

  // Handle Telegram actions
  const handleTelegramConnect = async (data) => {
    clearTelegramError();

    if (typeof data === "string") {
      // Phone number step
      const result = await telegramConnect(data);
      return result;
    } else {
      // Verification step
      const result = await telegramVerify(data);
      if (result.success && result.message?.includes("successfully")) {
        await loadChats();
      }
      return result;
    }
  };

  const handleTelegramDisconnect = async () => {
    const result = await telegramDisconnect();
    if (result.success) {
      setSelectedChat(null);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    clearMessages();
    loadMessages(chat.id);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    clearMessages();
  };

  const handleRefreshChats = () => {
    loadChats();
  };

  const handleLoadMessages = (chatId, limit) => {
    loadMessages(chatId, limit);
  };

  // Show loading screen on initial auth check
  if (authLoading) {
    return <Loading fullScreen message="Ініціалізація..." />;
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
        loading={authLoading}
        error={authError}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Main app content
  const renderMainContent = () => {
    if (!telegramConnected) {
      return (
        <TelegramConnect
          onConnect={handleTelegramConnect}
          onConnected={() => loadChats()}
          loading={telegramLoading}
          error={telegramError}
        />
      );
    }

    if (selectedChat) {
      return (
        <MessageList
          chat={selectedChat}
          messages={messages}
          onBack={handleBackToChats}
          onLoadMessages={handleLoadMessages}
          loading={telegramLoading}
          error={telegramError}
        />
      );
    }

    return (
      <ChatList
        chats={chats}
        onChatSelect={handleChatSelect}
        onRefresh={handleRefreshChats}
        loading={telegramLoading}
        error={telegramError}
      />
    );
  };

  return (
    <Layout
      user={user}
      telegramStatus={telegramStatus}
      onTelegramDisconnect={handleTelegramDisconnect}
      onLogout={handleLogout}
    >
      {renderMainContent()}
    </Layout>
  );
};

export default App;
