import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../store/hooks";
import { useCart } from "../../store/hooks";
import "./header.styles.scss";

const Header = ({ onSearch }) => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { totalItems } = useCart();

  const [searchValue, setSearchValue]   = useState("");
  const [showProfile, setShowProfile]   = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchValue.trim());
  };

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate("/login");
  };

  // return (
  //   <header className="header">
  //     <div className="header__inner">

  //       {/* Logo */}
  //       <Link to="/" className="header__logo">
  //         <img
  //           src="https://cdn.corenexis.com/files/c/9593613720.png"
  //           alt="Cloth Logo"
  //           className="header__logo-img"
  //         />
  //       </Link>

  //       {/* Search */}
  //       <form
  //         className={`header__search ${searchFocused ? "header__search--focused" : ""}`}
  //         onSubmit={handleSearch}
  //       >
  //         <svg className="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  //           <circle cx="11" cy="11" r="8" />
  //           <path d="m21 21-4.35-4.35" />
  //         </svg>
  //         <input
  //           type="text"
  //           placeholder="Tìm kiếm sản phẩm..."
  //           value={searchValue}
  //           onChange={(e) => setSearchValue(e.target.value)}
  //           onFocus={() => setSearchFocused(true)}
  //           onBlur={() => setSearchFocused(false)}
  //           className="header__search-input"
  //         />
  //         {searchValue && (
  //           <button
  //             type="button"
  //             className="header__search-clear"
  //             onClick={() => { setSearchValue(""); if (onSearch) onSearch(""); }}
  //           >✕</button>
  //         )}
  //       </form>

  //       {/* Actions */}
  //       <div className="header__actions">

  //         {/* Cart */}
  //         <button className="header__action-btn" onClick={() => navigate("/cart")}>
  //           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
  //             <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
  //             <line x1="3" y1="6" x2="21" y2="6" />
  //             <path d="M16 10a4 4 0 0 1-8 0" />
  //           </svg>
  //           {totalItems > 0 && (
  //             <span className="header__badge">{totalItems}</span>
  //           )}
  //         </button>

  //         {/* Profile */}
  //         <div className="header__profile" ref={profileRef}>
  //           <button
  //             className="header__profile-btn"
  //             onClick={() => setShowProfile((v) => !v)}
  //           >
  //             {user?.avatar ? (
  //               <img src={user.avatar} alt={user.username} className="header__avatar" />
  //             ) : (
  //               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
  //                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  //                 <circle cx="12" cy="7" r="4" />
  //               </svg>
  //             )}
  //             {user && <span className="header__username">{user.first_name || user.username}</span>}
  //           </button>

  //           {showProfile && (
  //             <div className="header__dropdown">
  //               {isLoggedIn ? (
  //                 <>
  //                   <div className="header__dropdown-user">
  //                     <p className="header__dropdown-name">{user?.username}</p>
  //                     <p className="header__dropdown-email">{user?.email}</p>
  //                   </div>
  //                   <div className="header__dropdown-divider" />
  //                   <button className="header__dropdown-item" onClick={() => { navigate("/profile"); setShowProfile(false); }}>
  //                     Thông tin cá nhân
  //                   </button>
  //                   <button className="header__dropdown-item" onClick={() => { navigate("/orders"); setShowProfile(false); }}>
  //                     Đơn hàng của tôi
  //                   </button>
  //                   <div className="header__dropdown-divider" />
  //                   <button className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
  //                     Đăng xuất
  //                   </button>
  //                 </>
  //               ) : (
  //                 <>
  //                   <button className="header__dropdown-item" onClick={() => { navigate("/login"); setShowProfile(false); }}>
  //                     Đăng nhập
  //                   </button>
  //                   <button className="header__dropdown-item" onClick={() => { navigate("/register"); setShowProfile(false); }}>
  //                     Đăng ký
  //                   </button>
  //                 </>
  //               )}
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </header>
  // );
  return (
  <>
    {/* TOP BAR */}
    <div className="topbar">
      <div className="topbar__marquee">
        🔥 Free Shipping đơn từ 499K 🚚 —
        Mua 2 giảm 10% —
        New Collection Available Now ✨
      </div>
    </div>

    <header className="header">
      <div className="header__inner">

        {/* LEFT MENU */}
        <nav className="header__nav">
          <Link to="/">HOME</Link>
          <Link to="/products">SHOP</Link>
          <Link to="/categories">CATEGORIES</Link>
          <Link to="/orders">TRACK ORDER</Link>
        </nav>

        {/* CENTER LOGO */}
        <Link to="/" className="header__logo">
          <img
            src="https://cdn.corenexis.com/files/c/9593613720.png"
            alt="Sporttp Logo"
            className="header__logo-img"
          />
        </Link>

        {/* RIGHT */}
        <div className="header__right">

          {/* SEARCH */}
          <form
            className={`header__search ${
              searchFocused ? "header__search--focused" : ""
            }`}
            onSubmit={handleSearch}
          >
            <svg
              className="header__search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="header__search-input"
            />
          </form>

          {/* CART */}
          <button
            className="header__action-btn"
            onClick={() => navigate("/cart")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>

            {totalItems > 0 && (
              <span className="header__badge">
                {totalItems}
              </span>
            )}
          </button>

          {/* PROFILE */}
          <div className="header__profile" ref={profileRef}>
            <button
              className="header__profile-btn"
              onClick={() => setShowProfile((v) => !v)}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="header__avatar"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>

            {showProfile && (
              <div className="header__dropdown">
                {isLoggedIn ? (
                  <>
                    <div className="header__dropdown-user">
                      <p className="header__dropdown-name">
                        {user?.username}
                      </p>

                      <p className="header__dropdown-email">
                        {user?.email}
                      </p>
                    </div>

                    <div className="header__dropdown-divider" />

                    <button
                      className="header__dropdown-item"
                      onClick={() => {
                        navigate("/profile");
                        setShowProfile(false);
                      }}
                    >
                      Thông tin cá nhân
                    </button>

                    <button
                      className="header__dropdown-item"
                      onClick={() => {
                        navigate("/orders");
                        setShowProfile(false);
                      }}
                    >
                      Đơn hàng
                    </button>

                    <div className="header__dropdown-divider" />

                    <button
                      className="header__dropdown-item header__dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="header__dropdown-item"
                      onClick={() => {
                        navigate("/login");
                        setShowProfile(false);
                      }}
                    >
                      Đăng nhập
                    </button>

                    <button
                      className="header__dropdown-item"
                      onClick={() => {
                        navigate("/register");
                        setShowProfile(false);
                      }}
                    >
                      Đăng ký
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  </>
);
};

export default Header;
