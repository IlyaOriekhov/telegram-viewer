import React from "react";
import { Button } from "../UI";
import { APP_CONFIG } from "../../utils/constants";

const Header = ({ user, telegramStatus, onTelegramDisconnect, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">📱 {APP_CONFIG.NAME}</h1>

        {telegramStatus?.connected && (
          <div className="telegram-status">
            <span className="status-indicator">✅</span>
            <span className="status-text">{telegramStatus.phone_number}</span>
          </div>
        )}
      </div>

      <div className="header-center">
        {user && (
          <div className="user-info">
            <span className="user-greeting">
              Привіт, <strong>{user.username}</strong>! 👋
            </span>
          </div>
        )}
      </div>

      <div className="header-actions">
        {telegramStatus?.connected && (
          <Button
            variant="ghost"
            size="small"
            icon="📱"
            onClick={onTelegramDisconnect}
            className="disconnect-btn"
          >
            Від'єднати
          </Button>
        )}

        <Button
          variant="ghost"
          size="small"
          icon="🚪"
          onClick={onLogout}
          className="logout-btn"
        >
          Вийти
        </Button>
      </div>
    </header>
  );
};

export default Header;
