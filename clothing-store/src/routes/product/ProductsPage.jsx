import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer from "../../components/footer/footer.component";
import { useProduct } from "../../store/hooks";
import "./products.styles.scss";

const ProductCard = ({ product, onClick }) => (
  <div className="product-card" onClick={onClick}>
    <img
      src={
        product.thumbnail ||
        "https://placehold.co/400x500?text=No+Image"
      }
      alt={product.name}
    />
    <div className="product-card__info">
      <h3>{product.name}</h3>
      <p>
        {Number(product.base_price).toLocaleString("vi-VN")}₫
      </p>
    </div>
  </div>
);

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    list: products,
    categories,
    fetchAll,
    fetchCategories,
  } = useProduct();

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || null
  );

  const [search, setSearch] = useState(
    searchParams.get("q") || ""
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = {};

    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;

    fetchAll(params);
  }, [activeCategory, search]);

  const handleCategory = (slug) => {
    setActiveCategory(slug);
    navigate(`/products?category=${slug || ""}`);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="products-page">
      <Header />

      {/* HERO */}
      <section className="products-hero">
        <h1>ALL PRODUCTS</h1>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearch}
          className="products-search"
        />
      </section>

      {/* FILTER */}
      <section className="products-filter">
        <button
          className={!activeCategory ? "active" : ""}
          onClick={() => handleCategory(null)}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={
              activeCategory === cat.slug ? "active" : ""
            }
            onClick={() => handleCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </section>

      {/* GRID */}
      <section className="products-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={() =>
              navigate(`/product/${p.slug}`)
            }
          />
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default ProductsPage;