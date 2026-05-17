import { Link } from "react-router-dom";
import "./footer.styles.scss";

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">

      <div className="footer__brand">
        <span className="footer__logo">
          <span className="footer__logo-mark">C</span>
          <span className="footer__logo-text">LOTH</span>
        </span>
        <p className="footer__tagline">Thời trang tinh tế — Phong cách của bạn.</p>
      </div>

      <div className="footer__cols">
        <div className="footer__col">
          <h4 className="footer__col-title">Khám phá</h4>
          <Link to="/" className="footer__link">Trang chủ</Link>
          <Link to="/shop" className="footer__link">Cửa hàng</Link>
          <Link to="/shop?is_featured=true" className="footer__link">Bestsellers</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Tài khoản</h4>
          <Link to="/login"   className="footer__link">Đăng nhập</Link>
          <Link to="/register" className="footer__link">Đăng ký</Link>
          <Link to="/orders"  className="footer__link">Đơn hàng</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Hỗ trợ</h4>
          <a href="mailto:support@cloth.vn" className="footer__link">support@cloth.vn</a>
          <a href="tel:0900000000" className="footer__link">0900 000 000</a>
          <span className="footer__link footer__link--muted">8:00 – 22:00 hàng ngày</span>
        </div>
      </div>

    </div>

    <div className="footer__bottom">
      <p>© {new Date().getFullYear()} Cloth. Tất cả quyền được bảo lưu.</p>
    </div>
  </footer>
);

export default Footer;
