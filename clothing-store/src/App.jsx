// import { useEffect, lazy, Suspense, useLayoutEffect } from 'react';
// import { Routes, Route, useLocation } from "react-router-dom";
// import { useDispatch } from 'react-redux';

// import { authChangedListener, createUserDocFromAuth } from './utils/firebase/firebase.utils.js';
// // import { setCurrentUser } from './store/user.reducer.js';
// import SpinnerComponent from './components/spinner/spinner.component.jsx';

// const Navigation = lazy(() => import('./routes/navigation/navigation.component'));
// const Home = lazy(() => import('./routes/home/home.component'));
// const Login = lazy(() => import('./routes/login/login.component'));
// const Shop = lazy(() => import('./routes/shop/shop.component'));
// const CartComponent = lazy(() => import('./routes/cart/cart.component'));

// const App = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const unsubscribe = authChangedListener((user) => {
//       if (user) {
//         createUserDocFromAuth(user);
//       }
//       const pickedUser = user ? (({ accessToken, email }) => ({ accessToken, email }))(user) : 'logged-out';
//       dispatch(setCurrentUser(pickedUser));
//     })
//     return unsubscribe;
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   useLayoutEffect(() => {
//     window.scrollTo({ top:0, left:0, behavior: "instant" });
//   }, [location.pathname]);

//   return (
//     <Suspense fallback={<SpinnerComponent />}>

//       <Routes>
//         <Route path='/' element={<Navigation />}>
//           <Route index element={<Home />} />
//           <Route path='shop/*' element={<Shop />} />
//           <Route path='login' element={<Login />} />
//           <Route path='cart' element={<CartComponent />} />
//         </Route>
//       </Routes>
//     </Suspense>
//   )
// }

// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/hooks";

import Home          from "./routes/home/home.component";
import Login         from "./routes/login/login.component";
import Register      from "./routes/register/register.component";
import ProductDetail from "./routes/product-detail/ProductDetail.component";
import SearchPage    from "./components/search/search.component";
import Cart          from "./routes/cart/cart.component";
import Checkout      from "./routes/checkout/checkout.component";
import Payment       from "./routes/payment/payment.component";
import Orders        from "./routes/orders/orders.component";
import Profile from "./routes/profile/Profile.component";
import AdminLayout from "./routes/admin/admin.component";
import CategoriesPage from "./routes/category/CategoriesPage";
import ProductsPage from "./routes/product/ProductsPage";
import CollectionRedirect from "./routes/collections/CollectionRedirect";
// Route yêu cầu đăng nhập
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const { fetchMe, isLoggedIn } = useAuth();

  useEffect(() => {
    // Nếu có token trong localStorage → tự động fetch user
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchMe();
    }
  }, []);

  return (
    <Routes>
      <Route path="/"                  element={<Home />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/register"          element={<Register />} />
      <Route path="/product/:slug"     element={<ProductDetail />} />
      <Route path="/search"            element={<SearchPage />} />
      <Route path="/cart"              element={<Cart />} />

      {/* Routes cần đăng nhập */}
      <Route path="/checkout"          element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="/payment/:orderId"  element={<PrivateRoute><Payment /></PrivateRoute>} />
      <Route path="/orders"            element={<PrivateRoute><Orders /></PrivateRoute>} />
      <Route path="/orders/:orderId"   element={<PrivateRoute><Orders /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/admin/*"           element={<AdminLayout />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/collections/:slug" element={<CollectionRedirect />} />
      <Route path="/products" element={<ProductsPage />} />
    </Routes>
  );
};

export default App;