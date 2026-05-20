import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../../store/hooks";
import Header from "../../components/header/header.component";
import Footer from "../../components/footer/footer.component";
import "./categories.styles.scss";

const CategoriesPage = () => {
  const navigate = useNavigate();

  const {
    categories,
    fetchCategories,
  } = useProduct();

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleClick = (slug) => {
    navigate(`/shop?category=${slug}`);
  };

  return (
    <div className="categories-page">
      <Header />

      {/* HERO */}
      <section className="categories-hero">
        <h1>SHOP BY CATEGORIES</h1>
        <p>Khám phá phong cách bạn yêu thích</p>
      </section>

      {/* GRID */}
      <section className="categories-grid">
        {/* ALL */}
        <div className="category-card" onClick={() => navigate("/shop")}>
          <img
            src="https://img.staticdj.com/d27e5d131b351345095721df91369b49_1024x.jpg"
            alt="all"
          />
          <div className="overlay">
            <h2>ALL PRODUCTS</h2>
          </div>
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="category-card"
            onClick={() => handleClick(cat.slug)}
          >
            <img
              src={cat.image || "https://placehold.co/600x600"}
              alt={cat.name}
            />
            <div className="overlay">
              <h2>{cat.name}</h2>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
};

export default CategoriesPage;