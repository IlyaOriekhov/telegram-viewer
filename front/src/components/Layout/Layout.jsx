import React from "react";
import Header from "./Header.jsx";
import { APP_CONFIG } from "../../utils/constants.js";

const Layout = ({
  children,
  user,
  telegramStatus,
  onTelegramDisconnect,
  onLogout,
  showHeader = true,
}) => {
  return (
    <div className="app-layout">
      {showHeader && (
        <Header
          user={user}
          telegramStatus={telegramStatus}
          onTelegramDisconnect={onTelegramDisconnect}
          onLogout={onLogout}
        />
      )}

      <main className="app-main">
        <div className="main-content">{children}</div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span className="footer-text">
            {APP_CONFIG.NAME} v{APP_CONFIG.VERSION}
          </span>
          <span className="footer-divider">•</span>
          <span className="footer-author">
            Made with ❤️ by {APP_CONFIG.AUTHOR}
          </span>
        </div>
      </footer>
    </div>
  );
};

// Simple layout without header/footer for auth pages
export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="auth-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
