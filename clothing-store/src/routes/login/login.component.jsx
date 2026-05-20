import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../store/hooks";
import "./auth.styles.scss";
import { initCSRF } from "../../utils/api/api";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, loading, error } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate("/");
  }, [isLoggedIn]);
useEffect(() => {
  initCSRF();
}, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.username, form.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo__mark">C</span>
            <span className="auth-logo__text">LOTH</span>
          </Link>
          <p className="auth-page__tagline">
            Thời trang tinh tế.<br />Phong cách của bạn.
          </p>
        </div>
        <div className="auth-page__deco">
          <div className="auth-page__blob auth-page__blob--1" />
          <div className="auth-page__blob auth-page__blob--2" />
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"
            alt="fashion"
            className="auth-page__deco-img"
          />
        </div>
      </div>

      <div className="auth-page__right">
        <div className="auth-card">
          <div className="auth-card__head">
            <h1 className="auth-card__title">Đăng nhập</h1>
            <p className="auth-card__sub">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="auth-link">Đăng ký ngay</Link>
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error.error || error.detail || "Tên đăng nhập hoặc mật khẩu không đúng"}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">Tên đăng nhập</label>
              <div className="auth-field__wrap">
                <svg className="auth-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  className="auth-field__input"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={(e) => set("username", e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Mật khẩu</label>
              <div className="auth-field__wrap">
                <svg className="auth-field__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  className="auth-field__input"
                  type={showPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-field__toggle"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-btn__spinner" />
              ) : "Đăng nhập"}
            </button>
          </form>

          <div className="auth-divider"><span>hoặc</span></div>
           <div className="google-login">
  <GoogleLogin
    theme="outline"
    size="large"
    shape="pill"
    text="signin_with"
    width="380"
    onSuccess={async (credentialResponse) => {
      try {
        const res = await axios.post(
          "http://localhost:8000/api/auth/users/google/",
          {
            token: credentialResponse.credential,
          }
        );

        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);

        navigate("/");
        window.location.reload();

      } catch (err) {
        console.error(err);
      }
    }}
    onError={() => {
      console.log("Google Login Failed");
    }}
  />
</div>
          <Link to="/" className="auth-guest">
            Tiếp tục không cần đăng nhập →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
