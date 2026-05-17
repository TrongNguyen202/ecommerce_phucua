import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer  from "../../components/footer/footer.component";
import { useAuth }  from "../../store/hooks";
import { useOrder } from "../../store/hooks";
import "./Profile.styles.scss";
import { accountsApi, authApi } from "../../utils/api/api";

// ─── Avatar ───────────────────────────────────────────────────────
const AvatarSection = ({ user }) => {
  const initials = user
    ? (user.first_name?.[0] || user.username?.[0] || "U").toUpperCase()
    : "U";

  return (
    <div className="profile-avatar">
      <div className="profile-avatar__circle">
        {user?.avatar
          ? <img src={user.avatar} alt={user.username} className="profile-avatar__img" />
          : <span className="profile-avatar__initials">{initials}</span>
        }
      </div>
      <div className="profile-avatar__info">
        <p className="profile-avatar__name">
          {user?.first_name && user?.last_name
            ? `${user.last_name} ${user.first_name}`
            : user?.username}
        </p>
        <p className="profile-avatar__email">{user?.email}</p>
      </div>
    </div>
  );
};

// ─── Info Form ────────────────────────────────────────────────────
const InfoForm = ({ user, onSave, loading }) => {
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name:  user?.last_name  || "",
    email:      user?.email      || "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setForm({
      first_name: user.first_name || "",
      last_name:  user.last_name  || "",
      email:      user.email      || "",
    });
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form__row">
        <div className="pf-field">
          <label className="pf-field__label">Họ</label>
          <input className="pf-field__input" value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)} placeholder="Nguyễn" />
        </div>
        <div className="pf-field">
          <label className="pf-field__label">Tên</label>
          <input className="pf-field__input" value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)} placeholder="Văn A" />
        </div>
      </div>

      <div className="pf-field">
        <label className="pf-field__label">Email</label>
        <input className="pf-field__input" type="email" value={form.email}
          onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" />
      </div>

      <div className="pf-field">
        <label className="pf-field__label">Tên đăng nhập</label>
        <input className="pf-field__input pf-field__input--disabled"
          value={user?.username || ""} disabled />
        <p className="pf-field__hint">Tên đăng nhập không thể thay đổi</p>
      </div>

      {saved && (
        <div className="profile-alert profile-alert--success">
          ✓ Cập nhật thông tin thành công!
        </div>
      )}

      <button type="submit" className="profile-btn" disabled={loading}>
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
};

// ─── Address Card ─────────────────────────────────────────────────
const AddressCard = ({ address, onDelete, onSetDefault }) => (
  <div className={`addr-item ${address.is_default ? "addr-item--default" : ""}`}>
    <div className="addr-item__info">
      <div className="addr-item__head">
        <p className="addr-item__name">{address.full_name}</p>
        {address.is_default && <span className="addr-item__badge">Mặc định</span>}
        <span className={`addr-item__type addr-item__type--${address.address_type}`}>
          {address.address_type === "shipping" ? "Giao hàng" : "Thanh toán"}
        </span>
      </div>
      <p className="addr-item__phone">{address.phone}</p>
      <p className="addr-item__addr">
        {address.address}, {address.ward}, {address.district}, {address.city}
      </p>
    </div>
    <div className="addr-item__actions">
      {!address.is_default && (
        <button className="addr-item__btn" onClick={() => onSetDefault(address.id)}>
          Đặt mặc định
        </button>
      )}
      <button className="addr-item__btn addr-item__btn--danger" onClick={() => onDelete(address.id)}>
        Xoá
      </button>
    </div>
  </div>
);

