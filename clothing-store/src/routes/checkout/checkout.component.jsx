import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer  from "../../components/footer/footer.component";
import { useCart }    from "../../store/hooks";
import { useOrder }   from "../../store/hooks";
import { usePayment } from "../../store/hooks";
import "./checkout.styles.scss";

// ─── Address Card ────────────────────────────────────────────────
const AddressCard = ({ address, selected, onSelect }) => (
  <div
    className={`addr-card ${selected ? "addr-card--selected" : ""}`}
    onClick={() => onSelect(address.id)}
  >
    <div className="addr-card__radio">
      <div className="addr-card__dot" />
    </div>
    <div className="addr-card__info">
      <p className="addr-card__name">
        {address.full_name}
        {address.is_default && <span className="addr-card__badge">Mặc định</span>}
      </p>
      <p className="addr-card__line">{address.phone}</p>
      <p className="addr-card__line">
        {address.address}, {address.ward}, {address.district}, {address.city}
      </p>
    </div>
  </div>
);

// ─── New Address Form ─────────────────────────────────────────────
const AddressForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    full_name: "", phone: "", address: "",
    city: "", district: "", ward: "",
    address_type: "shipping", is_default: false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="addr-form" onSubmit={handleSave}>
      <div className="addr-form__row">
        <div className="field">
          <label className="field__label">Họ tên *</label>
          <input className="field__input" required value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div className="field">
          <label className="field__label">Số điện thoại *</label>
          <input className="field__input" required value={form.phone}
            onChange={(e) => set("phone", e.target.value)} placeholder="0900 000 000" />
        </div>
      </div>
      <div className="field">
        <label className="field__label">Địa chỉ *</label>
        <input className="field__input" required value={form.address}
          onChange={(e) => set("address", e.target.value)} placeholder="Số nhà, tên đường" />
      </div>
      <div className="addr-form__row">
        <div className="field">
          <label className="field__label">Phường/Xã *</label>
          <input className="field__input" required value={form.ward}
            onChange={(e) => set("ward", e.target.value)} placeholder="Phường 1" />
        </div>
        <div className="field">
          <label className="field__label">Quận/Huyện *</label>
          <input className="field__input" required value={form.district}
            onChange={(e) => set("district", e.target.value)} placeholder="Quận 1" />
        </div>
        <div className="field">
          <label className="field__label">Tỉnh/Thành phố *</label>
          <input className="field__input" required value={form.city}
            onChange={(e) => set("city", e.target.value)} placeholder="TP. Hồ Chí Minh" />
        </div>
      </div>
      <label className="addr-form__check">
        <input type="checkbox" checked={form.is_default}
          onChange={(e) => set("is_default", e.target.checked)} />
        Đặt làm địa chỉ mặc định
      </label>
      <div className="addr-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Huỷ</button>
        <button type="submit" className="btn btn--primary">Lưu địa chỉ</button>
      </div>
    </form>
  );
};

