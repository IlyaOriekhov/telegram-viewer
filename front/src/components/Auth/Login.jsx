import React, { useState } from "react";
import { FiLock, FiUser, FiLogIn } from "react-icons/fi";
import Button from "../UI/Button.jsx";
import Input from "../UI/Input.jsx";
import { AuthLayout } from "../Layout/Layout.jsx";

const Login = ({
  onLogin,
  onSwitchToRegister,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Ім'я користувача обов'язкове";
    }

    if (!formData.password) {
      errors.password = "Пароль обов'язковий";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await onLogin(formData);

    if (!result.success) {
      setFormErrors({ general: result.error });
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            <FiLock className="inline-icon" /> Вхід до системи
          </h2>
          <p>Введіть свої дані для входу</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Ім'я користувача"
            type="text"
            placeholder="Введіть ім'я користувача"
            value={formData.username}
            onChange={handleInputChange("username")}
            error={formErrors.username}
            icon={<FiUser />}
            autoComplete="username"
            required
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="Введіть пароль"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={formErrors.password}
            icon={<FiLock />}
            autoComplete="current-password"
            required
          />

          {(error || formErrors.general) && (
            <div className="form-error"> {error || formErrors.general}</div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            icon={<FiLogIn />}
            className="auth-submit-btn"
          >
            Увійти
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Немає акаунту?{" "}
            <Button
              variant="link"
              onClick={onSwitchToRegister}
              className="auth-switch-btn"
            >
              Зареєструватися
            </Button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
