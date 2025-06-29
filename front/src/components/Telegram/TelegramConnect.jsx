import React, { useState } from "react";
import {
  FiSmartphone,
  FiSend,
  FiCheck,
  FiShield,
  FiLock,
  FiArrowLeft,
  FiUnlock,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiHash,
} from "react-icons/fi";
import Button from "../UI/Button.jsx";
import Input from "../UI/Input.jsx";
import { TELEGRAM_CONFIG, ERROR_MESSAGES } from "../../utils/constants.js";

const TelegramConnect = ({
  onConnect,
  onConnected,
  loading = false,
  error = null,
}) => {
  const [step, setStep] = useState("phone"); // phone, code, password
  const [formData, setFormData] = useState({
    phone_number: "",
    code: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validatePhoneNumber = (phone) => {
    // Basic phone validation - starts with + and has 7-15 digits
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(formData.phone_number)) {
      setFormErrors({ phone: ERROR_MESSAGES.INVALID_PHONE });
      return;
    }

    setFormErrors({});
    const result = await onConnect(formData.phone_number);

    if (result.success && result.data.requires_code) {
      setStep("code");
    } else if (!result.success) {
      setFormErrors({ phone: result.error });
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      setFormErrors({ code: "Код підтвердження обов'язковий" });
      return;
    }

    setFormErrors({});
    const verifyData = {
      phone_number: formData.phone_number,
      code: formData.code,
      password: formData.password || undefined,
    };

    const result = await onConnect(verifyData);

    if (result.success) {
      if (result.data.requires_password) {
        setStep("password");
      } else if (
        result.message?.includes("successfully") ||
        result.data.message?.includes("successfully")
      ) {
        onConnected();
      }
    } else {
      setFormErrors({ code: result.error });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password.trim()) {
      setFormErrors({ password: "Пароль 2FA обов'язковий" });
      return;
    }

    setFormErrors({});
    const verifyData = {
      phone_number: formData.phone_number,
      code: formData.code,
      password: formData.password,
    };

    const result = await onConnect(verifyData);

    if (
      result.success &&
      (result.message?.includes("successfully") ||
        result.data.message?.includes("successfully"))
    ) {
      onConnected();
    } else if (!result.success) {
      setFormErrors({ password: result.error });
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

  const handleBackToPhone = () => {
    setStep("phone");
    setFormData((prev) => ({ ...prev, code: "", password: "" }));
    setFormErrors({});
  };

  return (
    <div className="telegram-connect">
      <div className="connect-header">
        <h3>
          <FiSmartphone className="inline-icon" /> Підключення до Telegram
        </h3>
        <p>
          Підключіть свій Telegram акаунт для перегляду чатів та повідомлень
        </p>
      </div>

      <div className="connect-steps">
        <div
          className={`step ${
            step === "phone" ? "active" : step !== "phone" ? "completed" : ""
          }`}
        >
          <span className="step-number">1</span>
          <span className="step-text">Номер телефону</span>
        </div>
        <div
          className={`step ${
            step === "code" ? "active" : step === "password" ? "completed" : ""
          }`}
        >
          <span className="step-number">2</span>
          <span className="step-text">Код підтвердження</span>
        </div>
        {step === "password" && (
          <div className="step active">
            <span className="step-number">3</span>
            <span className="step-text">2FA пароль</span>
          </div>
        )}
      </div>

      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="connect-form">
          <Input
            label="Номер телефону"
            type="tel"
            placeholder="+380123456789"
            value={formData.phone_number}
            onChange={handleInputChange("phone_number")}
            error={formErrors.phone}
            helper="Введіть номер в міжнародному форматі (з кодом країни)"
            icon={<FiSmartphone />}
            required
          />

          <div className="form-info">
            <div className="info-item">
              <span className="info-icon">
                <FiInfo />
              </span>
              <span className="info-text">
                Telegram надішле код підтвердження на ваш номер
              </span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            icon={<FiSend />}
            className="connect-btn"
          >
            Надіслати код
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleCodeSubmit} className="connect-form">
          <div className="success-message">
            <span className="success-icon">
              <FiCheckCircle />
            </span>
            <div className="success-content">
              <h4>Код надіслано!</h4>
              <p>Перевірте повідомлення на номері {formData.phone_number}</p>
            </div>
          </div>

          <Input
            label="Код підтвердження"
            type="text"
            placeholder="12345"
            value={formData.code}
            onChange={handleInputChange("code")}
            error={formErrors.code}
            helper="Введіть 5-значний код з SMS або Telegram"
            icon={<FiHash />}
            maxLength={5}
            required
          />

          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToPhone}
              icon={<FiArrowLeft />}
            >
              Змінити номер
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<FiCheck />}
            >
              Підтвердити
            </Button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="connect-form">
          <div className="info-message">
            <span className="info-icon">
              <FiShield />
            </span>
            <div className="info-content">
              <h4>Двофакторна аутентифікація</h4>
              <p>Введіть пароль 2FA для завершення підключення</p>
            </div>
          </div>

          <Input
            label="Пароль 2FA"
            type="password"
            placeholder="Ваш пароль двофакторної аутентифікації"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={formErrors.password}
            helper="Це пароль який ви встановили для Cloud Password в Telegram"
            icon={<FiShield />}
            required
          />

          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToPhone}
              icon={<FiArrowLeft />}
            >
              Почати спочатку
            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<FiUnlock />}
            >
              Підтвердити
            </Button>
          </div>
        </form>
      )}

      {(error || formErrors.general) && (
        <div className="connect-error">
          <span className="error-icon">
            <FiAlertCircle />
          </span>
          <span className="error-text">{error || formErrors.general}</span>
        </div>
      )}

      <div className="connect-footer">
        <div className="security-note">
          <span className="security-icon">
            <FiLock />
          </span>
          <div className="security-text">
            <strong>Безпека:</strong> Ваші дані надійно захищені. Ми не
            зберігаємо ваш пароль або особисту інформацію.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramConnect;
