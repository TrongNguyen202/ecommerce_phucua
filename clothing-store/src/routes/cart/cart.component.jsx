import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer from "../../components/footer/footer.component";
import { useCart } from "../../store/hooks";
import { useAuth } from "../../store/hooks";
import "./cart.styles.scss";

// ─────────────────────────────────────────────
// Cart Item
// ─────────────────────────────────────────────
const CartItem = ({ item, onUpdate, onRemove }) => {
  const variant = item.variant || {};
  const product = variant.product || {};

  const stock = Number(variant.stock || 0);
  const isOutOfStock = item.quantity > stock;

  return (
    <div className="cart-item">
      {/* IMAGE */}
      <div className="cart-item__img-wrap">
        <img
          src={
            variant.image ||
            product.thumbnail ||
            "https://placehold.co/120x160/f5f0e8/c8a96e?text=No+Image"
          }
          alt={item.product_name || product.name}
          className="cart-item__img"
        />
      </div>

      {/* INFO */}
      <div className="cart-item__info">
        <p className="cart-item__cat">
          {product.category?.name || ""}
        </p>

        <h3 className="cart-item__name">
          {item.product_name || product.name}
        </h3>

        <div className="cart-item__meta">
          {variant.size && (
            <span className="cart-item__tag">
              Size: {variant.size.name}
            </span>
          )}

          {variant.color && (
            <span className="cart-item__tag">
              <span
                className="cart-item__color-dot"
                style={{
                  background: variant.color.hex_code,
                }}
              />
              {variant.color.name}
            </span>
          )}
        </div>

        <p className="cart-item__price">
          {Number(
            variant.price || item.unit_price || 0
          ).toLocaleString("vi-VN")}
          ₫
        </p>

        {/* STOCK */}
        <p className="cart-item__stock">
          Tồn kho: {stock}
        </p>

        {/* WARNING */}
        {isOutOfStock && (
          <p className="cart-item__stock-warning">
            Số lượng vượt quá tồn kho
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="cart-item__actions">
        <div className="qty">
          {/* MINUS */}
          <button
            className="qty__btn"
            onClick={() =>
              onUpdate(item.id, item.quantity - 1)
            }
            disabled={item.quantity <= 1}
          >
            −
          </button>

          {/* QTY */}
          <span className="qty__val">
            {item.quantity}
          </span>

          {/* PLUS */}
          <button
            className="qty__btn"
            disabled={item.quantity >= stock}
            onClick={() => {
              if (item.quantity < stock) {
                onUpdate(item.id, item.quantity + 1);
              }
            }}
          >
            +
          </button>
        </div>

        {/* SUBTOTAL */}
        <p className="cart-item__subtotal">
          {Number(
            (variant.price || item.unit_price || 0) *
              item.quantity
          ).toLocaleString("vi-VN")}
          ₫
        </p>

        {/* REMOVE */}
        <button
          className="cart-item__remove"
          onClick={() => onRemove(item.id)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Cart Page
// ─────────────────────────────────────────────
const Cart = () => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();

  const {
    items,
    totalPrice,
    totalItems,
    loading,
    fetchCart,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();

  // FETCH CART
  useEffect(() => {
    fetchCart();
  }, []);

  // CHECK STOCK
  const hasOutOfStock = items.some((item) => {
    const stock = Number(item.variant?.stock || 0);
    return item.quantity > stock;
  });
console.log("hasOutOfStock", hasOutOfStock)
  // LOADING
  if (loading && items.length === 0) {
    return (
      <div className="cart-page">
        <Header />

        <div className="cart-page__loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Header />

      <main className="cart-page__main">
        <div className="cart-page__inner">

          {/* LEFT */}
          <div className="cart-page__left">
            <div className="cart-page__head">
              <h1 className="cart-page__title">
                Giỏ hàng
              </h1>

              {items.length > 0 && (
                <button
                  className="cart-page__clear"
                  onClick={clearCart}
                >
                  Xoá tất cả
                </button>
              )}
            </div>

            {/* EMPTY */}
            {items.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty__icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>

                <p className="cart-empty__text">
                  Giỏ hàng của bạn đang trống
                </p>

                <button
                  className="btn btn--primary"
                  onClick={() => navigate("/")}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            ) : (
              <div className="cart-list">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          {items.length > 0 && (
            <div className="cart-summary">
              <h2 className="cart-summary__title">
                Tóm tắt đơn hàng
              </h2>

              {/* ROWS */}
              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>
                    Tạm tính ({totalItems} sản phẩm)
                  </span>

                  <span>
                    {Number(totalPrice).toLocaleString(
                      "vi-VN"
                    )}
                    ₫
                  </span>
                </div>

                <div className="cart-summary__row">
                  <span>Phí vận chuyển</span>

                  <span className="cart-summary__free">
                    {Number(totalPrice) >= 500000
                      ? "Miễn phí"
                      : "30.000₫"}
                  </span>
                </div>
              </div>

              <div className="cart-summary__divider" />

              {/* TOTAL */}
              <div className="cart-summary__total">
                <span>Tổng cộng</span>

                <span>
                  {Number(totalPrice) >= 500000
                    ? Number(totalPrice).toLocaleString(
                        "vi-VN"
                      )
                    : (
                        Number(totalPrice) + 30000
                      ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>

              {/* FREE SHIP */}
              {Number(totalPrice) < 500000 && (
                <p className="cart-summary__hint">
                  Mua thêm{" "}
                  {(
                    500000 - Number(totalPrice)
                  ).toLocaleString("vi-VN")}
                  ₫ để được miễn phí vận chuyển
                </p>
              )}

              {/* ERROR */}
              {hasOutOfStock && (
                <p className="cart-summary__error">
                  Một số sản phẩm vượt quá số lượng tồn kho
                </p>
              )}

              {/* CHECKOUT */}
              <button
                className="btn btn--primary cart-summary__checkout"
                disabled={hasOutOfStock}
                onClick={() => {
                  if (hasOutOfStock) return;

                  const token =
                    localStorage.getItem("access_token");

                  if (!token) {
                    navigate("/login");
                    return;
                  }

                  navigate("/checkout");
                }}
              >
                {localStorage.getItem("access_token")
                  ? "Tiến hành thanh toán"
                  : "Đăng nhập để thanh toán"}
              </button>

              {/* CONTINUE */}
              <button
                className="cart-summary__continue"
                onClick={() => navigate(-1)}
              >
                ← Tiếp tục mua sắm
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;