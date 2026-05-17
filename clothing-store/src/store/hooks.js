import { useDispatch, useSelector } from "react-redux";

// Auth
import {
  login, register, logout, fetchMe, updateMe,
  selectUser, selectIsLoggedIn, selectAuthLoading, selectAuthError,
} from "../store/slices/authSlice";

// Cart
import {
  fetchCart, addToCart, updateCartItem, removeCartItem, clearCart,
  selectCartItems, selectCartTotalPrice, selectCartTotalItems, selectCartLoading,
} from "../store/slices/cartSlice";

// Product
import {
  fetchProducts, fetchProductBySlug, fetchFeaturedProducts,
  fetchCategories, fetchVariantsByProduct, fetchSizesAndColors,
  setFilters, clearFilters, clearDetail,
  selectProducts, selectFeatured, selectCategories,
  selectProductDetail, selectVariants, selectSizes, selectColors,
  selectFilters, selectProductLoading,
} from "../store/slices/productSlice";

// Order
import {
  fetchOrders, fetchOrderById, checkout, cancelOrder,
  fetchAddresses, createAddress,
  selectOrders, selectOrderDetail, selectLatestOrder,
  selectAddresses, selectDefaultAddress,
  selectOrderLoading, selectCheckoutLoading, selectOrderError,
} from "../store/slices/orderSlice";

// Payment
import {
  createPayment, createSePayAndPoll, clearCurrentPayment,
  selectCurrentPayment, selectIsPolling, selectIsPaid,
  selectPaymentLoading, selectPaymentError,
} from "../store/slices/paymentSlice";

// ==========================================
// useAuth
// ==========================================
export const useAuth = () => {
  const dispatch = useDispatch();
  return {
    user:       useSelector(selectUser),
    isLoggedIn: useSelector(selectIsLoggedIn),
    loading:    useSelector(selectAuthLoading),
    error:      useSelector(selectAuthError),

    login:    (username, password) => dispatch(login({ username, password })),
    register: (data)               => dispatch(register(data)),
    logout:   ()                   => dispatch(logout()),
    fetchMe:  ()                   => dispatch(fetchMe()),
    updateMe: (data)               => dispatch(updateMe(data)),
  };
};

// ==========================================
// useCart
// ==========================================
export const useCart = () => {
  const dispatch = useDispatch();
  return {
    items:      useSelector(selectCartItems),
    totalPrice: useSelector(selectCartTotalPrice),
    totalItems: useSelector(selectCartTotalItems),
    loading:    useSelector(selectCartLoading),

    fetchCart:      ()                         => dispatch(fetchCart()),
    addToCart:      (variantId, quantity = 1)  => dispatch(addToCart({ variantId, quantity })),
    updateItem:     (itemId, quantity)         => dispatch(updateCartItem({ itemId, quantity })),
    removeItem:     (itemId)                   => dispatch(removeCartItem(itemId)),
    clearCart:      ()                         => dispatch(clearCart()),
  };
};

// ==========================================
// useProduct
// ==========================================
export const useProduct = () => {
  const dispatch = useDispatch();
  return {
    list:       useSelector(selectProducts),
    featured:   useSelector(selectFeatured),
    categories: useSelector(selectCategories),
    detail:     useSelector(selectProductDetail),
    variants:   useSelector(selectVariants),
    sizes:      useSelector(selectSizes),
    colors:     useSelector(selectColors),
    filters:    useSelector(selectFilters),
    loading:    useSelector(selectProductLoading),

    fetchAll:       (params)     => dispatch(fetchProducts(params)),
    fetchBySlug:    (slug)       => dispatch(fetchProductBySlug(slug)),
    fetchFeatured:  ()           => dispatch(fetchFeaturedProducts()),
    fetchCategories: ()          => dispatch(fetchCategories()),
    fetchVariants:  (productId)  => dispatch(fetchVariantsByProduct(productId)),
    fetchSizesAndColors: ()      => dispatch(fetchSizesAndColors()),
    setFilters:     (filters)    => dispatch(setFilters(filters)),
    clearFilters:   ()           => dispatch(clearFilters()),
    clearDetail:    ()           => dispatch(clearDetail()),
  };
};

// ==========================================
// useOrder
// ==========================================
export const useOrder = () => {
  const dispatch = useDispatch();
  return {
    list:         useSelector(selectOrders),
    detail:       useSelector(selectOrderDetail),
    latestOrder:  useSelector(selectLatestOrder),
    addresses:    useSelector(selectAddresses),
    defaultAddress: useSelector(selectDefaultAddress),
    loading:      useSelector(selectOrderLoading),
    checkoutLoading: useSelector(selectCheckoutLoading),
    error:        useSelector(selectOrderError),

    fetchAll:       ()        => dispatch(fetchOrders()),
    fetchById:      (id)      => dispatch(fetchOrderById(id)),
    checkout:       (data)    => dispatch(checkout(data)),
    cancel:         (id)      => dispatch(cancelOrder(id)),
    fetchAddresses: ()        => dispatch(fetchAddresses()),
    createAddress:  (data)    => dispatch(createAddress(data)),
  };
};

// ==========================================
// usePayment
// ==========================================
export const usePayment = () => {
  const dispatch = useDispatch();
  return {
    currentPayment: useSelector(selectCurrentPayment),
    isPolling:      useSelector(selectIsPolling),
    isPaid:         useSelector(selectIsPaid),
    loading:        useSelector(selectPaymentLoading),
    error:          useSelector(selectPaymentError),

    createCOD:     (orderId) => dispatch(createPayment({ orderId, method: "cod" })),
    createSePay:   (orderId) => dispatch(createSePayAndPoll({ orderId })),
    clearPayment:  ()        => dispatch(clearCurrentPayment()),
  };
};