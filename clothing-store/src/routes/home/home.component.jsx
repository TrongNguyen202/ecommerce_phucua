import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer  from "../../components/footer/footer.component";
import { useProduct } from "../../store/hooks";
import { useCart }    from "../../store/hooks";
import "./home.styles.scss";

// ─── Product Card ────────────────────────────────────────────────
const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug}`)}>
      <div className="product-card__img-wrap">
        <img
          src={product.thumbnail || "https://placehold.co/400x500/f5f0e8/c8a96e?text=No+Image"}
          alt={product.name}
          className="product-card__img"
          loading="lazy"
        />
        <button
          className={`product-card__add ${added ? "product-card__add--added" : ""}`}
          onClick={handleAdd}
        >
          {added ? "✓ Đã thêm" : "+ Thêm vào giỏ"}
        </button>
      </div>
      <div className="product-card__info">
        <p className="product-card__cat">{product.category?.name || ""}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">
          {Number(product.base_price).toLocaleString("vi-VN")}₫
        </p>
      </div>
    </div>
  );
};

// ─── Category Tab ────────────────────────────────────────────────
const CategoryTabs = ({ categories, activeSlug, onSelect }) => (
  <div className="cat-tabs">
    <button
      className={`cat-tabs__item ${!activeSlug ? "cat-tabs__item--active" : ""}`}
      onClick={() => onSelect(null)}
    >
      Tất cả
    </button>
    {categories.map((cat) => (
      <button
        key={cat.id}
        className={`cat-tabs__item ${activeSlug === cat.slug ? "cat-tabs__item--active" : ""}`}
        onClick={() => onSelect(cat.slug)}
      >
        {cat.name}
      </button>
    ))}
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-card__img" />
    <div className="skeleton-card__line skeleton-card__line--sm" />
    <div className="skeleton-card__line" />
    <div className="skeleton-card__line skeleton-card__line--sm" />
  </div>
);

// ─── Home Page ───────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const {
    list: products,
    featured,
    categories,
    loading,
    filters,
    fetchAll,
    fetchFeatured,
    fetchCategories,
    setFilters,
  } = useProduct();

  const { addToCart } = useCart();

  const [activeCategory, setActiveCategory] = useState(null);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchFeatured();
    fetchAll({});
  }, []);

  // Fetch khi filter thay đổi
  useEffect(() => {
    const params = {};
    if (activeCategory)   params.category    = activeCategory;
    if (filters.search)   params.search      = filters.search;
    fetchAll(params);
  }, [activeCategory, filters.search]);

  // home.component.jsx — sửa hàm handleSearch
const handleSearch = (q) => {
  if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
};

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug);
  };

  const handleAddToCart = (product) => {
    // Nếu sản phẩm có variant thì navigate sang detail để chọn size/màu
    navigate(`/product/${product.slug}`);
  };

  // Bestsellers: filter featured từ products hoặc dùng featured list
  // Bestsellers
// ─── Bestsellers ─────────────────────────────
const bestsellers = products
  ?.filter((p) => p.is_featured === true)
  ?.slice(0, 8) || [];

  return (
    <div className="home">
      <Header onSearch={handleSearch} />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Bộ sưu tập mới 2025</p>
          <h1 className="hero__title">
            Wear It.<br />Live Style
          </h1>
          <p className="hero__sub">
            Thời trang cao cấp, chất liệu bền vững — dành cho người biết mình muốn gì.
          </p>
          <div className="hero__btns">
            <button className="btn btn--primary" onClick={() => navigate("/shop")}>
              Khám phá ngay
            </button>
            <button className="btn btn--ghost" onClick={() => {
              document.getElementById("bestsellers")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Bestsellers
            </button>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__blob" />
          <img
            src="https://pub-1407f82391df4ab1951418d04be76914.r2.dev/uploads/32631a4b-4089-4840-a361-1b14a369d762.png" 
            alt="hero fashion"
            className="hero__img"
          />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="section__inner">
          <div className="section__head">
            <h2 className="section__title">Danh mục</h2>
            <p className="section__sub">Chọn phong cách của bạn</p>
          </div>

          <CategoryTabs
            categories={categories}
            activeSlug={activeCategory}
            onSelect={handleCategorySelect}
          />

          {/* Products grid */}
          <div className="products-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.length === 0
              ? (
                <div className="empty-state">
                  <p>Không tìm thấy sản phẩm nào.</p>
                </div>
              )
              : products.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
              ))
            }
          </div>

          {products.length > 0 && (
            <div className="section__more">
              <button className="btn btn--outline" onClick={() => navigate("/shop")}>
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="banner">
        <div className="banner__inner">
          <p className="banner__label">Ưu đãi đặc biệt</p>
          <h2 className="banner__title">Miễn phí vận chuyển cho đơn từ 500.000₫</h2>
          <button className="btn btn--primary" onClick={() => navigate("/shop")}>
            Mua ngay
          </button>
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className="section" id="bestsellers">
        <div className="section__inner">
          <div className="section__head">
            <h2 className="section__title">Bestsellers</h2>
            <p className="section__sub">Những sản phẩm được yêu thích nhất</p>
          </div>

          <div className="products-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.length === 0
              ? <p className="empty-state">Chưa có sản phẩm nổi bật.</p>
              : bestsellers.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
              ))
            }
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
