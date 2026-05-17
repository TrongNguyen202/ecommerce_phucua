import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/header/header.component";
import Footer  from "../../components/footer/footer.component";
import { useProduct } from "../../store/hooks";
import { useCart }    from "../../store/hooks";
import "./productDetail.styles.scss";

// ─── Gallery ──────────────────────────────────────────────────────
const Gallery = ({ thumbnail, images = [], variantImage }) => {
  const all = [variantImage, ...images.map((i) => i.image), thumbnail]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [variantImage]);

  const prev = () => setActive((a) => (a - 1 + all.length) % all.length);
  const next = () => setActive((a) => (a + 1) % all.length);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img
          src={all[active] || "https://placehold.co/600x600/f5f0e8/c8a96e?text=No+Image"}
          alt="product"
          className="gallery__img"
        />
        {all.length > 1 && (
          <>
            <button className="gallery__arrow gallery__arrow--prev" onClick={prev}>‹</button>
            <button className="gallery__arrow gallery__arrow--next" onClick={next}>›</button>
            <div className="gallery__dots">
              {all.map((_, i) => (
                <button
                  key={i}
                  className={`gallery__dot ${active === i ? "gallery__dot--active" : ""}`}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {all.length > 1 && (
        <div className="gallery__thumbs">
          {all.map((src, i) => (
            <button
              key={i}
              className={`gallery__thumb ${active === i ? "gallery__thumb--active" : ""}`}
              onClick={() => setActive(i)}
            >
              <img src={src} alt={`ảnh ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Detail ───────────────────────────────────────────────
const ProductDetail = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  const {
    detail: product, variants, loading,
    fetchBySlug, fetchVariants, clearDetail,
  } = useProduct();

  const { addToCart, loading: cartLoading } = useCart();

  const [selectedType,  setSelectedType]  = useState(null);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity,      setQuantity]      = useState(1);
  const [addStatus,     setAddStatus]     = useState(null);
  const [activeTab,     setActiveTab]     = useState("desc");

  useEffect(() => {
    fetchBySlug(slug);
    return () => clearDetail();
  }, [slug]);

  useEffect(() => {
    if (product?.id) fetchVariants(product.id);
  }, [product?.id]);

  useEffect(() => {
    setSelectedType(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
    setAddStatus(null);
  }, [slug]);

  const availableTypes = [...new Map(
    variants.filter((v) => v.is_active && v.type).map((v) => [v.type.id, v.type])
  ).values()];

  const availableSizes = [...new Map(
    variants
      .filter((v) => {
        if (!v.is_active || !v.size) return false;
        if (selectedType) return v.type?.id === selectedType.id;
        return true;
      })
      .map((v) => [v.size.id, v.size])
  ).values()];

  const availableColors = [...new Map(
    variants
      .filter((v) => {
        if (!v.is_active || !v.color) return false;
        if (selectedType && v.type?.id !== selectedType.id) return false;
        if (selectedSize && v.size?.id !== selectedSize.id) return false;
        return true;
      })
      .map((v) => [v.color.id, v.color])
  ).values()];

  const matchedVariant = variants.find((v) => {
    const typeOk  = !selectedType  || v.type?.id  === selectedType.id;
    const sizeOk  = !selectedSize  || v.size?.id  === selectedSize.id;
    const colorOk = !selectedColor || v.color?.id === selectedColor.id;
    return typeOk && sizeOk && colorOk && v.is_active;
  });

  const price   = matchedVariant?.price   ?? product?.base_price ?? 0;
  const stock   = matchedVariant?.stock   ?? null;
  const inStock = stock === null ? true : stock > 0;

  const needsType  = availableTypes.length  > 0;
  const needsSize  = availableSizes.length  > 0;
  const needsColor = availableColors.length > 0;

  const canAdd = () => {
    if (needsType  && !selectedType)  return false;
    if (needsSize  && !selectedSize)  return false;
    if (needsColor && !selectedColor) return false;
    if (!inStock) return false;
    return !!matchedVariant;
  };

  const handleAdd = async () => {
    if (!canAdd()) { setAddStatus("error"); setTimeout(() => setAddStatus(null), 2500); return; }
    await addToCart(matchedVariant.id, quantity);
    setAddStatus("success");
    setTimeout(() => setAddStatus(null), 2500);
  };

  const handleBuyNow = async () => {
    if (!canAdd()) { setAddStatus("error"); return; }
    await addToCart(matchedVariant.id, quantity);
    navigate("/cart");
  };

  const handleSelectType = (t) => { setSelectedType(t); setSelectedSize(null); setSelectedColor(null); };
  const handleSelectSize = (s) => { setSelectedSize(s); setSelectedColor(null); };

  if (loading && !product) {
    return (
      <div className="pd">
        <Header />
        <div className="pd__skeleton">
          <div className="pd__sk-img" />
          <div className="pd__sk-body">
            {[180, 280, 100, 160, 120].map((w, i) => (
              <div key={i} className="pd__sk-line" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="pd">
        <Header />
        <div className="pd__not-found">
          <p>Không tìm thấy sản phẩm.</p>
          <button className="pdbtn pdbtn--primary" onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pd">
      <Header />
      <main className="pd__main">

        <nav className="pd__crumb">
          <button onClick={() => navigate("/")}>Trang chủ</button>
          <span>/</span>
          <button onClick={() => navigate("/")}>{product?.category?.name}</button>
          <span>/</span>
          <span className="pd__crumb-cur">{product?.name}</span>
        </nav>

        <div className="pd__inner">

          <Gallery
            thumbnail={product?.thumbnail}
            images={product?.images || []}
            variantImage={matchedVariant?.image || null}
          />

          <div className="pd__info">
            <p className="pd__cat">{product?.category?.name}</p>
            <h1 className="pd__name">{product?.name}</h1>

            <div className="pd__price-row">
              <span className="pd__price">{Number(price).toLocaleString("vi-VN")}₫</span>
              {matchedVariant && stock !== null && (
                <span className={`pd__stock ${inStock ? "pd__stock--in" : "pd__stock--out"}`}>
                  {inStock ? `Còn ${stock} sản phẩm` : "Hết hàng"}
                </span>
              )}
            </div>

            {product?.short_description && (
              <p className="pd__short">{product.short_description}</p>
            )}

            {needsType && (
              <div className="pd__selector">
                <div className="pd__selector-head">
                  <span className="pd__selector-label">Loại sản phẩm</span>
                  {selectedType && <span className="pd__selector-val">{selectedType.name}</span>}
                </div>
                <div className="pd__selector-opts">
                  {availableTypes.map((t) => (
                    <button
                      key={t.id}
                      className={`pd__type-opt ${selectedType?.id === t.id ? "pd__type-opt--active" : ""}`}
                      onClick={() => handleSelectType(t)}
                    >{t.name}</button>
                  ))}
                </div>
              </div>
            )}

            {needsSize && (
              <div className="pd__selector">
                <div className="pd__selector-head">
                  <span className="pd__selector-label">Kích cỡ</span>
                  {selectedSize && <span className="pd__selector-val">{selectedSize.name}</span>}
                </div>
                <div className="pd__selector-opts">
                  {availableSizes.map((s) => {
                    const hasStock = variants.some(
                      (v) => v.size?.id === s.id && v.is_active && v.stock > 0
                        && (!selectedType || v.type?.id === selectedType.id)
                    );
                    return (
                      <button
                        key={s.id}
                        className={`pd__size-opt
                          ${selectedSize?.id === s.id ? "pd__size-opt--active" : ""}
                          ${!hasStock ? "pd__size-opt--out" : ""}
                        `}
                        onClick={() => handleSelectSize(s)}
                        disabled={!hasStock}
                      >
                        {s.name}
                        {!hasStock && <span className="pd__size-cross" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {needsColor && (
              <div className="pd__selector">
                <div className="pd__selector-head">
                  <span className="pd__selector-label">Màu sắc</span>
                  {selectedColor && <span className="pd__selector-val">{selectedColor.name}</span>}
                </div>
                <div className="pd__selector-opts pd__selector-opts--colors">
                  {availableColors.map((c) => (
                    <button
                      key={c.id}
                      className={`pd__color-opt ${selectedColor?.id === c.id ? "pd__color-opt--active" : ""}`}
                      style={{ "--clr": c.hex_code }}
                      onClick={() => setSelectedColor(c)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pd__qty">
              <span className="pd__selector-label">Số lượng</span>
              <div className="pd__qty-ctrl">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock ?? 99, q + 1))}
                  disabled={stock !== null && quantity >= stock}
                >+</button>
              </div>
            </div>

            {addStatus === "error" && (
              <div className="pd__alert pd__alert--error">
                Vui lòng chọn
                {needsType  && !selectedType  ? " loại sản phẩm" : ""}
                {needsSize  && !selectedSize  ? ", kích cỡ" : ""}
                {needsColor && !selectedColor ? ", màu sắc" : ""}
                {" "}trước khi thêm vào giỏ.
              </div>
            )}
            {addStatus === "success" && (
              <div className="pd__alert pd__alert--success">✓ Đã thêm vào giỏ hàng!</div>
            )}

            <div className="pd__cta">
              <button className="pdbtn pdbtn--outline" onClick={handleAdd} disabled={cartLoading}>
                {cartLoading ? "Đang thêm..." : "+ Thêm vào giỏ"}
              </button>
              <button className="pdbtn pdbtn--primary" onClick={handleBuyNow} disabled={cartLoading}>
                Mua ngay
              </button>
            </div>

            <div className="pd__policies">
              {[
                ["🚚", "Miễn phí ship đơn từ 500.000₫"],
                ["↩️", "Đổi trả trong 30 ngày"],
                ["🔒", "Thanh toán an toàn qua SePay"],
              ].map(([icon, text]) => (
                <div key={text} className="pd__policy">
                  <span>{icon}</span><p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pd__tabs">
          <div className="pd__tabs-nav">
            {[["desc","Mô tả sản phẩm"],["variants","Biến thể & Tồn kho"]].map(([k, label]) => (
              <button
                key={k}
                className={`pd__tab ${activeTab === k ? "pd__tab--active" : ""}`}
                onClick={() => setActiveTab(k)}
              >{label}</button>
            ))}
          </div>

          <div className="pd__tab-body">
            {activeTab === "desc" && (
              <p className="pd__desc">{product?.description || "Chưa có mô tả."}</p>
            )}
            {activeTab === "variants" && (
              <div className="pd__vtable-wrap">
                {variants.length === 0 ? (
                  <p className="pd__desc">Không có biến thể.</p>
                ) : (
                  <table className="pd__vtable">
                    <thead>
                      <tr><th>SKU</th><th>Loại</th><th>Size</th><th>Màu</th><th>Giá</th><th>Tồn kho</th></tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => (
                        <tr key={v.id} className={v.stock <= 0 ? "pd__vtable-out" : ""}>
                          <td className="pd__vtable-mono">{v.sku}</td>
                          <td>{v.type?.name || "—"}</td>
                          <td>{v.size?.name || "—"}</td>
                          <td>
                            {v.color
                              ? <span className="pd__color-cell">
                                  <span className="pd__color-dot" style={{ background: v.color.hex_code }} />
                                  {v.color.name}
                                </span>
                              : "—"}
                          </td>
                          <td>{Number(v.price).toLocaleString("vi-VN")}₫</td>
                          <td>
                            <span className={`pd__sbadge ${v.stock > 0 ? "pd__sbadge--in" : "pd__sbadge--out"}`}>
                              {v.stock > 0 ? v.stock : "Hết"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
