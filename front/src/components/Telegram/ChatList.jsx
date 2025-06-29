import React, { useState } from "react";
import {
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
  FiRadio,
  FiArrowRight,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";
import Button from "../UI/Button.jsx";
import Loading from "../UI/Loading.jsx";
import { TextLoading } from "../UI/Loading.jsx";
import { CHAT_TYPES } from "../../utils/constants.js";

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

const ChatList = ({
  chats = [],
  onChatSelect,
  onRefresh,
  loading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent, name, unread

  const filteredChats = chats
    .filter((chat) => {
      // Search filter
      const matchesSearch = chat.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = filterType === "all" || chat.type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "unread":
          return (b.unread_count || 0) - (a.unread_count || 0);
        case "recent":
        default:
          return 0; // Keep original order (most recent from API)
      }
    });

  const getChatTypeLabel = (type) => {
    const labels = {
      [CHAT_TYPES.USER]: "Особисті",
      [CHAT_TYPES.GROUP]: "Групи",
      [CHAT_TYPES.CHANNEL]: "Канали",
    };
    return labels[type] || type;
  };

  const getUnreadCount = () => {
    return chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  };

  const getChatStats = () => {
    const stats = {
      total: chats.length,
      users: chats.filter((chat) => chat.type === CHAT_TYPES.USER).length,
      groups: chats.filter((chat) => chat.type === CHAT_TYPES.GROUP).length,
      channels: chats.filter((chat) => chat.type === CHAT_TYPES.CHANNEL).length,
      unread: getUnreadCount(),
    };
    return stats;
  };

  const stats = getChatStats();

  if (loading && chats.length === 0) {
    return (
      <div className="chat-list">
        <Loading message="Завантаження чатів..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list">
        <div className="error-state">
          <span className="error-icon">
            <FiAlertCircle size={48} />
          </span>
          <h3>Помилка завантаження</h3>
          <p>{error}</p>
          <Button onClick={onRefresh} variant="primary" icon={<FiRefreshCw />}>
            Спробувати знову
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <div className="header-title">
          <h3>
            <FiMessageSquare className="inline-icon" /> Чати
          </h3>
          <div className="chat-stats">
            <span className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">всього</span>
            </span>
            {stats.unread > 0 && (
              <span className="stat-item unread">
                <span className="stat-number">{stats.unread}</span>
                <span className="stat-label">непрочитаних</span>
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={onRefresh}
          variant="ghost"
          size="small"
          loading={loading}
          icon={<FiRefreshCw />}
          className="refresh-btn"
        >
          Оновити
        </Button>
      </div>

      <div className="chat-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Пошук чатів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FiSearch className="search-icon" />
        </div>

        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Всі типи</option>
            <option value={CHAT_TYPES.USER}>Особисті</option>
            <option value={CHAT_TYPES.GROUP}>Групи</option>
            <option value={CHAT_TYPES.CHANNEL}>Канали</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">За часом</option>
            <option value="name">За назвою</option>
            <option value="unread">За непрочитаними</option>
          </select>
        </div>
      </div>

      {loading && chats.length > 0 && (
        <div className="loading-overlay">
          <TextLoading>Оновлення...</TextLoading>
        </div>
      )}

      <div className="chat-items">
        {filteredChats.length === 0 ? (
          <div className="empty-state">
            {searchTerm || filterType !== "all" ? (
              <div className="no-results">
                <span className="empty-icon">
                  <FiSearch size={48} />
                </span>
                <h4>Нічого не знайдено</h4>
                <p>Спробуйте змінити пошуковий запит або фільтри</p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  variant="ghost"
                  icon={<FiX />}
                >
                  Скинути фільтри
                </Button>
              </div>
            ) : (
              <div className="no-chats">
                <span className="empty-icon">
                  <FiMessageSquare size={48} />
                </span>
                <h4>Немає чатів</h4>
                <p>Схоже, у вас поки немає чатів в Telegram</p>
              </div>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => onChatSelect(chat)}
            >
              <div className="chat-avatar">
                <span className="chat-icon">{getChatIcon(chat.type)}</span>
              </div>

              <div className="chat-content">
                <div className="chat-header">
                  <h4 className="chat-title">{chat.title}</h4>
                  {chat.unread_count > 0 && (
                    <span className="unread-badge">
                      {chat.unread_count > 99 ? "99+" : chat.unread_count}
                    </span>
                  )}
                </div>

                <div className="chat-meta">
                  <span className="chat-type">
                    {getChatTypeLabel(chat.type)}
                  </span>
                  <span className="chat-arrow">
                    <FiArrowRight />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredChats.length > 0 && (
        <div className="chat-list-footer">
          <div className="results-info">
            Показано {filteredChats.length} з {chats.length} чатів
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
