import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "../../components/header/header.component";
import { usePayment } from "../../store/hooks";
import { useOrder }   from "../../store/hooks";
import api, { paymentApi } from "../../utils/api/api";
import {
  setCurrentPayment,
  startPolling,
  stopPolling,
} from "../../store/slices/paymentSlice";
import "./payment.styles.scss";

const BANK_NUMBER  = import.meta.env.VITE_BANK_NUMBER   || "0369298428";
const BANK_NAME    = import.meta.env.VITE_BANK_NAME     || "MBBank";
const ACCOUNT_NAME = import.meta.env.VITE_ACCOUNT_NAME  || "DANG VAN PHU";

const Payment = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const dispatch    = useDispatch();

  const { currentPayment, isPolling, isPaid, createSePay, clearPayment } = usePayment();
  const { fetchById, detail: order } = useOrder();

  const [copied,    setCopied]    = useState(null);
  const [initDone,  setInitDone]  = useState(false); // đã fetch xong chưa

  // ── Init: fetch order + payment hiện có hoặc tạo mới
  useEffect(() => {
    if (!orderId) return;

    const init = async () => {
      // 1. Fetch order để lấy total
      await fetchById(orderId);

      // 2. Kiểm tra payment đã tồn tại chưa
      try {
        const { data } = await api.get("/payments/", {
          params: { order: orderId },
        });
        const existing = data.results?.[0] ?? data[0];

        if (existing) {
          // Đã có payment → dùng luôn
          dispatch(setCurrentPayment(existing));

          if (existing.status === "pending") {
            dispatch(startPolling());
            const stopFn = paymentApi.pollStatus(orderId, (paid) => {
              dispatch(setCurrentPayment(paid));
              dispatch(stopPolling());
            });
            window.__stopSePayPolling = stopFn;
          }
        } else {
          // Chưa có → tạo mới
          await createSePay(orderId);
        }
      } catch {
        // Fallback: tạo mới nếu fetch lỗi
        await createSePay(orderId);
      }

      setInitDone(true);
    };

    init();

    return () => {
      if (window.__stopSePayPolling) {
        window.__stopSePayPolling();
      }
    };
  }, [orderId]);

  // ── Redirect khi đã thanh toán
  useEffect(() => {
    if (isPaid) {
      setTimeout(() => {
        clearPayment();
        navigate(`/orders/${orderId}?success=true`);
      }, 2000);
    }
  }, [isPaid]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const paymentCode = currentPayment?.payment_code || `SHOP${orderId}`;
  console.log("current payment", currentPayment)
  // Ưu tiên: currentPayment.amount → order.total → 0
  // const amount = Number(currentPayment?.amount) || Number(order?.total) || 0;
  const amount = Number(order?.total)
console.log("ammount", amount)
  // Chỉ build QR khi có đủ dữ liệu
  const qrUrl = amount > 0
  ? `https://qr.sepay.vn/img` +
    `?acc=${BANK_NUMBER}` +
    `&bank=${BANK_NAME}` +
    `&amount=${Math.round(amount)}` +
    `&des=${encodeURIComponent(paymentCode)}` +
    `&template=compact` 
  : null;

  // ── Success screen
  if (isPaid) {
    return (
      <div className="payment-page">
        <Header />
        <div className="payment-success">
          <div className="payment-success__icon">✓</div>
          <h2 className="payment-success__title">Thanh toán thành công!</h2>
          <p className="payment-success__sub">Đang chuyển đến trang đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Header />

      <main className="payment-page__main">
        <div className="payment-page__inner">

          {/* ── Left: QR + info ── */}
          <div className="payment-card">
            <div className="payment-card__head">
              <h1 className="payment-card__title">Chuyển khoản ngân hàng</h1>
              <p className="payment-card__sub">Quét mã QR hoặc chuyển khoản thủ công</p>
            </div>

            {/* QR Code */}
            <div className="payment-qr">
              {qrUrl ? (
                <>
                  <img
                    src={qrUrl}
                    alt="QR thanh toán"
                    className="payment-qr__img"
                    onError={(e) => {
                      // Retry sau 2 giây nếu lỗi
                      setTimeout(() => {
                        e.target.src = qrUrl + "&_t=" + Date.now();
                      }, 2000);
                    }}
                  />
                  {isPolling && (
                    <div className="payment-qr__overlay">
                      <div className="payment-qr__pulse" />
                      <p>Đang chờ thanh toán...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="payment-qr__loading">
                  <div className="payment-qr__spinner" />
                  <p>{initDone ? "Không thể tạo mã QR" : "Đang tạo mã QR..."}</p>
                </div>
              )}
            </div>

            {/* Bank info */}
            <div className="bank-info">
              <div className="bank-info__row">
                <span className="bank-info__label">Ngân hàng</span>
                <span className="bank-info__val">{BANK_NAME}</span>
              </div>

              <div className="bank-info__row">
                <span className="bank-info__label">Số tài khoản</span>
                <div className="bank-info__copy-wrap">
                  <span className="bank-info__val bank-info__val--mono">{BANK_NUMBER}</span>
                  <button
                    className={`copy-btn ${copied === "acc" ? "copy-btn--done" : ""}`}
                    onClick={() => copy(BANK_NUMBER, "acc")}
                  >
                    {copied === "acc" ? "✓ Đã sao chép" : "Sao chép"}
                  </button>
                </div>
              </div>

              <div className="bank-info__row">
                <span className="bank-info__label">Chủ tài khoản</span>
                <span className="bank-info__val">{ACCOUNT_NAME}</span>
              </div>

              <div className="bank-info__row">
                <span className="bank-info__label">Số tiền</span>
                <span className="bank-info__val bank-info__val--amount">
                  {amount > 0
                    ? Number(amount).toLocaleString("vi-VN") + "₫"
                    : "Đang tải..."}
                </span>
              </div>

              <div className="bank-info__row bank-info__row--highlight">
                <span className="bank-info__label">Nội dung chuyển khoản</span>
                <div className="bank-info__copy-wrap">
                  <span className="bank-info__val bank-info__val--code">{paymentCode}</span>
                  <button
                    className={`copy-btn ${copied === "code" ? "copy-btn--done" : ""}`}
                    onClick={() => copy(paymentCode, "code")}
                  >
                    {copied === "code" ? "✓ Đã sao chép" : "Sao chép"}
                  </button>
                </div>
              </div>
            </div>

            <div className="payment-warn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>
                Vui lòng ghi <strong>đúng nội dung chuyển khoản</strong> để hệ thống xác nhận tự động.
              </p>
            </div>
          </div>

          {/* ── Right: order info ── */}
          <div className="payment-order">
            <h2 className="payment-order__title">Thông tin đơn hàng #{orderId}</h2>

            {order ? (
              <>
                <div className="payment-order__section">
                  <p className="payment-order__label">Địa chỉ giao hàng</p>
                  <p className="payment-order__val">{order.shipping_full_name}</p>
                  <p className="payment-order__val payment-order__val--muted">{order.shipping_phone}</p>
                  <p className="payment-order__val payment-order__val--muted">
                    {order.shipping_address}, {order.shipping_ward},{" "}
                    {order.shipping_district}, {order.shipping_city}
                  </p>
                </div>

                <div className="payment-order__divider" />

                <div className="payment-order__items">
                  {order.items?.map((item) => (
                    <div key={item.id} className="payment-order__item">
                      <span className="payment-order__item-name">
                        {item.product_name}
                        {item.quantity > 1 && (
                          <span className="payment-order__item-qty"> ×{item.quantity}</span>
                        )}
                      </span>
                      <span className="payment-order__item-price">
                        {Number(item.subtotal).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ))}
                </div>

                <div className="payment-order__divider" />

                <div className="payment-order__rows">
                  <div className="payment-order__row">
                    <span>Tạm tính</span>
                    <span>{Number(order.subtotal).toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="payment-order__row">
                    <span>Phí vận chuyển</span>
                    <span>
                      {Number(order.shipping_fee) === 0
                        ? "Miễn phí"
                        : `${Number(order.shipping_fee).toLocaleString("vi-VN")}₫`}
                    </span>
                  </div>
                </div>

                <div className="payment-order__total">
                  <span>Tổng cộng</span>
                  <span>{Number(order.total).toLocaleString("vi-VN")}₫</span>
                </div>
              </>
            ) : (
              <div className="payment-order__loading">
                <div className="payment-qr__spinner" />
              </div>
            )}

            <div className="payment-status">
              <div className={`payment-status__dot ${isPolling ? "payment-status__dot--pulse" : ""}`} />
              <span>
                {isPolling ? "Đang chờ xác nhận thanh toán..." : "Chưa xác nhận"}
              </span>
            </div>

            <button
              className="payment-cancel"
              onClick={() => navigate(`/orders/${orderId}`)}
            >
              Quay lại đơn hàng
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Payment;