// ─── New Address Form ─────────────────────────────────────────────
const NewAddressForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    full_name: "", phone: "", address: "",
    city: "", district: "", ward: "",
    address_type: "shipping", is_default: false,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="new-addr-form">
      <div className="profile-form__row">
        <div className="pf-field">
          <label className="pf-field__label">Họ tên *</label>
          <input className="pf-field__input" required value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div className="pf-field">
          <label className="pf-field__label">Số điện thoại *</label>
          <input className="pf-field__input" required value={form.phone}
            onChange={(e) => set("phone", e.target.value)} placeholder="0900 000 000" />
        </div>
      </div>

      <div className="pf-field">
        <label className="pf-field__label">Địa chỉ *</label>
        <input className="pf-field__input" required value={form.address}
          onChange={(e) => set("address", e.target.value)} placeholder="Số nhà, tên đường" />
      </div>

      <div className="profile-form__row">
        <div className="pf-field">
          <label className="pf-field__label">Phường/Xã *</label>
          <input className="pf-field__input" required value={form.ward}
            onChange={(e) => set("ward", e.target.value)} placeholder="Phường 1" />
        </div>
        <div className="pf-field">
          <label className="pf-field__label">Quận/Huyện *</label>
          <input className="pf-field__input" required value={form.district}
            onChange={(e) => set("district", e.target.value)} placeholder="Quận 1" />
        </div>
        <div className="pf-field">
          <label className="pf-field__label">Tỉnh/Thành *</label>
          <input className="pf-field__input" required value={form.city}
            onChange={(e) => set("city", e.target.value)} placeholder="TP. HCM" />
        </div>
      </div>

      <div className="profile-form__row">
        <div className="pf-field">
          <label className="pf-field__label">Loại địa chỉ</label>
          <select className="pf-field__input" value={form.address_type}
            onChange={(e) => set("address_type", e.target.value)}>
            <option value="shipping">Giao hàng</option>
            <option value="billing">Thanh toán</option>
          </select>
        </div>
      </div>

      <label className="pf-check">
        <input type="checkbox" checked={form.is_default}
          onChange={(e) => set("is_default", e.target.checked)} />
        Đặt làm địa chỉ mặc định
      </label>

      <div className="new-addr-form__actions">
        <button type="button" className="profile-btn profile-btn--ghost" onClick={onCancel}>Huỷ</button>
        <button type="button" className="profile-btn" onClick={() => onSave(form)}>Lưu địa chỉ</button>
      </div>
    </div>
  );
};

// ─── Stats Card ───────────────────────────────────────────────────
const StatsCard = ({ icon, label, value, color }) => (
  <div className="stat-card">
    <div className={`stat-card__icon stat-card__icon--${color}`}>{icon}</div>
    <div>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__label">{label}</p>
    </div>
  </div>
);

