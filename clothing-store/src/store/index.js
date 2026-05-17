import { configureStore } from "@reduxjs/toolkit";
import authReducer    from "./slices/authSlice";
import cartReducer    from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import orderReducer   from "./slices/orderSlice";
import paymentReducer from "./slices/paymentSlice";

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    cart:    cartReducer,
    product: productReducer,
    order:   orderReducer,
    payment: paymentReducer,
  },
});

export default store;