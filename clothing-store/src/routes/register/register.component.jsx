import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../store/hooks";
import "./auth.styles.scss";
import { initCSRF } from "../../utils/api/api";

const Register = () => {
  const navigate = useNavigate();
  const { register, login, isLoggedIn, loading, error } = useAuth();

  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm: "",
    phone: "", first_name: "", last_name: "",
  });
  const [showPass, setShowPass]   = useState(false);
  const [localError, setLocalError] = useState(null);
  const [step, setStep]           = useState(1); // 1: account, 2: profile

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);
useEffect(() => {
  initCSRF();
}, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleNext = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setLocalError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (form.password.length < 6) {
      setLocalError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    setLocalError(null);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const { confirm, ...payload } = form;
    const result = await register(payload);

    if (!result.error) {
      // Tự động login sau khi đăng ký
      await login(form.username, form.password);
    }
  };

  const displayError = localError || (
    error
      ? (typeof error === "object"
          ? Object.entries(error).map(([k, v]) => `${k}: ${v}`).join(" · ")
          : error)
      : null
  );
  

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo__mark">C</span>
            <span className="auth-logo__text">LOTH</span>
          </Link>
          <p className="auth-page__tagline">
            Tạo tài khoản.<br />Bắt đầu hành trình.
          </p>
        </div>
        <div className="auth-page__deco">
          <div className="auth-page__blob auth-page__blob--1" />
          <div className="auth-page__blob auth-page__blob--2" />
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80"
            alt="fashion"
            className="auth-page__deco-img"
          />
        </div>
      </div>

      <div className="auth-page__right">
        <div className="auth-card">

          <div className="auth-card__head">
            <h1 className="auth-card__title">Đăng ký</h1>
            <p className="auth-card__sub">
              Đã có tài khoản?{" "}
              <Link to="/login" className="auth-link">Đăng nhập</Link>
            </p>
          </div>

          {/* Step indicator */}
          <div className="auth-steps">
            <div className={`auth-steps__item ${step >= 1 ? "auth-steps__item--active" : ""}`}>
              <span className="auth-steps__num">1</span>
              <span className="auth-steps__label">Tài khoản</span>
            </div>
            <div className="auth-steps__line" />
            <div className={`auth-steps__item ${step >= 2 ? "auth-steps__item--active" : ""}`}>
              <span className="auth-steps__num">2</span>
              <span className="auth-steps__label">Thông tin</span>
            </div>
          </div>

          {displayError && (
            <div className="auth-error">{displayError}</div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <form className="auth-form" onSubmit={handleNext}>
              <div className="auth-field">
                <label className="auth-field__label">Tên đăng nhập *</label>
                <div className="auth-field__wrap">
                  <svg className="auth-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    className="auth-field__input"
                    type="text"
                    placeholder="username"
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label">Email *</label>
                <div className="auth-field__wrap">
                  <svg className="auth-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    className="auth-field__input"
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label">Mật khẩu *</label>
                <div className="auth-field__wrap">
                  <svg className="auth-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    className="auth-field__input"
                    type={showPass ? "text" : "password"}
                    placeholder="Ít nhất 6 ký tự"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                  />
                  <button type="button" className="auth-field__toggle"
                    onClick={() => setShowPass((v) => !v)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      {showPass
                        ? <><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label">Xác nhận mật khẩu *</label>
                <div className="auth-field__wrap">
                  <svg className="auth-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    className="auth-field__input"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirm}
                    onChange={(e) => set("confirm", e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn">
                Tiếp theo →
              </button>
            </form>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__row">
                <div className="auth-field">
                  <label className="auth-field__label">Họ</label>
                  <div className="auth-field__wrap">
                    <input
                      className="auth-field__input auth-field__input--no-icon"
                      type="text"
                      placeholder="Nguyễn"
                      value={form.last_name}
                      onChange={(e) => set("last_name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-field__label">Tên</label>
                  <div className="auth-field__wrap">
                    <input
                      className="auth-field__input auth-field__input--no-icon"
                      type="text"
                      placeholder="Văn A"
                      value={form.first_name}
                      onChange={(e) => set("first_name", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label">Số điện thoại</label>
                <div className="auth-field__wrap">
                  <svg className="auth-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    className="auth-field__input"
                    type="tel"
                    placeholder="0900 000 000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-form__actions">
                <button
                  type="button"
                  className="auth-btn auth-btn--ghost"
                  onClick={() => setStep(1)}
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  className="auth-btn"
                  disabled={loading}
                >
                  {loading ? <span className="auth-btn__spinner" /> : "Đăng ký"}
                </button>
              </div>
            </form>
          )}

          <div className="auth-divider"><span>hoặc</span></div>
          <Link to="/" className="auth-guest">
            Tiếp tục không cần đăng nhập →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
