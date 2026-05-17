import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import api from "../../utils/api/api";
import "./admin.styles.scss";
import AdminCreateProduct from './AdminCreateProduct';
import AdminEditProduct from "./AdminEditProduct";
// ─── Icons ────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
    products:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    orders:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
    users:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    logout:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    store:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    up:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
    down:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
    edit:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    check:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    search:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  };
  return <span className="adm-icon">{icons[name]}</span>;
};

// ─── Status Badge ─────────────────────────────────────────────────
const STATUS = {
  pending:    { label: "Chờ xác nhận", cls: "amber"  },
  confirmed:  { label: "Đã xác nhận",  cls: "blue"   },
  processing: { label: "Đang xử lý",   cls: "blue"   },
  shipped:    { label: "Đang giao",    cls: "purple" },
  delivered:  { label: "Đã giao",      cls: "green"  },
  cancelled:  { label: "Đã huỷ",       cls: "red"    },
  refunded:   { label: "Hoàn tiền",    cls: "gray"   },
};

const Badge = ({ status }) => {
  const s = STATUS[status] || { label: status, cls: "gray" };
  return <span className={`adm-badge adm-badge--${s.cls}`}>{s.label}</span>;
};

// ─── Stat Card ────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon }) => (
  <div className={`adm-stat adm-stat--${color}`}>
    <div className="adm-stat__icon"><Icon name={icon} /></div>
    <div className="adm-stat__body">
      <p className="adm-stat__label">{label}</p>
      <p className="adm-stat__value">{value}</p>
      {sub && <p className="adm-stat__sub">{sub}</p>}
    </div>
  </div>
);

