import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer  from "../../components/footer/footer.component";
import { useOrder } from "../../store/hooks";
import { variantApi } from "../../utils/api/api";
import "./orders.styles.scss";

const STATUS_LABEL = {
  pending:    { text: "Chờ xác nhận", color: "amber" },
  confirmed:  { text: "Đã xác nhận",  color: "blue"  },
  processing: { text: "Đang xử lý",   color: "blue"  },
  shipped:    { text: "Đang giao",     color: "purple"},
  delivered:  { text: "Đã giao",       color: "green" },
  cancelled:  { text: "Đã huỷ",        color: "red"   },
  refunded:   { text: "Đã hoàn tiền",  color: "gray"  },
};

const OrderCard = ({ order, onCancel, imagesMap }) => {
  const navigate = useNavigate();
  const status   = STATUS_LABEL[order.status] || { text: order.status, color: "gray" };
  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="order-card" onClick={() => navigate(`/orders/${order.id}`)}>
      <div className="order-card__head">
        <div>
          <p className="order-card__id">Đơn hàng #{order.id}</p>
          <p className="order-card__date">
            {new Date(order.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`order-status order-status--${status.color}`}>
          {status.text}
        </span>
      </div>

      <div className="order-card__items">
        {order.items?.slice(0, 3).map((item) => (
          <div key={item.id} className="order-card__item">
            <img
              src={
                (typeof resolveImageValue === 'function' ? resolveImageValue(item.variant?.image) : item.variant?.image)
                || (typeof resolveImageValue === 'function' ? resolveImageValue(item.variant?.images?.[0]) : item.variant?.images?.[0])
                || imagesMap?.[item.variant?.id]
                || item.variant?.product?.thumbnail
                || item.product?.thumbnail
                || (item.product?.images?.[0] && (typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url))
                || "https://placehold.co/56x72/f5f0e8/c8a96e?text=?"
              }
              alt={item.product_name}
              className="order-card__item-img"
              onError={(e) => { e.currentTarget.src = "https://placehold.co/56x72/f5f0e8/c8a96e?text=?"; }}
            />
            <div className="order-card__item-info">
              <p className="order-card__item-name">{item.product_name}</p>
              <p className="order-card__item-meta">
                {item.variant?.size && `Size ${item.variant.size.name}`}
                {item.variant?.size && item.variant?.color && " · "}
                {item.variant?.color && item.variant.color.name}
              </p>
              <p className="order-card__item-qty">x{item.quantity}</p>
            </div>
            <p className="order-card__item-price">
              {Number(item.subtotal).toLocaleString("vi-VN")}₫
            </p>
          </div>
        ))}
        {order.items?.length > 3 && (
          <p className="order-card__more">+{order.items.length - 3} sản phẩm khác</p>
        )}
      </div>

      <div className="order-card__foot">
        <div>
          <span className="order-card__total-label">Tổng cộng</span>
          <span className="order-card__total">
            {Number(order.total).toLocaleString("vi-VN")}₫
          </span>
        </div>

        <div className="order-card__actions" onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && !order.payment && (
            <button
              className="order-card__btn order-card__btn--pay"
              onClick={() => navigate(`/payment/${order.id}`)}
            >
              Thanh toán
            </button>
          )}
          {canCancel && (
            <button
              className="order-card__btn order-card__btn--cancel"
              onClick={() => onCancel(order.id)}
            >
              Huỷ đơn
            </button>
          )}
          <button
            className="order-card__btn order-card__btn--detail"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

// Find an image URL anywhere inside a value (string/object) by keys or by url pattern
const resolveImageValue = (val) => {
  if (!val) return null;
  // if direct string that looks like url / image
  if (typeof val === "string") {
    if (val.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || val.startsWith("data:")) return val;
    if (val.startsWith("http")) return val;
    return null;
  }

  // recursive search inside objects and arrays
  const seen = new Set();
  const stack = [val];

  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (seen.has(node)) continue;
    seen.add(node);

    // common keys
    for (const key of ["url", "src", "image", "thumbnail", "file", "path"]) {
      const v = node[key];
      if (typeof v === "string") {
        if (v.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || v.startsWith("http") || v.startsWith("data:")) return v;
      }
      if (typeof v === "object") stack.push(v);
    }

    // also scan all properties
    for (const k in node) {
      if (!Object.prototype.hasOwnProperty.call(node, k)) continue;
      const v = node[k];
      if (typeof v === "string") {
        if (v.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || v.startsWith("http") || v.startsWith("data:")) return v;
      } else if (typeof v === "object") {
        stack.push(v);
      }
    }
  }

  return null;
};

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const { list: orders, loading, fetchAll, cancel } = useOrder();
  const [imagesMap, setImagesMap] = useState({});


  // fetch variant/product images for order items that lack image url
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const missing = [];
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        // try to find any image inside the whole item structure
        const hasImage = resolveImageValue(item) || resolveImageValue(item.variant) || resolveImageValue(item.product);
        const variantId = item.variant?.id;
        if (!hasImage && variantId && !imagesMap[variantId]) {
          missing.push(variantId);
        }
      });
    });

    const uniq = Array.from(new Set(missing));

    // fetch each missing variant once
    uniq.forEach(async (vid) => {
      try {
        const { data } = await variantApi.getById(vid);
        const url = resolveImageValue(data) || resolveImageValue(data.product) || resolveImageValue(data.images?.[0]) || resolveImageValue(data.image);
        if (url) {
          setImagesMap((m) => ({ ...m, [vid]: url }));
        }
      } catch (err) {
        // ignore
      }
    });
  }, [orders]);

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="orders-page">
      <Header />

      <main className="orders-page__main">
        <div className="orders-page__inner">

          {isSuccess && (
            <div className="orders-success-banner">
              <span>✓</span>
              <p>Đặt hàng thành công! Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.</p>
            </div>
          )}

          <h1 className="orders-page__title">Đơn hàng của tôi</h1>

          {loading && orders.length === 0 ? (
            <div className="orders-loading">
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="2" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="13" y2="16" />
                </svg>
              </div>
              <p className="orders-empty__text">Bạn chưa có đơn hàng nào</p>
              <button className="btn btn--primary" onClick={() => navigate("/")}>
                Mua sắm ngay
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onCancel={cancel} imagesMap={imagesMap} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
