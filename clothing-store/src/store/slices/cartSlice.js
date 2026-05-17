import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi } from "../../utils/api/api";

// ==========================================
// THUNKS
// ==========================================

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await cartApi.getCart();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ variantId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await cartApi.addItem(variantId, quantity);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await cartApi.updateItem(itemId, quantity);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await cartApi.removeItem(itemId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await cartApi.clearCart();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items:       [],
    totalPrice:  0,
    totalItems:  0,
    loading:     false,
    error:       null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Helper để sync state từ response cart
    const syncCart = (state, action) => {
      state.loading    = false;
      state.items      = action.payload.items      || [];
      state.totalPrice = action.payload.total_price || 0;
      state.totalItems = action.payload.total_items || 0;
    };

    const setPending = (state) => {
      state.loading = true;
      state.error   = null;
    };

    const setRejected = (state, action) => {
      state.loading = false;
      state.error   = action.payload;
    };

    builder
      .addCase(fetchCart.pending,      setPending)
      .addCase(fetchCart.fulfilled,    syncCart)
      .addCase(fetchCart.rejected,     setRejected)

      .addCase(addToCart.pending,      setPending)
      .addCase(addToCart.fulfilled,    syncCart)
      .addCase(addToCart.rejected,     setRejected)

      .addCase(updateCartItem.pending,   setPending)
      .addCase(updateCartItem.fulfilled, syncCart)
      .addCase(updateCartItem.rejected,  setRejected)

      .addCase(removeCartItem.pending,   setPending)
      .addCase(removeCartItem.fulfilled, syncCart)
      .addCase(removeCartItem.rejected,  setRejected)

      .addCase(clearCart.pending,      setPending)
      .addCase(clearCart.fulfilled,    syncCart)
      .addCase(clearCart.rejected,     setRejected);
  },
});

export const { clearError } = cartSlice.actions;

// Selectors
export const selectCartItems      = (state) => state.cart.items;
export const selectCartTotalPrice = (state) => state.cart.totalPrice;
export const selectCartTotalItems = (state) => state.cart.totalItems;
export const selectCartLoading    = (state) => state.cart.loading;
export const selectCartError      = (state) => state.cart.error;

export default cartSlice.reducer;