import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer  from "../../components/footer/footer.component";
import { useProduct } from "../../store/hooks";
import { useCart }    from "../../store/hooks";
import AIChat from "../aichat/ai-chat.component";
import "./home.styles.scss";

// ─── Product Card ───────────────────────-------
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
          src={product.thumbnail || "https://placehold.co/400x400/f5f0e8/c8a96e?text=No+Image"}
//                                              ↑ đổi 400x500 → 400x400 nếu ảnh vuông
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



const CategoryTabs = ({ categories, activeSlug, onSelect }) => (
  <div className="cat-grid">
    {/* ALL */}
    <div
      className={`cat-card ${!activeSlug ? "cat-card--active" : ""}`}
      onClick={() => onSelect(null)}
    >
      <img
        src="https://tse1.mm.bing.net/th/id/OIP.IAjyExlxl91euz8tn3NW4gHaFP?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
        alt="all"
        className="cat-card__img"
      />
      <div className="cat-card__overlay">
        <h3>ALL PRODUCTS</h3>
      </div>
    </div>

    {/* CATEGORIES */}
    {categories.map((cat) => (
      <div
        key={cat.id}
        className={`cat-card ${
          activeSlug === cat.slug ? "cat-card--active" : ""
        }`}
        onClick={() => onSelect(cat.slug)}
      >
        <img
          src={cat.image || "https://placehold.co/600x600"}
          alt={cat.name}
          className="cat-card__img"
        />

        <div className="cat-card__overlay">
          <h3>{cat.name}</h3>
        </div>
      </div>
    ))}
  </div>
);

// ─── Skeleton ───────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-card__img" />
    <div className="skeleton-card__line skeleton-card__line--sm" />
    <div className="skeleton-card__line" />
    <div className="skeleton-card__line skeleton-card__line--sm" />
  </div>
);

// ─── Home Page ──────────────────────────────────────────────────
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
// ─── Bestsellers ─────────────────────────────---------------------
const bestsellers = products
  ?.filter((p) => p.is_featured === true)
  ?.slice(0, 8) || [];


  return (
  <div className="home">
    <Header onSearch={handleSearch} />

    {/* ───────── HERO BANNER ───────── */}
    <section className="top-banner">
      <div className="top-banner__slider">
        <img
          src="https://i.ibb.co/v4SNDMvf/7d98ef97f6734024826a1ebdeae21a4a-tplv-reeeghz8mm-image-1600w.png"
          alt="banner"
          className="top-banner__img"
        />
      </div>
    </section>

    {/* ───────── SHOP BY COLLECTION ───────── */}
    
    <section className="section">
  <div className="section__inner">
    <div className="section__head">
      <h2 className="section__title">SHOP BY COLLECTION</h2>
    </div>

    <div className="products-grid">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        : products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={handleAddToCart}
            />
          ))}
    </div>
  </div>
</section>

    {/* ───────── CATEGORY TABS ───────── */}
     // <section className="category-section">
      <CategoryTabs
        categories={categories}
        activeSlug={activeCategory}
        onSelect={handleCategorySelect}
      />
    </section>  

    {/* ───────── BEST SELLERS ───────── */}
    <section className="section" id="bestsellers">
      <div className="section__inner">
        <div className="section__head">
          <h2 className="section__title">BEST SELLERS</h2>
        </div>

        <div className="products-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : bestsellers.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                /> 
              ))}
        </div>
      </div>
    </section>

    <AIChat />
    <Footer />
  </div>
);
};

export default Home;