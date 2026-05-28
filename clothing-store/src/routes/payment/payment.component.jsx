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

  const [copied,   setCopied]   = useState(null);
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const init = async () => {
      await fetchById(orderId);

      try {
        const { data } = await api.get("/payments/", {
          params: { order: orderId },
        });
        console.log(">>> RAW data:", data);
  console.log(">>> data.id:", data?.id);

        // API có thể trả về object thẳng, array, hoặc { results: [] }
        let existing = null;
if (data?.id) {
  existing = data;
} else if (Array.isArray(data)) {
  // Filter đúng order thay vì lấy [0]
  existing = data.find(p => String(p.order) === String(orderId)) ?? null;
} else if (data?.results) {
  existing = data.results.find(p => String(p.order) === String(orderId)) ?? null;
}

        console.log(">>> existing sau parse:", existing);

        if (existing) {
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
          const payment = await createSePay(orderId);
          if (payment) {
            dispatch(setCurrentPayment(payment));
            if (payment.status === "pending") {
              dispatch(startPolling());
              const stopFn = paymentApi.pollStatus(orderId, (paid) => {
                dispatch(setCurrentPayment(paid));
                dispatch(stopPolling());
              });
              window.__stopSePayPolling = stopFn;
            }
          }
        }
      } catch (err) {
        console.error(">>> RƠI VÀO CATCH:", err);
        const payment = await createSePay(orderId);
        if (payment) {
          dispatch(setCurrentPayment(payment));
        }
      }

      setInitDone(true);
    };

    init();

    return () => {
      window.__stopSePayPolling?.();
    };
  }, [orderId]);

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

  const paymentCode = currentPayment?.payment_code ?? "";
  const amount      = Number(order?.total) || 0;

  console.log("current payment", currentPayment);
  console.log("payment_code", paymentCode);
  console.log("amount", amount);

  const qrUrl = amount > 0 && paymentCode
    ? `https://qr.sepay.vn/img` +
      `?acc=${BANK_NUMBER}` +
      `&bank=${BANK_NAME}` +
      `&amount=${Math.round(amount)}` +
      `&des=${encodeURIComponent(paymentCode)}` +
      `&template=compact`
    : null;

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

            <div className="payment-qr">
              {qrUrl ? (
                <>
                  <img
                    src={qrUrl}
                    alt="QR thanh toán"
                    className="payment-qr__img"
                    onError={(e) => {
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
                    ? amount.toLocaleString("vi-VN") + "₫"
                    : "Đang tải..."}
                </span>
              </div>

              <div className="bank-info__row bank-info__row--highlight">
                <span className="bank-info__label">Nội dung chuyển khoản</span>
                <div className="bank-info__copy-wrap">
                  <span className="bank-info__val bank-info__val--code">
                    {paymentCode || "Đang tải..."}
                  </span>
                  <button
                    className={`copy-btn ${copied === "code" ? "copy-btn--done" : ""}`}
                    onClick={() => copy(paymentCode, "code")}
                    disabled={!paymentCode}
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