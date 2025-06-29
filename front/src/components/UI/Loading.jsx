import React from "react";
import { FiLoader } from "react-icons/fi";

const Loading = ({
  message = "Завантаження...",
  size = "medium",
  variant = "default",
  fullScreen = false,
}) => {
  const spinnerClasses = [
    "loading-spinner",
    `loading-${size}`,
    `loading-${variant}`,
  ]
    .filter(Boolean)
    .join(" ");

  const containerClasses = [
    "loading-container",
    fullScreen && "loading-fullscreen",
  ]
    .filter(Boolean)
    .join(" ");

  const LoadingContent = () => (
    <div className={containerClasses}>
      <div className="loading-content">
        <div className={spinnerClasses}>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        {message && <div className="loading-message">{message}</div>}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

// Spinner variants
export const Spinner = ({ size = "small", className = "" }) => (
  <div className={`loading-spinner loading-${size} ${className}`}>
    <div className="spinner-circle"></div>
    <div className="spinner-circle"></div>
    <div className="spinner-circle"></div>
  </div>
);

// Simple text loading
export const TextLoading = ({
  children = "Завантаження...",
  icon = <FiLoader />,
}) => (
  <div className="text-loading">
    <span className="loading-icon">{icon}</span>
    <span className="loading-text">{children}</span>
  </div>
);

export default Loading;
