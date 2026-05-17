import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer  from "../../components/footer/footer.component";
import { useProduct } from "../../store/hooks";
import { useCart }    from "../../store/hooks";
import "./search.styles.scss";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  return (
    <div className="s-card" onClick={() => navigate(`/product/${product.slug}`)}>
      <div className="s-card__img-wrap">
        <img
          src={product.thumbnail || "https://placehold.co/400x500/f5f0e8/c8a96e?text=No+Image"}
          alt={product.name}
          className="s-card__img"
          loading="lazy"
        />
      </div>
      <div className="s-card__info">
        <p className="s-card__cat">{product.category?.name}</p>
        <h3 className="s-card__name">{product.name}</h3>
        <p className="s-card__price">{Number(product.base_price).toLocaleString("vi-VN")}₫</p>
      </div>
    </div>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const { list: products, loading, fetchAll, setFilters } = useProduct();

  useEffect(() => {
    if (q) {
      fetchAll({ search: q });
      setFilters({ search: q });
    }
  }, [q]);

  const handleSearch = (val) => {
    setSearchParams({ q: val });
  };

  return (
    <div className="search-page">
      <Header onSearch={handleSearch} />

      <main className="search-page__main">
        <div className="search-page__inner">

          <div className="search-page__head">
            <h1 className="search-page__title">
              {q
                ? <>Kết quả cho <em>"{q}"</em></>
                : "Tìm kiếm sản phẩm"}
            </h1>
            {!loading && (
              <p className="search-page__count">
                {products.length === 0
                  ? "Không tìm thấy sản phẩm nào"
                  : `${products.length} sản phẩm`}
              </p>
            )}
          </div>

          {loading ? (
            <div className="search-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="search-skeleton">
                  <div className="search-skeleton__img" />
                  <div className="search-skeleton__line" />
                  <div className="search-skeleton__line search-skeleton__line--sm" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="search-empty">
              <p className="search-empty__icon">🔍</p>
              <p className="search-empty__text">
                Không tìm thấy sản phẩm nào cho <strong>"{q}"</strong>
              </p>
              <p className="search-empty__hint">Thử tìm với từ khóa khác hoặc kiểm tra chính tả.</p>
              <button className="search-btn" onClick={() => navigate("/")}>
                Về trang chủ
              </button>
            </div>
          ) : (
            <div className="search-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
