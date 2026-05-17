import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentApi } from "../../utils/api/api";

// ==========================================
// THUNKS
// ==========================================

export const fetchPayments = createAsyncThunk(
  "payment/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await paymentApi.getAll();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const createPayment = createAsyncThunk(
  "payment/create",
  async ({ orderId, method }, { rejectWithValue }) => {
    try {
      const { data } = await paymentApi.createPayment(orderId, method);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Thunk đặc biệt: tạo payment SePay + tự động polling
export const createSePayAndPoll = createAsyncThunk(
  "payment/createSePayAndPoll",
  async ({ orderId }, { dispatch, rejectWithValue }) => {
    try {
      // 1. Tạo payment
      const { data: payment } = await paymentApi.createPayment(orderId, "sepay");
      dispatch(setCurrentPayment(payment));

      // 2. Bắt đầu polling
      dispatch(startPolling());

      const stopFn = paymentApi.pollStatus(
        orderId,
        (paid) => {
          dispatch(setCurrentPayment(paid));
          dispatch(stopPolling());
        },
        10 * 60 * 1000 // timeout 10 phút
      );

      // Lưu stopFn vào window để có thể gọi khi unmount
      window.__stopSePayPolling = stopFn;

      return payment;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    list:           [],
    currentPayment: null,  // payment đang chờ thanh toán
    isPolling:      false,
    loading:        false,
    error:          null,
  },
  reducers: {
    setCurrentPayment(state, action) {
      state.currentPayment = action.payload;
    },
    clearCurrentPayment(state) {
      state.currentPayment = null;
      state.isPolling      = false;
      // Dừng polling nếu còn đang chạy
      if (window.__stopSePayPolling) {
        window.__stopSePayPolling();
        window.__stopSePayPolling = null;
      }
    },
    startPolling(state) {
      state.isPolling = true;
    },
    stopPolling(state) {
      state.isPolling = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.list = action.payload.results || action.payload;
      })

      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading        = false;
        state.currentPayment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      .addCase(createSePayAndPoll.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(createSePayAndPoll.fulfilled, (state, action) => {
        state.loading        = false;
        state.currentPayment = action.payload;
      })
      .addCase(createSePayAndPoll.rejected, (state, action) => {
        state.loading   = false;
        state.isPolling = false;
        state.error     = action.payload;
      });
  },
});

export const {
  setCurrentPayment,
  clearCurrentPayment,
  startPolling,
  stopPolling,
  clearError,
} = paymentSlice.actions;

// Selectors
export const selectPayments       = (state) => state.payment.list;
export const selectCurrentPayment = (state) => state.payment.currentPayment;
export const selectIsPolling      = (state) => state.payment.isPolling;
export const selectPaymentLoading = (state) => state.payment.loading;
export const selectPaymentError   = (state) => state.payment.error;
export const selectIsPaid         = (state) =>
  state.payment.currentPayment?.status === "paid";

export default paymentSlice.reducer;