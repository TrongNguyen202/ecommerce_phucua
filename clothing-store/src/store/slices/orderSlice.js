import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi, accountsApi } from "../../utils/api/api";

// ==========================================
// THUNKS
// ==========================================

export const fetchOrders = createAsyncThunk(
  "order/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.getAll();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.getById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const checkout = createAsyncThunk(
  "order/checkout",
  async (checkoutData, { rejectWithValue }) => {
    // checkoutData = { address_id, note, shipping_fee }
    try {
      const { data } = await orderApi.checkout(checkoutData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.cancel(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchAddresses = createAsyncThunk(
  "order/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await accountsApi.getAddresses();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createAddress = createAsyncThunk(
  "order/createAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await accountsApi.createAddress(addressData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const orderSlice = createSlice({
  name: "order",
  initialState: {
    list:           [],
    detail:         null,
    latestOrder:    null, // order vừa checkout xong
    addresses:      [],
    checkoutLoading: false,
    loading:        false,
    error:          null,
  },
  reducers: {
    clearDetail(state) {
      state.detail = null;
    },
    clearLatestOrder(state) {
      state.latestOrder = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload.results || action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.detail  = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail  = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // checkout
      .addCase(checkout.pending, (state) => {
        state.checkoutLoading = true;
        state.error           = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.latestOrder     = action.payload;
        state.list            = [action.payload, ...state.list];
      })
      .addCase(checkout.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.error           = action.payload;
      })

      // cancelOrder
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const updated = action.payload;
        state.list    = state.list.map((o) => (o.id === updated.id ? updated : o));
        if (state.detail?.id === updated.id) state.detail = updated;
      })

      // fetchAddresses
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload.results || action.payload;
      })

      // createAddress
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addresses = [...state.addresses, action.payload];
      });
  },
});

export const { clearDetail, clearLatestOrder, clearError } = orderSlice.actions;

// Selectors
export const selectOrders          = (state) => state.order.list;
export const selectOrderDetail     = (state) => state.order.detail;
export const selectLatestOrder     = (state) => state.order.latestOrder;
export const selectAddresses       = (state) => state.order.addresses;
export const selectOrderLoading    = (state) => state.order.loading;
export const selectCheckoutLoading = (state) => state.order.checkoutLoading;
export const selectOrderError      = (state) => state.order.error;
export const selectDefaultAddress  = (state) =>
  state.order.addresses.find((a) => a.is_default && a.address_type === "shipping");

export default orderSlice.reducer;