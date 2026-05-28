import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer from "../../components/footer/footer.component";
import { useCart } from "../../store/hooks";
import { useAuth } from "../../store/hooks";
import "./cart.styles.scss";

// ─────────────────────────────────────────────
// Cart Item
// ─────────────────────────────────────────────
const CartItem = ({
  item,
  onUpdate,
  onRemove,
  checked,
  onCheck,
}) => {
  const variant = item.variant || {};
  const product = variant.product || {};

  const stock = Number(variant.stock || 0);
  const isOutOfStock = item.quantity > stock;

  return (
    <div className="cart-item">

      {/* CHECKBOX */}
      <div className="cart-item__check">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onCheck(item.id)}
        />
      </div>

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

        <p className="cart-item__stock">
          Tồn kho: {stock}
        </p>

        {isOutOfStock && (
          <p className="cart-item__stock-warning">
            Số lượng vượt quá tồn kho
          </p>
        )}
      </div>

      {/* ACTION */}
      <div className="cart-item__actions">
        <div className="qty">
          <button
            className="qty__btn"
            onClick={() =>
              onUpdate(item.id, item.quantity - 1)
            }
            disabled={item.quantity <= 1}
          >
            −
          </button>

          <span className="qty__val">
            {item.quantity}
          </span>

          <button
            className="qty__btn"
            disabled={item.quantity >= stock}
            onClick={() => {
              if (item.quantity < stock) {
                onUpdate(
                  item.id,
                  item.quantity + 1
                );
              }
            }}
          >
            +
          </button>
        </div>

        <p className="cart-item__subtotal">
          {Number(
            (variant.price ||
              item.unit_price ||
              0) * item.quantity
          ).toLocaleString("vi-VN")}
          ₫
        </p>

        <button
          className="cart-item__remove"
          onClick={() => onRemove(item.id)}
        >
          X
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CART PAGE
// ─────────────────────────────────────────────
const Cart = () => {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();

  const [selectedItems, setSelectedItems] =
    useState([]);

  const {
    items,
    loading,
    fetchCart,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (items.length) {
      setSelectedItems(
        items.map((item) => item.id)
      );
    }
  }, [items]);

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (
      selectedItems.length === items.length
    ) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        items.map((i) => i.id)
      );
    }
  };

  const selectedCartItems =
    items.filter((item) =>
      selectedItems.includes(item.id)
    );

  const selectedTotalItems =
    selectedCartItems.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  const selectedTotalPrice =
    selectedCartItems.reduce(
      (sum, item) =>
        sum +
        Number(
          (item.variant?.price ||
            item.unit_price ||
            0) * item.quantity
        ),
      0
    );

  const hasOutOfStock =
    selectedCartItems.some((item) => {
      const stock = Number(
        item.variant?.stock || 0
      );

      return item.quantity > stock;
    });

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

          <div className="cart-page__left">

            <div className="cart-page__head">
              <h1>Giỏ hàng</h1>

              {items.length > 0 && (
                <button
                  onClick={clearCart}
                >
                  Xoá tất cả
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p>
                Giỏ hàng đang trống
              </p>
            ) : (
              <>
                <div className="cart-select-all">
                  <input
                    type="checkbox"
                    checked={
                      items.length > 0 &&
                      selectedItems.length ===
                        items.length
                    }
                    onChange={toggleAll}
                  />

                  <span>
                    Chọn tất cả
                  </span>
                </div>

                <div className="cart-list">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      checked={selectedItems.includes(
                        item.id
                      )}
                      onCheck={toggleItem}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {items.length > 0 && (
            <div className="cart-summary">

              <h2>
                Tóm tắt đơn hàng
              </h2>

              <div>
                Tạm tính (
                {selectedTotalItems}
                {" "}sản phẩm)
              </div>

              <div>
                {selectedTotalPrice.toLocaleString(
                  "vi-VN"
                )}
                ₫
              </div>

              <hr />

              <div>
                Tổng cộng:
                {" "}
                {(
                  selectedTotalPrice +
                  (selectedTotalPrice >=
                  500000
                    ? 0
                    : 30000)
                ).toLocaleString(
                  "vi-VN"
                )}
                ₫
              </div>

              {hasOutOfStock && (
                <p>
                  Vượt quá tồn kho
                </p>
              )}

              <button
                className="btn btn--primary"
                disabled={
                  hasOutOfStock ||
                  selectedItems.length ===
                    0
                }
                onClick={() => {
                  if (
                    selectedItems.length ===
                    0
                  )
                    return;

                  const token =
                    localStorage.getItem(
                      "access_token"
                    );

                  if (!token) {
                    navigate("/login");
                    return;
                  }

                  navigate("/checkout");
                }}
              >
                {localStorage.getItem(
                  "access_token"
                )
                  ? "Thanh toán"
                  : "Đăng nhập để thanh toán"}
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