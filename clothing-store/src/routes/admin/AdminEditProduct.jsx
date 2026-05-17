import { useState } from "react";
import api from "../../utils/api/api";
import "./admin_create_product_styles.scss";

const AdminEditProduct = ({ product, onClose, onUpdated }) => {

  const [form, setForm] = useState({
    name: product.name || "",
    base_price: product.base_price || "",
    short_description: product.short_description || "",
    description: product.description || "",
    meta_title: product.meta_title || "",
    meta_description: product.meta_description || "",
    is_active: product.is_active,
    is_featured: product.is_featured,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => {
    setForm((f) => ({
      ...f,
      [k]: v,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      await api.patch(
        `/admin-panel/products/${product.id}/`,
        {
          ...form,
          base_price: parseFloat(form.base_price),
        }
      );

      onUpdated();

    } catch (err) {

      console.log(err);

      setError("Cập nhật sản phẩm thất bại");

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="create-overlay" onClick={onClose} />

      <div className="create-modal">

        <div className="create-modal__head">
          <div>
            <h2 className="create-modal__title">
              Chỉnh sửa sản phẩm
            </h2>

            <p className="create-modal__sub">
              #{product.id}
            </p>
          </div>

          <button className="adm-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="create-modal__body" onSubmit={handleSubmit}>

          <div className="create-grid-2">

            <div className="create-field create-field--span2">
              <label className="create-field__label">
                Tên sản phẩm
              </label>

              <input
                className="create-field__input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="create-field">
              <label className="create-field__label">
                Giá
              </label>

              <input
                type="number"
                className="create-field__input"
                value={form.base_price}
                onChange={(e) => set("base_price", e.target.value)}
              />
            </div>

            <div className="create-field">
              <label className="create-field__label">
                Meta Title
              </label>

              <input
                className="create-field__input"
                value={form.meta_title}
                onChange={(e) => set("meta_title", e.target.value)}
              />
            </div>

            <div className="create-field create-field--span2">
              <label className="create-field__label">
                Mô tả ngắn
              </label>

              <textarea
                rows={3}
                className="create-field__input create-field__textarea"
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
              />
            </div>

            <div className="create-field create-field--span2">
              <label className="create-field__label">
                Mô tả chi tiết
              </label>

              <textarea
                rows={5}
                className="create-field__input create-field__textarea"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div className="create-field">
              <label className="create-field__label">
                Meta Description
              </label>

              <textarea
                rows={3}
                className="create-field__input create-field__textarea"
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

          {error && (
            <div className="create-error">
              {error}
            </div>
          )}

          <div className="create-modal__foot">

            <button
              type="button"
              className="create-btn create-btn--ghost"
              onClick={onClose}
            >
              Huỷ
            </button>

            <button
              type="submit"
              className="create-btn create-btn--primary"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>

          </div>

        </form>

      </div>
    </>
  );
};

export default AdminEditProduct;