/**
 * AdminCreateProduct.jsx
 * 
 * HƯỚNG DẪN TÍCH HỢP:
 * 1. Copy file này vào src/routes/admin/AdminCreateProduct.jsx
 * 2. Import vào admin.component.jsx:
 *    import AdminCreateProduct from './AdminCreateProduct';
 * 3. Thêm state trong Products component:
 *    const [showCreate, setShowCreate] = useState(false);
 * 4. Thêm nút và modal vào JSX của Products:
 *    <button className="adm-btn-primary" onClick={() => setShowCreate(true)}>+ Thêm sản phẩm</button>
 *    {showCreate && <AdminCreateProduct onClose={() => setShowCreate(false)} onCreated={load} />}
 */

import { useState, useRef, useCallback } from "react";
import api from "../../utils/api/api";
import "./admin_create_product_styles.scss";
import { useEffect } from "react";
// ─── Upload ảnh qua backend proxy → Imagur ──────────────────────
const uploadToImagur = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/admin-panel/upload-image/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
};

// ─── Image Upload Zone ────────────────────────────────────────────
const ImageUploadZone = ({ label, preview, onFile, loading, multiple = false, previews = [] }) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = multiple ? Array.from(e.dataTransfer.files) : [e.dataTransfer.files[0]];
    files.forEach((f) => f && onFile(f));
  };

  const handleChange = (e) => {
    const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];
    files.forEach((f) => f && onFile(f));
  };

  return (
    <div
      className={`img-zone ${dragging ? "img-zone--drag" : ""} ${loading ? "img-zone--loading" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {loading ? (
        <div className="img-zone__loading">
          <div className="adm-spinner" />
          <span>Đang upload...</span>
        </div>
      ) : preview ? (
        <div className="img-zone__preview">
          <img src={preview} alt="preview" />
          <div className="img-zone__overlay">
            <span>Đổi ảnh</span>
          </div>
        </div>
      ) : previews.length > 0 ? (
        <div className="img-zone__multi">
          {previews.map((url, i) => (
            <img key={i} src={url} alt={`gallery ${i}`} className="img-zone__multi-img" />
          ))}
          <div className="img-zone__add-more">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Thêm ảnh</span>
          </div>
        </div>
      ) : (
        <div className="img-zone__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="img-zone__label">{label}</p>
          <p className="img-zone__hint">Kéo thả hoặc click để chọn</p>
        </div>
      )}
    </div>
  );
};

// ─── Variant Row ──────────────────────────────────────────────────
const VariantRow = ({ variant, index, onChange, onRemove, onImageUpload,sizes,colors,types }) => {
  const [imgLoading, setImgLoading] = useState(false);

  const handleImageFile = async (file) => {
    setImgLoading(true);
    try {
      const url = await uploadToImagur(file);
      onChange(index, "image", url);
    } catch {
      alert("Upload ảnh variant thất bại");
    } finally {
      setImgLoading(false);
    }
  };

  const inputRef = useRef();

  return (
    <div className="variant-row">
      {/* Ảnh variant */}
      <div
        className={`variant-row__img ${imgLoading ? "variant-row__img--loading" : ""}`}
        onClick={() => !imgLoading && inputRef.current?.click()}
        title="Upload ảnh variant"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => e.target.files[0] && handleImageFile(e.target.files[0])}
        />
        {imgLoading ? (
          <div className="adm-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
        ) : variant.image ? (
          <img src={variant.image} alt="variant" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <polyline points="21 15 16 10 5 21"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
          </svg>
        )}
      </div>

      <input
        className="variant-row__input"
        placeholder="SKU *"
        value={variant.sku}
        onChange={(e) => onChange(index, "sku", e.target.value)}
        required
      />
      <select
  className="variant-row__input"
  value={variant.size_id}
  onChange={(e) => onChange(index, "size_id", e.target.value)}
>
  <option value="">Chọn size</option>

  {sizes.map((size) => (
    <option key={size.id} value={size.id}>
      {size.name}
    </option>
  ))}
</select>
      <select
  className="variant-row__input"
  value={variant.color_id}
  onChange={(e) => onChange(index, "color_id", e.target.value)}
>
  <option value="">Chọn màu</option>

  {colors.map((color) => (
    <option key={color.id} value={color.id}>
      {color.name}
    </option>
  ))}
</select>
     <select
  className="variant-row__input"
  value={variant.type_id}
  onChange={(e) => onChange(index, "type_id", e.target.value)}
>
  <option value="">Chọn loại</option>

  {types.map((type) => (
    <option key={type.id} value={type.id}>
      {type.name}
    </option>
  ))}
</select>
      <input
        className="variant-row__input"
        placeholder="Giá override"
        type="number"
        value={variant.price_override}
        onChange={(e) => onChange(index, "price_override", e.target.value)}
      />
      <input
        className="variant-row__input"
        placeholder="Tồn kho *"
        type="number"
        min="0"
        value={variant.stock}
        onChange={(e) => onChange(index, "stock", e.target.value)}
        required
      />
      <button
        type="button"
        className="variant-row__remove"
        onClick={() => onRemove(index)}
        title="Xoá variant"
      >✕</button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const AdminCreateProduct = ({ onClose, onCreated,  editData = null, }) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Images, 3: Variants
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
const [types, setTypes] = useState([]);
const isEdit = !!editData;
  // Form fields
  const [form, setForm] = useState({
    name: "",
    category: "",
    base_price: "",
    short_description: "",
    description: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
    is_featured: false,
  });

  // Images
  const [thumbnail, setThumbnail]   = useState("");
  const [thumbLoading, setThumbLoading] = useState(false);
  const [gallery, setGallery]       = useState([]); // [{url, loading}]
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Variants
  const [variants, setVariants] = useState([
    { sku: "", size_id: "", color_id: "", type_id: "", price_override: "", stock: "0", image: "" },
  ]);

  // Categories
  const [categories, setCategories] = useState([]);
  const [catLoaded, setCatLoaded]   = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);


  const loadVariantData = async () => {
  try {
    const [sizesRes, colorsRes, typesRes] = await Promise.all([
      api.get("/sizes/"),
      api.get("/colors/"),
      api.get("/types/"),
    ]);

    setSizes(sizesRes.data.results || sizesRes.data);
    setColors(colorsRes.data.results || colorsRes.data);
    setTypes(typesRes.data.results || typesRes.data);

  } catch (err) {
    console.error(err);
  }
};
  // Load categories khi mở form
  const loadCategories = useCallback(async () => {
    if (catLoaded) return;
    try {
      const { data } = await api.get("/categories/");
      setCategories(data.results || data);
      setCatLoaded(true);
    } catch { /* ignore */ }
  }, [catLoaded]);

  // Thumbnail upload
  const handleThumbnail = async (file) => {
    setThumbLoading(true);
    setError(null);
    try {
      const url = await uploadToImagur(file);
      setThumbnail(url);
    } catch {
      setError("Upload thumbnail thất bại.");
    } finally {
      setThumbLoading(false);
    }
  };

  // Gallery upload
  const handleGalleryFile = async (file) => {
    setGalleryLoading(true);
    setError(null);
    try {
      const url = await uploadToImagur(file);
      setGallery((prev) => [...prev, url]);
    } catch {
      setError("Upload ảnh gallery thất bại.");
    } finally {
      setGalleryLoading(false);
    }
  };

  const removeGalleryImg = (idx) => setGallery((prev) => prev.filter((_, i) => i !== idx));

  // Variant handlers
  const addVariant = () => setVariants((prev) => [
    ...prev,
    { sku: "", size_id: "", color_id: "", type_id: "", price_override: "", stock: "0", image: "" },
  ]);

  const changeVariant = (index, key, value) => {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [key]: value } : v));
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };
useEffect(() => {
  if (!editData) return;

  loadCategories();
  loadVariantData();

  setForm({
    name: editData.name || "",
    category: editData.category?.id || "",
    base_price: editData.base_price || "",
    short_description: editData.short_description || "",
    description: editData.description || "",
    meta_title: editData.meta_title || "",
    meta_description: editData.meta_description || "",
    is_active: editData.is_active ?? true,
    is_featured: editData.is_featured ?? false,
  });

  setThumbnail(editData.thumbnail || "");

  setGallery(
    editData.images?.map((img) => img.image) || []
  );

  setVariants(
    editData.variants?.length
      ? editData.variants.map((v) => ({
          id: v.id,
          sku: v.sku || "",
          size_id: v.size?.id || "",
          color_id: v.color?.id || "",
          type_id: v.type?.id || "",
          price_override: v.price_override || "",
          stock: v.stock || 0,
          image: v.image || "",
          is_active: v.is_active ?? true,
        }))
      : [
          {
            sku: "",
            size_id: "",
            color_id: "",
            type_id: "",
            price_override: "",
            stock: "0",
            image: "",
          },
        ]
  );

}, [editData]);
  // Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.category || !form.base_price) {
//       setError("Vui lòng điền đầy đủ: Tên, Danh mục, Giá cơ bản.");
//       return;
//     }
//     if (!thumbnail) {
//       setError("Vui lòng upload ảnh thumbnail.");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     try {
//       // 1. Tạo product
//       const productPayload = {
//                 ...form,
//                 thumbnail,
//                 gallery_images: gallery,
//                 base_price: parseFloat(form.base_price),
//                 };
//       const { data: product } = await api.post("/admin-panel/products/", productPayload);

//       // 2. Upload gallery images (tạo ProductImage objects)
//     //   await Promise.all(
//     //     gallery.map((url, order) =>
//     //       api.post(`/products/${product.id}/images/`, { image: url, order }).catch(() => null)
//     //     )
//     //   );

//       // 3. Tạo variants
//       const validVariants = variants.filter((v) => v.sku && v.stock !== "");
//       await Promise.all(
//         validVariants.map((v) =>
//           api.post("/variants/", {
//             product:        product.id,
//             sku:            v.sku,
//             size_id:        v.size_id  || null,
//             color_id:       v.color_id || null,
//             type_id:        v.type_id  || null,
//             price_override: v.price_override ? parseFloat(v.price_override) : null,
//             stock:          parseInt(v.stock, 10) || 0,
//             image:          v.image || "",
//             is_active:      true,
//           })
//         )
//       );

//       setSuccess(true);
//       setTimeout(() => {
//         onCreated?.();
//         onClose();
//       }, 1500);

//     } catch (err) {
//       const msg = err.response?.data;
//       setError(
//         typeof msg === "object"
//           ? Object.entries(msg).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
//           : "Tạo sản phẩm thất bại."
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.category || !form.base_price) {
    setError("Vui lòng điền đầy đủ.");
    return;
  }

  if (!thumbnail) {
    setError("Vui lòng upload thumbnail.");
    return;
  }

  setSubmitting(true);
  setError(null);

  try {

    const payload = {
      ...form,
      category_id: form.category,
      thumbnail,
      gallery_images: gallery,
      base_price: parseFloat(form.base_price),

      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size_id: v.size_id || null,
        color_id: v.color_id || null,
        type_id: v.type_id || null,
        price_override: v.price_override
          ? parseFloat(v.price_override)
          : null,
        stock: parseInt(v.stock, 10) || 0,
        image: v.image || "",
        is_active: true,
      })),
    };

    if (isEdit) {

      await api.put(
        `/admin-panel/products/${editData.id}/`,
        payload
      );

    } else {

      await api.post(
        "/admin-panel/products/",
        payload
      );
    }

    setSuccess(true);

    setTimeout(() => {
      onCreated?.();
      onClose();
    }, 1200);

  } catch (err) {

    const msg = err.response?.data;

    setError(
      typeof msg === "object"
        ? Object.entries(msg)
            .map(([k, v]) =>
              `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
            )
            .join(" | ")
        : "Lưu sản phẩm thất bại."
    );

  } finally {
    setSubmitting(false);
  }
};
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const STEPS = [
    { num: 1, label: "Thông tin" },
    { num: 2, label: "Hình ảnh" },
    { num: 3, label: "Biến thể" },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="create-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="create-modal">
        {/* Header */}
        <div className="create-modal__head">
          <div>
            <h2 className="create-modal__title">
                {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
            <p className="create-modal__sub">Điền thông tin để tạo sản phẩm</p>
          </div>
          <button className="adm-close" onClick={onClose} title="Đóng">✕</button>
        </div>

        {/* Step Indicator */}
        <div className="create-steps">
          {STEPS.map((s, i) => (
            <div key={s.num} className="create-steps__item-wrap">
              <button
                type="button"
                className={`create-steps__item ${step === s.num ? "create-steps__item--active" : ""} ${step > s.num ? "create-steps__item--done" : ""}`}
                onClick={() => { if (s.num === 2) loadCategories(); setStep(s.num); }}
              >
                <span className="create-steps__num">
                  {step > s.num ? "✓" : s.num}
                </span>
                <span className="create-steps__label">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className="create-steps__line" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <form className="create-modal__body" onSubmit={handleSubmit}>

          {/* ── STEP 1: Thông tin ── */}
          {step === 1 && (
            <div className="create-section">
              <div className="create-grid-2">
                <div className="create-field create-field--span2">
                  <label className="create-field__label">Tên sản phẩm *</label>
                  <input
                    className="create-field__input"
                    placeholder="Áo thun basic..."
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>

                <div className="create-field">
                  <label className="create-field__label">Danh mục *</label>
                  <select
                    className="create-field__input"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    onClick={loadCategories}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="create-field">
                  <label className="create-field__label">Giá cơ bản (₫) *</label>
                  <input
                    className="create-field__input"
                    type="number"
                    min="0"
                    placeholder="299000"
                    value={form.base_price}
                    onChange={(e) => set("base_price", e.target.value)}
                    required
                  />
                </div>

                <div className="create-field create-field--span2">
                  <label className="create-field__label">Mô tả ngắn</label>
                  <input
                    className="create-field__input"
                    placeholder="Mô tả ngắn hiển thị trên listing..."
                    value={form.short_description}
                    onChange={(e) => set("short_description", e.target.value)}
                  />
                </div>

                <div className="create-field create-field--span2">
                  <label className="create-field__label">Mô tả chi tiết</label>
                  <textarea
                    className="create-field__input create-field__textarea"
                    rows={5}
                    placeholder="Mô tả đầy đủ sản phẩm..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </div>

                <div className="create-field">
                  <label className="create-field__label">Meta Title</label>
                  <input
                    className="create-field__input"
                    placeholder="SEO title..."
                    value={form.meta_title}
                    onChange={(e) => set("meta_title", e.target.value)}
                  />
                </div>

                <div className="create-field">
                  <label className="create-field__label">Meta Description</label>
                  <input
                    className="create-field__input"
                    placeholder="SEO description..."
                    value={form.meta_description}
                    onChange={(e) => set("meta_description", e.target.value)}
                  />
                </div>

                <div className="create-field">
                  <div className="create-toggles">
                    <label className="create-toggle-row">
                      <span>Đang bán</span>
                      <button
                        type="button"
                        className={`adm-toggle ${form.is_active ? "adm-toggle--on" : ""}`}
                        onClick={() => set("is_active", !form.is_active)}
                      >
                        <span className="adm-toggle__knob" />
                      </button>
                    </label>
                    <label className="create-toggle-row">
                      <span>Nổi bật</span>
                      <button
                        type="button"
                        className={`adm-toggle ${form.is_featured ? "adm-toggle--on" : ""}`}
                        onClick={() => set("is_featured", !form.is_featured)}
                      >
                        <span className="adm-toggle__knob" />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Hình ảnh ── */}
          {step === 2 && (
            <div className="create-section">
              <div className="create-img-section">
                <div>
                  <p className="create-img-label">Ảnh Thumbnail *</p>
                  <p className="create-img-hint">Ảnh đại diện hiển thị ở listing — tỉ lệ 1:1</p>
                  <ImageUploadZone
                    label="Upload Thumbnail"
                    preview={thumbnail}
                    onFile={handleThumbnail}
                    loading={thumbLoading}
                  />
                </div>

                <div>
                  <p className="create-img-label">Ảnh Gallery</p>
                  <p className="create-img-hint">Ảnh trong trang chi tiết sản phẩm — có thể thêm nhiều</p>
                  
                  {gallery.length > 0 && (
                    <div className="gallery-previews">
                      {gallery.map((url, i) => (
                        <div key={i} className="gallery-previews__item">
                          <img src={url} alt={`gallery ${i}`} />
                          <button
                            type="button"
                            className="gallery-previews__remove"
                            onClick={() => removeGalleryImg(i)}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="gallery-add-zone">
                    <ImageUploadZone
                      label="Thêm ảnh gallery"
                      onFile={handleGalleryFile}
                      loading={galleryLoading}
                      multiple
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Biến thể ── */}
          {step === 3 && (
            <div className="create-section">
              <div className="create-variants-head">
                <div>
                  <p className="create-img-label">Biến thể sản phẩm</p>
                  <p className="create-img-hint">
                    Mỗi biến thể là 1 tổ hợp Size / Màu / Loại. SKU và Tồn kho là bắt buộc.
                  </p>
                </div>
                <button type="button" className="adm-filter-btn adm-filter-btn--active" onClick={addVariant}>
                  + Thêm biến thể
                </button>
              </div>

              {/* Header */}
              <div className="variant-header">
                <span>Ảnh</span>
                <span>SKU *</span>
                <span>Size</span>
                <span>Màu</span>
                <span>Loại</span>
                <span>Giá override</span>
                <span>Tồn kho *</span>
                <span></span>
              </div>

              <div className="variants-list">
                {variants.map((v, i) => (
                  <VariantRow
                    key={i}
                    variant={v}
                    index={i}
                    onChange={changeVariant}
                    onRemove={removeVariant}
                    sizes={sizes}
                    colors={colors}
                    types={types}
                    />
                ))}
              </div>

              <div className="create-variants-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>
  Chọn Size / Màu / Loại cho từng biến thể.
  Có thể để trống nếu sản phẩm không có thuộc tính đó.
</p>
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && <div className="create-error">{error}</div>}
          {success && (
            <div className="create-success">
              ✓ Tạo sản phẩm thành công! Đang đóng...
            </div>
          )}

          {/* Footer */}
          <div className="create-modal__foot">
            <div className="create-modal__foot-left">
              {step > 1 && (
                <button
                  type="button"
                  className="create-btn create-btn--ghost"
                  onClick={() => setStep(step - 1)}
                >
                  ← Quay lại
                </button>
              )}
            </div>
            <div className="create-modal__foot-right">
              <button type="button" className="create-btn create-btn--ghost" onClick={onClose}>
                Huỷ
              </button>
              {step < 3 ? (
                <button
  type="button"
  className="create-btn create-btn--primary"
  onClick={async () => {
    const nextStep = step + 1;

    if (nextStep === 2) {
      await loadCategories();
    }

    if (nextStep === 3) {
      await loadVariantData();
    }

    setStep(nextStep);
  }}
>
  Tiếp theo →
</button>
              ) : (
                <button
                  type="submit"
                  className="create-btn create-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><div className="create-btn__spinner" /> Đang tạo...</>
                  ) : isEdit ? "✓ Cập nhật sản phẩm" : "✓ Tạo sản phẩm"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminCreateProduct;