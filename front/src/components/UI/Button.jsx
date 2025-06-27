import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses = "btn";
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    ghost: "btn-ghost",
    link: "btn-link",
  };

  const sizeClasses = {
    small: "btn-small",
    medium: "btn-medium",
    large: "btn-large",
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loading && "btn-loading",
    disabled && "btn-disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner">⏳</span>}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default Button;