// ─── Profile Page ─────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, updateMe, logout, fetchMe } = useAuth();
  const {
    list: orders, addresses,
    fetchAll: fetchOrders, fetchAddresses,
    createAddress,
  } = useOrder();

  const [activeTab,   setActiveTab]   = useState("info");
  const [showNewAddr, setShowNewAddr] = useState(false);

  // ── Password state — phải nằm trong Profile component ──
  const [pwForm,      setPwForm]      = useState({ old: "", new: "", confirm: "" });
  const [pwError,     setPwError]     = useState(null);
  const [pwSuccess,   setPwSuccess]   = useState(false);
  const [pwLoading,   setPwLoading]   = useState(false);
  const [showPwForm,  setShowPwForm]  = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    fetchMe();
    fetchOrders();
    fetchAddresses();
  }, []);

  const handleSaveInfo = async (data) => {
    await updateMe(data);
  };

  const handleSaveAddress = async (data) => {
    await createAddress(data);
    setShowNewAddr(false);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Xoá địa chỉ này?")) return;
    await accountsApi.deleteAddress(id);
    fetchAddresses();
  };

  const handleSetDefault = async (id) => {
    await accountsApi.setDefaultAddress(id);
    fetchAddresses();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(null);

    if (pwForm.new !== pwForm.confirm) {
      setPwError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (pwForm.new.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm.old, pwForm.new);
      setPwSuccess(true);
      setPwForm({ old: "", new: "", confirm: "" });
      setShowPwForm(false);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.error || "Đổi mật khẩu thất bại.");
    } finally {
      setPwLoading(false);
    }
  };

  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const TABS = [
    { key: "info",     label: "Thông tin", icon: "👤" },
    { key: "address",  label: "Địa chỉ",   icon: "📍" },
    { key: "orders",   label: "Đơn hàng",  icon: "📦" },
    { key: "security", label: "Bảo mật",   icon: "🔒" },
  ];

  const STATUS_LABEL = {
    pending:    { text: "Chờ xác nhận", color: "amber"  },
    confirmed:  { text: "Đã xác nhận",  color: "blue"   },
    processing: { text: "Đang xử lý",   color: "blue"   },
    shipped:    { text: "Đang giao",    color: "purple" },
    delivered:  { text: "Đã giao",      color: "green"  },
    cancelled:  { text: "Đã huỷ",       color: "red"    },
  };

  return (
    <div className="profile-page">
      <Header />

      <main className="profile-page__main">
        <div className="profile-page__inner">

          {/* Sidebar */}
          <aside className="profile-sidebar">
            <AvatarSection user={user} />
            <nav className="profile-nav">
              {TABS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={`profile-nav__item ${activeTab === key ? "profile-nav__item--active" : ""}`}
                  onClick={() => setActiveTab(key)}
                >
                  <span className="profile-nav__icon">{icon}</span>
                  {label}
                </button>
              ))}
              <div className="profile-nav__divider" />
              <button className="profile-nav__item profile-nav__item--danger" onClick={handleLogout}>
                <span className="profile-nav__icon">🚪</span>
                Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="profile-content">

            {/* ── Thông tin ── */}
            {activeTab === "info" && (
              <div className="profile-section">
                <h2 className="profile-section__title">Thông tin cá nhân</h2>
                <div className="profile-stats">
                  <StatsCard icon="📦" label="Tổng đơn"   value={stats.total}     color="blue"  />
                  <StatsCard icon="⏳" label="Chờ xử lý"  value={stats.pending}   color="amber" />
                  <StatsCard icon="✅" label="Đã giao"     value={stats.delivered} color="green" />
                  <StatsCard icon="❌" label="Đã huỷ"      value={stats.cancelled} color="red"   />
                </div>
                <InfoForm user={user} onSave={handleSaveInfo} loading={loading} />
              </div>
            )}

            {/* ── Địa chỉ ── */}
            {activeTab === "address" && (
              <div className="profile-section">
                <div className="profile-section__head">
                  <h2 className="profile-section__title">Địa chỉ của tôi</h2>
                  {!showNewAddr && (
                    <button className="profile-btn profile-btn--sm" onClick={() => setShowNewAddr(true)}>
                      + Thêm địa chỉ
                    </button>
                  )}
                </div>

                {showNewAddr && (
                  <div className="profile-card">
                    <h3 className="profile-card__title">Địa chỉ mới</h3>
                    <NewAddressForm onSave={handleSaveAddress} onCancel={() => setShowNewAddr(false)} />
                  </div>
                )}

                {addresses.length === 0 && !showNewAddr ? (
                  <div className="profile-empty">
                    <p>📍</p>
                    <p>Chưa có địa chỉ nào. Thêm địa chỉ để thanh toán nhanh hơn.</p>
                  </div>
                ) : (
                  <div className="addr-list">
                    {addresses.map((a) => (
                      <AddressCard
                        key={a.id}
                        address={a}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefault}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Đơn hàng ── */}
            {activeTab === "orders" && (
              <div className="profile-section">
                <h2 className="profile-section__title">Lịch sử đơn hàng</h2>
                {orders.length === 0 ? (
                  <div className="profile-empty">
                    <p>📦</p>
                    <p>Bạn chưa có đơn hàng nào.</p>
                    <button className="profile-btn" onClick={() => navigate("/")}>Mua sắm ngay</button>
                  </div>
                ) : (
                  <div className="profile-orders">
                    {orders.slice(0, 10).map((order) => {
                      const s = STATUS_LABEL[order.status] || { text: order.status, color: "gray" };
                      return (
                        <div key={order.id} className="profile-order"
                          onClick={() => navigate(`/orders/${order.id}`)}>
                          <div className="profile-order__left">
                            <p className="profile-order__id">Đơn #{order.id}</p>
                            <p className="profile-order__date">
                              {new Date(order.created_at).toLocaleDateString("vi-VN")}
                            </p>
                            <p className="profile-order__items">{order.items?.length || 0} sản phẩm</p>
                          </div>
                          <div className="profile-order__right">
                            <span className={`order-badge order-badge--${s.color}`}>{s.text}</span>
                            <p className="profile-order__total">
                              {Number(order.total).toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {orders.length > 10 && (
                      <button className="profile-btn profile-btn--ghost profile-btn--full"
                        onClick={() => navigate("/orders")}>
                        Xem tất cả đơn hàng
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Bảo mật ── */}
            {activeTab === "security" && (
              <div className="profile-section">
                <h2 className="profile-section__title">Bảo mật tài khoản</h2>

                <div className="profile-card">

                  {/* Đổi mật khẩu */}
                  <div className="security-item">
                    <div>
                      <p className="security-item__label">Mật khẩu</p>
                      <p className="security-item__desc">Nên đổi định kỳ để bảo vệ tài khoản</p>
                    </div>
                    <button
                      className="profile-btn profile-btn--sm profile-btn--ghost"
                      onClick={() => { setShowPwForm((v) => !v); setPwError(null); }}
                    >
                      {showPwForm ? "Huỷ" : "Đổi mật khẩu"}
                    </button>
                  </div>

                  {showPwForm && (
                    <form className="pw-form" onSubmit={handleChangePassword}>
                      {pwError && (
                        <div className="profile-alert profile-alert--error">{pwError}</div>
                      )}
                      <div className="pf-field">
                        <label className="pf-field__label">Mật khẩu hiện tại</label>
                        <input className="pf-field__input" type="password"
                          value={pwForm.old} required placeholder="Nhập mật khẩu cũ"
                          onChange={(e) => setPwForm((f) => ({ ...f, old: e.target.value }))} />
                      </div>
                      <div className="pf-field">
                        <label className="pf-field__label">Mật khẩu mới</label>
                        <input className="pf-field__input" type="password"
                          value={pwForm.new} required placeholder="Ít nhất 6 ký tự"
                          onChange={(e) => setPwForm((f) => ({ ...f, new: e.target.value }))} />
                      </div>
                      <div className="pf-field">
                        <label className="pf-field__label">Xác nhận mật khẩu mới</label>
                        <input className="pf-field__input" type="password"
                          value={pwForm.confirm} required placeholder="Nhập lại mật khẩu mới"
                          onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
                      </div>
                      <button type="submit" className="profile-btn" disabled={pwLoading}>
                        {pwLoading ? "Đang lưu..." : "Xác nhận đổi mật khẩu"}
                      </button>
                    </form>
                  )}

                  {pwSuccess && (
                    <div className="profile-alert profile-alert--success" style={{ marginTop: "1rem" }}>
                      ✓ Đổi mật khẩu thành công!
                    </div>
                  )}

                  <div className="security-item">
                    <div>
                      <p className="security-item__label">Tên đăng nhập</p>
                      <p className="security-item__desc">{user?.username}</p>
                    </div>
                    <span className="security-badge">Không thể thay đổi</span>
                  </div>

                  <div className="security-item security-item--danger">
                    <div>
                      <p className="security-item__label">Đăng xuất</p>
                      <p className="security-item__desc">Xoá phiên đăng nhập hiện tại</p>
                    </div>
                    <button className="profile-btn profile-btn--sm profile-btn--danger" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