// ─── Checkout Page ───────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice: fullTotalPrice, fetchCart } = useCart();
  const location = useLocation();
  const navSelectedIds = location.state?.selectedIds || [];

  const displayItems = navSelectedIds.length > 0
    ? items.filter((it) => navSelectedIds.includes(it.id))
    : items;

  const basePrice = displayItems.reduce((s, it) => {
    const variant = it.variant || {};
    return s + (Number(variant.price || it.unit_price || 0) * Number(it.quantity || 0));
  }, 0);

  const shippingFee = basePrice >= 500000 ? 0 : 30000;
  const total = basePrice + shippingFee;
  const {
    addresses, checkoutLoading, error,
    fetchAddresses, createAddress, checkout,
  } = useOrder();
  const { createSePay, createCOD } = usePayment();

  const [selectedAddr, setSelectedAddr]   = useState(null);
  const [showForm, setShowForm]           = useState(false);
  const [payMethod, setPayMethod]         = useState("sepay");
  const [note, setNote]                   = useState("");

  // (computed above using selected items when present)

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  // Tự chọn địa chỉ mặc định
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddr) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddr(def.id);
    }
  }, [addresses]);

  const handleSaveAddress = async (data) => {
    await createAddress(data);
    setShowForm(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const result = await checkout({
      address_id:   selectedAddr,
      note,
      shipping_fee: shippingFee,
    });

    if (result.error) return;

    const orderId = result.payload?.id;
    if (!orderId) return;

    if (payMethod === "cod") {
      await createCOD(orderId);
      navigate(`/orders/${orderId}?success=true`);
    } else {
      await createSePay(orderId);
      navigate(`/payment/${orderId}`);
    }
  };

  return (
    <div className="checkout-page">
      <Header />

      <main className="checkout-page__main">
        <div className="checkout-page__inner">

          {/* Left */}
          <div className="checkout-page__left">
            <h1 className="checkout-page__title">Thanh toán</h1>

            {/* Address */}
            <section className="checkout-section">
              <div className="checkout-section__head">
                <h2 className="checkout-section__title">Địa chỉ giao hàng</h2>
                {!showForm && (
                  <button className="checkout-section__add" onClick={() => setShowForm(true)}>
                    + Thêm địa chỉ
                  </button>
                )}
              </div>

              {showForm ? (
                <AddressForm onSave={handleSaveAddress} onCancel={() => setShowForm(false)} />
              ) : (
                <div className="addr-list">
                  {addresses.length === 0 ? (
                    <p className="checkout-empty">Chưa có địa chỉ. Hãy thêm mới.</p>
                  ) : (
                    addresses.map((a) => (
                      <AddressCard
                        key={a.id}
                        address={a}
                        selected={selectedAddr === a.id}
                        onSelect={setSelectedAddr}
                      />
                    ))
                  )}
                </div>
              )}
            </section>

            {/* Payment method */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Phương thức thanh toán</h2>
              <div className="pay-methods">
                <label className={`pay-method ${payMethod === "sepay" ? "pay-method--active" : ""}`}>
                  <input type="radio" name="pay" value="sepay"
                    checked={payMethod === "sepay"}
                    onChange={() => setPayMethod("sepay")} />
                  <div className="pay-method__icon pay-method__icon--bank">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div className="pay-method__info">
                    <p className="pay-method__name">Chuyển khoản SePay</p>
                    <p className="pay-method__desc">Quét mã QR — xác nhận tự động</p>
                  </div>
                </label>

                <label className={`pay-method ${payMethod === "cod" ? "pay-method--active" : ""}`}>
                  <input type="radio" name="pay" value="cod"
                    checked={payMethod === "cod"}
                    onChange={() => setPayMethod("cod")} />
                  <div className="pay-method__icon pay-method__icon--cod">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </div>
                  <div className="pay-method__info">
                    <p className="pay-method__name">Thanh toán khi nhận hàng (COD)</p>
                    <p className="pay-method__desc">Trả tiền mặt khi giao hàng</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Note */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Ghi chú đơn hàng</h2>
              <textarea
                className="checkout-note"
                rows={3}
                placeholder="Ghi chú cho người giao hàng (không bắt buộc)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </section>

            {error && (
              <div className="checkout-error">
                {typeof error === "object"
                  ? Object.values(error).flat().join(" ")
                  : error}
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div className="checkout-summary">
            <h2 className="checkout-summary__title">Đơn hàng ({displayItems.reduce((s,it) => s + Number(it.quantity||0), 0)} sản phẩm)</h2>

            <div className="checkout-summary__items">
              {displayItems.map((item) => {
                const variant = item.variant || {};
                return (
                  <div key={item.id} className="checkout-summary__item">
                    <div className="checkout-summary__item-img">
                      <img
                        src={variant.image || variant.product?.thumbnail
                          || "https://placehold.co/60x80/f5f0e8/c8a96e?text=?"}
                        alt={item.product_name}
                      />
                      <span className="checkout-summary__item-qty">{item.quantity}</span>
                    </div>
                    <div className="checkout-summary__item-info">
                      <p className="checkout-summary__item-name">{item.product_name}</p>
                      {variant.size  && <p className="checkout-summary__item-meta">Size: {variant.size.name}</p>}
                      {variant.color && <p className="checkout-summary__item-meta">Màu: {variant.color.name}</p>}
                    </div>
                    <p className="checkout-summary__item-price">
                      {Number((variant.price || 0) * item.quantity).toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary__divider" />

            <div className="checkout-summary__rows">
              <div className="checkout-summary__row">
                <span>Tạm tính</span>
                <span>{Number(basePrice).toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="checkout-summary__row">
                <span>Phí vận chuyển</span>
                <span className={shippingFee === 0 ? "checkout-summary__free" : ""}>
                  {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")}₫`}
                </span>
              </div>
            </div>

            <div className="checkout-summary__divider" />

            <div className="checkout-summary__total">
              <span>Tổng cộng</span>
              <span className="checkout-summary__total-price">
                {total.toLocaleString("vi-VN")}₫
              </span>
            </div>

            <button
              className="btn btn--primary checkout-summary__btn"
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || displayItems.length === 0}
            >
              {checkoutLoading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
