import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaEnvelope } from "react-icons/fa";
import "./footer.styles.scss";

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">

      {/* BRAND */}
      <div className="footer__brand">
        <img
          src="https://i.ibb.co/JwbF31FQ/logo-web.png"
          alt="Cloth Logo"
          className="footer__logo-img"
        />

        <p className="footer__tagline">
          Áo thun Thể Thao — Phong cách của bạn.
        </p>
        
        {/* SOCIAL ICONS */}
        {/* <div className="footer__social">
          <a
            href="https://www.facebook.com/minh.phu.15683"
            target="_blank"
            rel="noreferrer"
            className="footer__social-icon"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.instagram.com/sporttn_official/"
            target="_blank"
            rel="noreferrer"
            className="footer__social-icon"
          >
            <FaInstagram />
          </a>

          <a
            href="mailto:phucua2004@gmail.com"
            className="footer__social-icon"
          >
            <FaEnvelope />
          </a>
        </div> */}
        <div className="footer__social">
  <a
    href="https://www.facebook.com/minh.phu.15683"
    target="_blank"
    rel="noreferrer"
    className="footer__social-icon footer__social-icon--fb"
  >
    <FaFacebookF />
  </a>

  <a
    href="https://www.instagram.com/phulopziu/?utm_source=ig_web_button_share_sheet"
    target="_blank"
    rel="noreferrer"
    className="footer__social-icon footer__social-icon--ig"
  >
    <FaInstagram />
  </a>
  <a
    href="mailto:phucua2004@gmail.com"
    className="footer__social-icon footer__social-icon--mail"
  >
    <FaEnvelope />
  </a>
</div>
      </div>
      {/* COLUMNS */}
      <div className="footer__cols">
        {/* COLLECTIONS */}
        <div className="footer__col">
          <h4 className="footer__col-title">Collections</h4>
          <Link to="/products?category=air-craft-shirt" className="footer__link">AIR CRAFT SHIRT</Link>
          <Link to="/products?category=tactical-shirt" className="footer__link">TACTICAL SHIRT</Link>
        </div>

        {/* ACCOUNT */}
        <div className="footer__col">
          <h4 className="footer__col-title">Account</h4>
          <Link to="/login" className="footer__link">Login</Link>
          <Link to="/register" className="footer__link">Register</Link>
          <Link to="/orders" className="footer__link">Orders</Link> 
        </div>

        {/* SUPPORT */}
        <div className="footer__col">
          <h4 className="footer__col-title">Support</h4>

          <a href="mailto:dangvanphu201104@gmail.com" className="footer__link">
            dangvanphu201104@gmail.com
          </a>

          <a href="tel:0369298428" className="footer__link">
            0369298428
          </a>

          <span className="footer__link footer__link--muted">
            8:00 – 22:00 hàng ngày
          </span>
        </div>
      </div>
    </div>

    {/* BOTTOM */}
    <div className="footer__bottom">
      <p>© {new Date().getFullYear()} IRONBORN. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;