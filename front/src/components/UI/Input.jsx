import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helper,
      icon,
      size = "medium",
      variant = "default",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = [
      "input",
      `input-${size}`,
      `input-${variant}`,
      error && "input-error",
      icon && "input-with-icon",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="input-group">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}

        <div className="input-wrapper">
          {icon && <span className="input-icon">{icon}</span>}
          <input ref={ref} id={inputId} className={inputClasses} {...props} />
        </div>

        {helper && !error && <div className="input-helper">{helper}</div>}

        {error && <div className="input-error-message">❌ {error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