// ─── Mini Bar Chart ───────────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="adm-chart">
      {data.map((d, i) => (
        <div key={i} className="adm-chart__col">
          <div className="adm-chart__bar-wrap">
            <div
              className="adm-chart__bar"
              style={{ height: `${(d.revenue / max) * 100}%` }}
              title={`${d.revenue.toLocaleString("vi-VN")}₫`}
            />
          </div>
          <span className="adm-chart__label">{d.date}</span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin-panel/dashboard/")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading"><div className="adm-spinner" /></div>;
  if (!data)   return <div className="adm-empty">Không tải được dữ liệu.</div>;

  const { stats, revenue_chart, recent_orders, top_products, status_breakdown } = data;
  console.log("stat",stats)
  return (
    <div className="adm-tab">
      <div className="adm-tab__head">
        <h1 className="adm-tab__title">Dashboard</h1>
        <p className="adm-tab__sub">Tổng quan hệ thống</p>
      </div>

      {/* Stats */}
      <div className="adm-stats-grid">
        <StatCard
    label="Doanh thu tổng"
    value={`${(stats.revenue.total ).toFixed(1)}₫`}
    sub="toàn hệ thống"
    color="green"
    icon="products"
  />
        <StatCard label="Đơn hàng tháng"  value={stats.orders.month}    sub={`${stats.orders.pending} chờ xử lý`}    color="blue"   icon="orders"   />
        <StatCard label="Doanh thu tháng" value={`${(stats.revenue.month).toFixed(1)}₫`} sub="đơn đã xác nhận" color="green"  icon="products" />
        <StatCard label="Sản phẩm"        value={stats.products.total}  sub={`${stats.products.low_stock} sắp hết`}  color="amber"  icon="products" />
        <StatCard label="Người dùng"      value={stats.users.total}     sub={`+${stats.users.month} tháng này`}      color="purple" icon="users"    />
      </div>

      <div className="adm-panels">
        {/* Revenue chart */}
        <div className="adm-panel adm-panel--wide">
          <h3 className="adm-panel__title">Doanh thu 7 ngày gần nhất</h3>
          <BarChart data={revenue_chart} />
          <div className="adm-chart__totals">
            {revenue_chart.map((d, i) => (
              <div key={i} className="adm-chart__total-item">
                <span className="adm-chart__total-date">{d.date}</span>
                <span className="adm-chart__total-val">{d.revenue > 0 ? `${(d.revenue/1000).toFixed(0)}k` : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="adm-panel">
          <h3 className="adm-panel__title">Sản phẩm bán chạy</h3>
          <div className="adm-top-list">
            {top_products.map((p, i) => (
              <div key={i} className="adm-top-item">
                <span className="adm-top-rank">{i + 1}</span>
                <span className="adm-top-name">{p.name}</span>
                <span className="adm-top-val">{p.total_sold} đã bán</span>
              </div>
            ))}
            {top_products.length === 0 && <p className="adm-empty-sm">Chưa có dữ liệu</p>}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="adm-panel">
        <div className="adm-panel__head">
          <h3 className="adm-panel__title">Đơn hàng gần đây</h3>
          <button className="adm-link" onClick={() => navigate("/admin/orders")}>Xem tất cả →</button>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>#</th><th>Khách hàng</th><th>Trạng thái</th><th>SP</th><th>Tổng</th><th>Thời gian</th></tr>
            </thead>
            <tbody>
              {recent_orders.map((o) => (
                <tr key={o.id} className="adm-table__row--clickable"
                  onClick={() => navigate(`/admin/orders?id=${o.id}`)}>
                  <td className="adm-table__mono">#{o.id}</td>
                  <td>{o.user}</td>
                  <td><Badge status={o.status} /></td>
                  <td>{o.items_count}</td>
                  <td className="adm-table__price">{o.total.toLocaleString("vi-VN")}₫</td>
                  <td className="adm-table__muted">{o.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════════
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [filter,  setFilter]    = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const load = useCallback(() => {
    setLoading(true);
    api.get("/admin-panel/products/", { params: { search, status: filter } })
      .then((r) => setProducts(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id, cur) => {
    await api.post(`/admin-panel/products/${id}/toggle_active/`);
    setProducts((ps) => ps.map((p) => p.id === id ? { ...p, is_active: !cur } : p));
  };

  const toggleFeatured = async (id, cur) => {
    await api.post(`/admin-panel/products/${id}/toggle_featured/`);
    setProducts((ps) => ps.map((p) => p.id === id ? { ...p, is_featured: !cur } : p));
  };

  return (
    <div className="adm-tab">
      <div className="adm-tab__head">
        <div>
          <h1 className="adm-tab__title">Sản phẩm</h1>
          <p className="adm-tab__sub">{products.length} sản phẩm</p>
        </div>
      </div>

      {/* Filters */}
      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <div className="adm-filters">
          {["", "active", "inactive"].map((v) => (
            <button
              key={v}
              className={`adm-filter-btn ${filter === v ? "adm-filter-btn--active" : ""}`}
              onClick={() => setFilter(v)}
            >
              {v === "" ? "Tất cả" : v === "active" ? "Đang bán" : "Ẩn"}
            </button>
            
          ))}
          <button className="adm-btn-primary" onClick={() => setShowCreate(true)}>+ Thêm sản phẩm</button>
          {showCreate && <AdminCreateProduct onClose={() => setShowCreate(false)} onCreated={load} />}
        </div>
      </div>

      {loading ? (
        <div className="adm-loading"><div className="adm-spinner" /></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
            <th>Sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Đang bán</th>
            <th>Nổi bật</th>
            <th>Biến thể</th>
            <th>Hành động</th>
            </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="adm-product-cell">
                      <img
                        src={p.thumbnail || "https://placehold.co/48x48/f5f0e8/c8a96e?text=?"}
                        alt={p.name}
                        className="adm-product-thumb"
                      />
                      <div>
                        <p className="adm-product-name">{p.name}</p>
                        <p className="adm-product-slug">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name || "—"}</td>
                  <td className="adm-table__price">{Number(p.base_price).toLocaleString("vi-VN")}₫</td>
                  <td>
                    <button
                      className={`adm-toggle ${p.is_active ? "adm-toggle--on" : ""}`}
                      onClick={() => toggleActive(p.id, p.is_active)}
                    >
                      <span className="adm-toggle__knob" />
                    </button>
                  </td>
                  <td>
                    <button
                      className={`adm-toggle ${p.is_featured ? "adm-toggle--on" : ""}`}
                      onClick={() => toggleFeatured(p.id, p.is_featured)}
                    >
                      <span className="adm-toggle__knob" />
                    </button>
                  </td>
                  <td>{p.variants?.length ?? 0}</td>
                  <td>
  <button
    className="adm-action-btn"
    onClick={() => setEditingProduct(p)}
  >
    <Icon name="edit" />
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
          {
  editingProduct && (
    <AdminCreateProduct
      editData={editingProduct}
      onClose={() => setEditingProduct(null)}
      onCreated={() => {
        setEditingProduct(null);
        load();
      }}
    />
  )
}
          {products.length === 0 && <div className="adm-empty">Không tìm thấy sản phẩm.</div>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════════
const Orders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("");
  const [detail,  setDetail]  = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/admin-panel/orders/", { params: { search, status: filter } })
      .then((r) => setOrders(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [search, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, newStatus) => {
    const { data } = await api.patch(`/admin-panel/orders/${id}/update_status/`, { status: newStatus });
    setOrders((os) => os.map((o) => o.id === id ? data : o));
    if (detail?.id === id) setDetail(data);
  };

  const STATUS_OPTIONS = Object.keys(STATUS);

  return (
    <div className="adm-tab">
      <div className="adm-tab__head">
        <div>
          <h1 className="adm-tab__title">Đơn hàng</h1>
          <p className="adm-tab__sub">{orders.length} đơn</p>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input
            placeholder="Tìm theo ID, tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <div className="adm-filters">
          <button className={`adm-filter-btn ${filter === "" ? "adm-filter-btn--active" : ""}`} onClick={() => setFilter("")}>Tất cả</button>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} className={`adm-filter-btn ${filter === s ? "adm-filter-btn--active" : ""}`} onClick={() => setFilter(s)}>
              {STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-orders-layout">
        {/* Table */}
        <div className={`adm-table-wrap ${detail ? "adm-table-wrap--narrow" : ""}`}>
          {loading ? (
            <div className="adm-loading"><div className="adm-spinner" /></div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr><th>#</th><th>Khách hàng</th><th>Địa chỉ</th><th>Trạng thái</th><th>Tổng</th><th>Ngày</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className={`adm-table__row--clickable ${detail?.id === o.id ? "adm-table__row--selected" : ""}`}
                    onClick={() => setDetail(detail?.id === o.id ? null : o)}
                  >
                    <td className="adm-table__mono">#{o.id}</td>
                    <td>{o.shipping_full_name}<br /><span className="adm-table__muted">{o.shipping_phone}</span></td>
                    <td className="adm-table__muted">{o.shipping_district}, {o.shipping_city}</td>
                    <td><Badge status={o.status} /></td>
                    <td className="adm-table__price">{Number(o.total).toLocaleString("vi-VN")}₫</td>
                    <td className="adm-table__muted">{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && orders.length === 0 && <div className="adm-empty">Không có đơn hàng.</div>}
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="adm-order-detail">
            <div className="adm-order-detail__head">
              <h3>Đơn hàng #{detail.id}</h3>
              <button className="adm-close" onClick={() => setDetail(null)}>✕</button>
            </div>

            <div className="adm-order-detail__section">
              <p className="adm-order-detail__label">Khách hàng</p>
              <p className="adm-order-detail__val">{detail.shipping_full_name}</p>
              <p className="adm-order-detail__muted">{detail.shipping_phone}</p>
              <p className="adm-order-detail__muted">
                {detail.shipping_address}, {detail.shipping_ward}, {detail.shipping_district}, {detail.shipping_city}
              </p>
            </div>

            {detail.note && (
              <div className="adm-order-detail__section">
                <p className="adm-order-detail__label">Ghi chú</p>
                <p className="adm-order-detail__muted">{detail.note}</p>
              </div>
            )}

            <div className="adm-order-detail__section">
              <p className="adm-order-detail__label">Sản phẩm</p>
              {detail.items?.map((item) => (
                <div key={item.id} className="adm-order-item">
                  <span className="adm-order-item__name">{item.product_name}</span>
                  <span className="adm-order-item__qty">×{item.quantity}</span>
                  <span className="adm-order-item__price">{Number(item.subtotal).toLocaleString("vi-VN")}₫</span>
                </div>
              ))}
            </div>

            <div className="adm-order-detail__total">
              <span>Tổng cộng</span>
              <span>{Number(detail.total).toLocaleString("vi-VN")}₫</span>
            </div>

            <div className="adm-order-detail__section">
              <p className="adm-order-detail__label">Cập nhật trạng thái</p>
              <div className="adm-status-select">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className={`adm-status-opt ${detail.status === s ? "adm-status-opt--active" : ""}`}
                    onClick={() => updateStatus(detail.id, s)}
                  >
                    {STATUS[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════
const Users = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [total,   setTotal]   = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/admin-panel/users/", { params: { search } })
      .then((r) => { setUsers(r.data.results); setTotal(r.data.count); })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id, cur) => {
    await api.patch("/admin-panel/users/", { id, is_active: !cur });
    setUsers((us) => us.map((u) => u.id === id ? { ...u, is_active: !cur } : u));
  };

  return (
    <div className="adm-tab">
      <div className="adm-tab__head">
        <div>
          <h1 className="adm-tab__title">Người dùng</h1>
          <p className="adm-tab__sub">{total} tài khoản</p>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input
            placeholder="Tìm theo username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
      </div>

      {loading ? (
        <div className="adm-loading"><div className="adm-spinner" /></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Username</th><th>Họ tên</th><th>Email</th><th>Đơn hàng</th><th>Ngày tham gia</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="adm-table__mono">{u.username}</td>
                  <td>{u.full_name || "—"}</td>
                  <td className="adm-table__muted">{u.email}</td>
                  <td>{u.orders_count}</td>
                  <td className="adm-table__muted">{u.date_joined}</td>
                  <td>
                    <button
                      className={`adm-toggle ${u.is_active ? "adm-toggle--on" : ""}`}
                      onClick={() => toggleActive(u.id, u.is_active)}
                    >
                      <span className="adm-toggle__knob" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="adm-empty">Không tìm thấy người dùng.</div>}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ADMIN LAYOUT
// ═══════════════════════════════════════════════════════════════════
const NAV = [
  { key: "dashboard", label: "Dashboard", path: "/admin" },
  { key: "products",  label: "Sản phẩm",  path: "/admin/products" },
  { key: "orders",    label: "Đơn hàng",  path: "/admin/orders" },
  { key: "users",     label: "Người dùng", path: "/admin/users" },
];

const AdminLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Guard: chỉ admin mới vào được
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    // Kiểm tra qua API
    api.get("/admin-panel/dashboard/").catch(() => {
      alert("Bạn không có quyền truy cập trang Admin.");
      navigate("/");
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const active = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`adm ${collapsed ? "adm--collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          {!collapsed && (
            <>
              <span className="adm-brand-mark">C</span>
              <span className="adm-brand-text">LOTH</span>
              <span className="adm-brand-tag">Admin</span>
            </>
          )}
          <button className="adm-collapse-btn" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className="adm-nav">
          {NAV.map(({ key, label, path }) => (
            <button
              key={key}
              className={`adm-nav__item ${active(path) ? "adm-nav__item--active" : ""}`}
              onClick={() => navigate(path)}
              title={collapsed ? label : ""}
            >
              <Icon name={key} />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <button className="adm-nav__item" onClick={() => navigate("/")} title="Xem cửa hàng">
            <Icon name="store" />
            {!collapsed && <span>Cửa hàng</span>}
          </button>
          <button className="adm-nav__item adm-nav__item--danger" onClick={handleLogout} title="Đăng xuất">
            <Icon name="logout" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        <Routes>
          <Route index        element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders"   element={<Orders />} />
          <Route path="users"    element={<Users />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;