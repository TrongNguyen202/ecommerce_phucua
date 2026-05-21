import axios from "axios";

// ==========================================
// CONFIG
// ==========================================

const BASE_URL = import.meta.env.VITE_API_URL || "https://sundesign.io/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // gửi cookie session cho guest cart
});

// ==========================================
// INTERCEPTORS
// ==========================================

// Tự động gắn access token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// api.defaults.xsrfCookieName = "csrftoken";
// api.defaults.xsrfHeaderName = "X-CSRFToken";

// Tự động refresh token khi nhận 401
// Tự động refresh token khi nhận 401
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const original = error.config;
//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true;
//       try {
//         const refresh = localStorage.getItem("refresh_token");
//         if (!refresh) throw new Error("No refresh token");

//         const { data } = await axios.post(
//           `${BASE_URL}/users/token/refresh/`,  // ← đúng URL
//           { refresh }
//         );
//         localStorage.setItem("access_token", data.access);
//         original.headers.Authorization = `Bearer ${data.access}`;
//         return api(original);
//       } catch {
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Tránh loop vô hạn khi refresh cũng fail
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${BASE_URL}/auth/users/token/refresh/`,  // ← đúng URL của bạn
          { refresh }
        );

        localStorage.setItem("access_token", data.access);

        // Nếu backend rotate refresh token thì lưu lại
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }

        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);

      } catch {
        // Refresh fail → xoá token → về login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
export const initCSRF = async () => {
  await api.get("auth/users/csrf/"); // backend phải có endpoint này
};
// ==========================================
// AUTH
// ==========================================

export const authApi = {
  /** POST /auth/token/ — đăng nhập, nhận access + refresh token */
  login: (username, password) =>
    api.post("/auth/users/login/", { username, password }),

  /** POST /auth/token/refresh/ — lấy access token mới */
  refresh: (refresh) =>
    api.post("/auth//users/token/refresh/", { refresh }),

  /** POST /auth/register/ — đăng ký tài khoản */
  register: (data) =>
    api.post("/auth/users/register/", data),
  changePassword: (old_password, new_password) =>
    api.post("/auth/users/change-password/", { old_password, new_password }),
};

// ==========================================
// ACCOUNTS
// ==========================================

export const accountsApi = {
  /** GET /accounts/me/ — lấy thông tin user hiện tại */
  getMe: () =>
    api.get("/accounts/me/"),

  /** PATCH /accounts/me/ — cập nhật profile */
  updateMe: (data) =>
    api.patch("/accounts/me/", data),

  /** GET /accounts/addresses/ — danh sách địa chỉ */
  getAddresses: () =>
    api.get("/accounts/addresses/"),

  /** POST /accounts/addresses/ — tạo địa chỉ mới */
  createAddress: (data) =>
    api.post("/accounts/addresses/", data),

  /** PUT /accounts/addresses/:id/ — cập nhật địa chỉ */
  updateAddress: (id, data) =>
    api.put(`/accounts/addresses/${id}/`, data),

  /** DELETE /accounts/addresses/:id/ — xoá địa chỉ */
  deleteAddress: (id) =>
    api.delete(`/accounts/addresses/${id}/`),

  /** POST /accounts/addresses/:id/set_default/ — đặt địa chỉ mặc định */
  setDefaultAddress: (id) =>
    api.post(`/accounts/addresses/${id}/set_default/`),
};

// ==========================================
// CATEGORIES
// ==========================================

export const categoryApi = {
  /** GET /categories/ — danh sách tất cả category */
  getAll: () =>
    api.get("/categories/"),

  /** GET /categories/:slug/ — chi tiết category */
  getBySlug: (slug) =>
    api.get(`/categories/${slug}/`),

  /** GET /categories/:slug/products/ — sản phẩm theo category */
  getProducts: (slug) =>
    api.get(`/categories/${slug}/products/`),
};

// ==========================================
// PRODUCTS
// ==========================================

export const productApi = {
  /**
   * GET /products/ — danh sách sản phẩm
   * @param {Object} params - { category, is_featured, search, page }
   */
  getAll: (params = {}) =>
    api.get("/products/", { params }),

  /** GET /products/:slug/ — chi tiết sản phẩm */
  getBySlug: (slug) =>
    api.get(`/products/${slug}/`),

  /** GET /products/featured/ — sản phẩm nổi bật */
  getFeatured: () =>
    api.get("/products/featured/"),
};

// ==========================================
// VARIANTS
// ==========================================

export const variantApi = {
  /**
   * GET /variants/ — danh sách variant
   * @param {Object} params - { product } lọc theo product id
   */
  getAll: (params = {}) =>
    api.get("/variants/", { params }),

  /** GET /variants/:id/ — chi tiết variant */
  getById: (id) =>
    api.get(`/variants/${id}/`),

  /** GET /sizes/ — danh sách size */
  getSizes: () =>
    api.get("/sizes/"),

  /** GET /colors/ — danh sách màu */
  getColors: () =>
    api.get("/colors/"),
};

// ==========================================
// CART
// ==========================================

export const cartApi = {
  /** GET /cart/me/ — lấy cart hiện tại (user hoặc guest) */
  getCart: () =>
    api.get("/cart/me/"),

  /**
   * POST /cart/add/ — thêm sản phẩm vào cart
   * @param {number} variantId
   * @param {number} quantity
   */
 // api.js
    addItem: (variantId, quantity = 1) =>
    api.post("/cart/add/", { variant_id: variantId, quantity }),

  /**
   * PATCH /cart/update/:itemId/ — cập nhật số lượng
   * @param {number} itemId
   * @param {number} quantity
   */
  updateItem: (itemId, quantity) =>
    api.patch(`/cart/update/${itemId}/`, { quantity }),

  /** DELETE /cart/remove/:itemId/ — xoá 1 item */
  removeItem: (itemId) =>
    api.delete(`/cart/remove/${itemId}/`),

  /** DELETE /cart/clear/ — xoá toàn bộ cart */
  clearCart: () =>
    api.delete("/cart/clear/"),
};

// ==========================================
// ORDERS
// ==========================================

export const orderApi = {
  /** GET /orders/ — lịch sử đơn hàng */
  getAll: () =>
    api.get("/orders/"),

  /** GET /orders/:id/ — chi tiết đơn hàng */
  getById: (id) =>
    api.get(`/orders/${id}/`),

  /**
   * POST /orders/checkout/ — tạo đơn hàng từ cart
   * @param {Object} data - { address_id, note, shipping_fee }
   */
  checkout: (data) =>
    api.post("/orders/checkout/", data),

  /** POST /orders/:id/cancel/ — huỷ đơn hàng */
  cancel: (id) =>
    api.post(`/orders/${id}/cancel/`),
};

// ==========================================
// PAYMENTS
// ==========================================

export const paymentApi = {
  /** GET /payments/ — lịch sử thanh toán */
  getAll: () =>
    api.get("/payments/"),

  /** GET /payments/:id/ — chi tiết thanh toán */
  getById: (id) =>
    api.get(`/payments/${id}/`),

  /**
   * POST /payments/create_payment/ — tạo payment cho đơn hàng
   * @param {number} orderId
   * @param {"sepay"|"cod"} method
   */
  createPayment: (orderId, method) =>
    api.post("/payments/create_payment/", { order_id: orderId, method }),

  /**
   * Polling kiểm tra trạng thái thanh toán
   * Dùng sau khi user chuyển khoản SePay, gọi mỗi 5 giây
   * @param {number} orderId
   * @param {Function} onPaid - callback khi paid
   * @param {number} timeout - ms, mặc định 10 phút
   */
  pollStatus: (orderId, onPaid, timeout = 10 * 60 * 1000) => {
    const start    = Date.now();
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get("/payments/", {
          params: { order: orderId },
        });

        const payment = data.results?.[0] || data[0];

        if (payment?.status === "paid") {
          clearInterval(interval);
          onPaid(payment);
        }

        if (Date.now() - start >= timeout) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 5000);

    // Trả về hàm để cancel polling thủ công nếu cần
    return () => clearInterval(interval);
  },
};

export const adminApi = {
  getDashboard: ()        => api.get("/admin-panel/dashboard/"),
  getProducts:  (params)  => api.get("/admin-panel/products/", { params }),
  getOrders:    (params)  => api.get("/admin-panel/orders/",   { params }),
  updateOrder:  (id, data) => api.patch(`/admin-panel/orders/${id}/update_status/`, data),
  getUsers:     (params)  => api.get("/admin-panel/users/",    { params }),
  toggleUser:   (data)    => api.patch("/admin-panel/users/",  data),
};

// ==========================================
// EXPORT DEFAULT
// ==========================================

export default api;