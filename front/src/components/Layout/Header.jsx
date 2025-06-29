import React from "react";
import { FiSmartphone, FiLogOut, FiCheckCircle, FiUser } from "react-icons/fi";
import Button from "../UI/Button.jsx";
import { APP_CONFIG } from "../../utils/constants.js";

const Header = ({ user, telegramStatus, onTelegramDisconnect, onLogout }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">
          <FiSmartphone className="inline-icon" /> {APP_CONFIG.NAME}
        </h1>

        {telegramStatus?.connected && (
          <div className="telegram-status">
            <span className="status-indicator">
              <FiCheckCircle />
            </span>
            <span className="status-text">{telegramStatus.phone_number}</span>
          </div>
        )}
      </div>

      <div className="header-center">
        {user && (
          <div className="user-info">
            <span className="user-greeting">
              <FiUser className="inline-icon" /> Привіт,{" "}
              <strong>{user.username}</strong>!
            </span>
          </div>
        )}
      </div>

      <div className="header-actions">
        {telegramStatus?.connected && (
          <Button
            variant="ghost"
            size="small"
            icon={<FiSmartphone />}
            onClick={onTelegramDisconnect}
            className="disconnect-btn"
          >
            Від'єднати
          </Button>
        )}

        <Button
          variant="ghost"
          size="small"
          icon={<FiLogOut />}
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
