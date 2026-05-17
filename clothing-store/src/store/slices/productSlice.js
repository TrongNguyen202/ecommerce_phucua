import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productApi, categoryApi, variantApi } from "../../utils/api/api";

// ==========================================
// THUNKS
// ==========================================

export const fetchProducts = createAsyncThunk(
  "product/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await productApi.getAll(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "product/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await productApi.getBySlug(slug);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  "product/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await productApi.getFeatured();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await categoryApi.getAll();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchVariantsByProduct = createAsyncThunk(
  "product/fetchVariants",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await variantApi.getAll({ product: productId });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const fetchSizesAndColors = createAsyncThunk(
  "product/fetchSizesAndColors",
  async (_, { rejectWithValue }) => {
    try {
      const [sizes, colors] = await Promise.all([
        variantApi.getSizes(),
        variantApi.getColors(),
      ]);
      return { sizes: sizes.data, colors: colors.data };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const productSlice = createSlice({
  name: "product",
  initialState: {
    // Danh sách
    list:       [],
    featured:   [],
    categories: [],

    // Chi tiết
    detail:   null,
    variants: [],
    sizes:    [],
    colors:   [],

    // Filter hiện tại
    filters: {
      category:    "",
      search:      "",
      is_featured: "",
    },

    // Phân trang
    count:    0,
    next:     null,
    previous: null,

    loading: false,
    error:   null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { category: "", search: "", is_featured: "" };
    },
    clearDetail(state) {
      state.detail   = null;
      state.variants = [];
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Hỗ trợ cả có phân trang (DRF pagination) và không
        if (action.payload.results) {
          state.list     = action.payload.results;
          state.count    = action.payload.count;
          state.next     = action.payload.next;
          state.previous = action.payload.previous;
        } else {
          state.list = action.payload;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // fetchProductBySlug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.detail  = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.detail  = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // fetchFeaturedProducts
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload.results || action.payload;
      })

      // fetchCategories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.results || action.payload;
      })

      // fetchVariantsByProduct
      .addCase(fetchVariantsByProduct.fulfilled, (state, action) => {
        state.variants = action.payload.results || action.payload;
      })

      // fetchSizesAndColors
      .addCase(fetchSizesAndColors.fulfilled, (state, action) => {
        state.sizes  = action.payload.sizes.results  || action.payload.sizes;
        state.colors = action.payload.colors.results || action.payload.colors;
      });
  },
});

export const { setFilters, clearFilters, clearDetail, clearError } = productSlice.actions;

// Selectors
export const selectProducts   = (state) => state.product.list;
export const selectFeatured   = (state) => state.product.featured;
export const selectCategories = (state) => state.product.categories;
export const selectProductDetail = (state) => state.product.detail;
export const selectVariants   = (state) => state.product.variants;
export const selectSizes      = (state) => state.product.sizes;
export const selectColors     = (state) => state.product.colors;
export const selectFilters    = (state) => state.product.filters;
export const selectProductLoading = (state) => state.product.loading;

export default productSlice.reducer;