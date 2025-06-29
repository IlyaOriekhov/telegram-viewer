import React, { useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiSearch,
  FiDownload,
  FiMessageSquare,
  FiUser,
  FiUsers,
  FiRadio,
  FiArrowDown,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import Button from "../UI/Button.jsx";
import Loading from "../UI/Loading.jsx";
import { TextLoading } from "../UI/Loading.jsx";
import { CHAT_TYPES, TELEGRAM_CONFIG } from "../../utils/constants.js";

const getChatIcon = (type) => {
  switch (type) {
    case CHAT_TYPES.USER:
      return <FiUser />;
    case CHAT_TYPES.GROUP:
      return <FiUsers />;
    case CHAT_TYPES.CHANNEL:
      return <FiRadio />;
    default:
      return <FiMessageSquare />;
  }
};

const MessageList = ({
  chat,
  messages = [],
  onBack,
  onLoadMessages,
  loading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const filteredMessages = messages.filter(
    (message) =>
      message.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.from_user &&
        message.from_user.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!isNearBottom);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Сьогодні о ${date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 2) {
      return `Вчора о ${date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays <= 7) {
      return date.toLocaleDateString("uk-UA", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getMessageType = (text) => {
    if (text.startsWith("[") && text.endsWith("]")) {
      return "media";
    }
    return "text";
  };

  // Використовуємо функцію для отримання іконки повідомлення
  const getMessageIcon = (text) => {
    if (text === "[Photo]") return "📷";
    if (text === "[Video]") return "🎥";
    if (text === "[Document]") return "📄";
    if (text === "[Voice message]") return "🎵";
    if (text === "[Sticker]") return "😊";
    if (text === "[Media/System message]") return "📎";
    return null; // Для звичайних текстових повідомлень
  };

  const handleRefresh = () => {
    onLoadMessages(chat.id, TELEGRAM_CONFIG.DEFAULT_MESSAGE_LIMIT);
  };

  const handleLoadMore = () => {
    onLoadMessages(chat.id, messages.length + 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="message-list">
        <Loading message="Завантаження повідомлень..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-list">
        <div className="message-header">
          <Button onClick={onBack} variant="ghost" icon="←">
            Назад
          </Button>
          <div className="chat-info">
            <h3>{chat.title}</h3>
          </div>
        </div>
        <div className="error-state">
          <span className="error-icon">
            <FiAlertCircle size={48} />
          </span>
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <Button
            onClick={handleRefresh}
            variant="primary"
            icon={<FiRefreshCw />}
          >
            Спробувати знову
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="message-header">
        <Button
          onClick={onBack}
          variant="ghost"
          icon={<FiArrowLeft />}
          className="back-btn"
        >
          Назад
        </Button>

        <div className="chat-info">
          <div className="chat-avatar">
            <span className="chat-icon">{getChatIcon(chat.type)}</span>
          </div>
          <div className="chat-details">
            <h3 className="chat-title">{chat.title}</h3>
            <span className="message-count">
              {filteredMessages.length} повідомлень
            </span>
          </div>
        </div>

        <div className="header-actions">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="small"
            loading={loading}
            icon={<FiRefreshCw />}
          >
            Оновити
          </Button>
        </div>
      </div>

      <div className="message-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук в повідомленнях..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FiSearch className="search-icon" />
        </div>

        {messages.length >= TELEGRAM_CONFIG.DEFAULT_MESSAGE_LIMIT && (
          <Button
            onClick={handleLoadMore}
            variant="ghost"
            size="small"
            loading={loading}
            icon={<FiDownload />}
          >
            Завантажити більше
          </Button>
        )}
      </div>

      {loading && messages.length > 0 && (
        <div className="loading-overlay">
          <TextLoading>Завантаження...</TextLoading>
        </div>
      )}

      <div
        className="messages-container"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <div className="no-results">
                <span className="empty-icon">
                  <FiSearch size={48} />
                </span>
                <h4>Нічого не знайдено</h4>
                <p>Спробуйте змінити пошуковий запит</p>
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="ghost"
                  icon={<FiX />}
                >
                  Очистити пошук
                </Button>
              </div>
            ) : (
              <div className="no-messages">
                <span className="empty-icon">
                  <FiMessageSquare size={48} />
                </span>
                <h4>Немає повідомлень</h4>
                <p>У цьому чаті поки немає повідомлень</p>
              </div>
            )}
          </div>
        ) : (
          <div className="messages">
            {filteredMessages.map((message) => {
              const messageIcon = getMessageIcon(message.text);
              return (
                <div
                  key={message.id}
                  className={`message-item ${getMessageType(message.text)} ${
                    selectedMessage === message.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    setSelectedMessage(
                      selectedMessage === message.id ? null : message.id
                    )
                  }
                >
                  <div className="message-content">
                    <div className="message-header">
                      <div className="message-sender">
                        <span className="sender-icon">
                          <FiUser />
                        </span>
                        <span className="sender-name">
                          {message.from_user || "Невідомо"}
                        </span>
                      </div>
                      <span className="message-date">
                        {formatDate(message.date)}
                      </span>
                    </div>

                    <div className="message-text">
                      {messageIcon && (
                        <span
                          className="message-icon"
                          style={{ marginRight: "8px" }}
                        >
                          {messageIcon}
                        </span>
                      )}
                      {message.text}
                    </div>

                    {selectedMessage === message.id && (
                      <div className="message-details">
                        <div className="detail-item">
                          <span className="detail-label">ID:</span>
                          <span className="detail-value">{message.id}</span>
                        </div>
                        {message.from_user_id && (
                          <div className="detail-item">
                            <span className="detail-label">User ID:</span>
                            <span className="detail-value">
                              {message.from_user_id}
                            </span>
                          </div>
                        )}
                        <div className="detail-item">
                          <span className="detail-label">Повна дата:</span>
                          <span className="detail-value">
                            {new Date(message.date).toLocaleString("uk-UA")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {showScrollToBottom && (
        <button
          className="scroll-to-bottom"
          onClick={scrollToBottom}
          title="Прокрутити вниз"
        >
          <FiArrowDown />
        </button>
      )}

      {filteredMessages.length > 0 && (
        <div className="message-list-footer">
          <div className="results-info">
            {searchTerm
              ? `Знайдено ${filteredMessages.length} з ${messages.length} повідомлень`
              : `${messages.length} повідомлень`}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
