import React, { useState } from "react";
import { FiLock, FiUser, FiUserPlus, FiEdit } from "react-icons/fi";
import Button from "../UI/Button.jsx";
import Input from "../UI/Input.jsx";
import { AuthLayout } from "../Layout/Layout.jsx";
import { ERROR_MESSAGES } from "../../utils/constants.js";

const Register = ({
  onRegister,
  onSwitchToLogin,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Ім'я користувача обов'язкове";
    } else if (formData.username.length < 3) {
      errors.username = "Ім'я користувача повинно містити мінімум 3 символи";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        "Ім'я користувача може містити тільки букви, цифри та підкреслення";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Пароль обов'язковий";
    } else if (formData.password.length < 6) {
      errors.password = ERROR_MESSAGES.WEAK_PASSWORD;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Підтвердження пароля обов'язкове";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Паролі не співпадають";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const { confirmPassword: _confirmPassword, ...userData } = formData;
    const result = await onRegister(userData);

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

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { level: 0, text: "", color: "" },
      { level: 1, text: "Слабкий", color: "#ff4757" },
      { level: 2, text: "Задовільний", color: "#ffa502" },
      { level: 3, text: "Хороший", color: "#2ed573" },
      { level: 4, text: "Відмінний", color: "#1e90ff" },
      { level: 5, text: "Надійний", color: "#5f27cd" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h2>
            <FiEdit className="inline-icon" /> Реєстрація
          </h2>
          <p>Створіть новий акаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Ім'я користувача"
            type="text"
            placeholder="Введіть ім'я користувача"
            value={formData.username}
            onChange={handleInputChange("username")}
            error={formErrors.username}
            helper="Мінімум 3 символи, тільки букви, цифри та підкреслення"
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
            autoComplete="new-password"
            required
          />

          {formData.password && (
            <div className="password-strength">
              <div className="strength-indicator">
                <div
                  className="strength-bar"
                  style={{
                    width: `${(passwordStrength.level / 5) * 100}%`,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>
              <span
                className="strength-text"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.text}
              </span>
            </div>
          )}

          <Input
            label="Підтвердження пароля"
            type="password"
            placeholder="Повторіть пароль"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            error={formErrors.confirmPassword}
            icon={<FiLock />}
            autoComplete="new-password"
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
            icon={<FiUserPlus />}
            className="auth-submit-btn"
          >
            Зареєструватися
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Вже маєте акаунт?{" "}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="auth-switch-btn"
            >
              Увійти
            </Button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
