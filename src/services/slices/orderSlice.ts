import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import {
  getOrdersApi,
  orderBurgerApi,
  getFeedsApi,
  getOrderByNumberApi
} from '@api';
import { clearConstructor } from './constructorSlice';

export interface OrderState {
  order: TOrder | null;
  feeds: TOrder[];
  total: number;
  totalToday: number;
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  feeds: [],
  total: 0,
  totalToday: 0,
  orders: [],
  isLoading: false,
  error: null
};

export const getFeeds = createAsyncThunk('orders/getFeeds', async () => {
  const response = await getFeedsApi();
  return response;
});

export const getOrders = createAsyncThunk('orders/getOrders', async () => {
  const orders = await getOrdersApi();
  return orders;
});

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredients: string[], { dispatch }) => {
    const order = await orderBurgerApi(ingredients);
    dispatch(clearConstructor());
    return order;
  }
);

export const getOrderByNumber = createAsyncThunk(
  'orders/getOrderByNumber',
  async (number: number) => {
    const response = await getOrderByNumberApi(number);
    return response;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feeds = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки ленты заказов';
      })
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Не удалось получить заказы';
      })
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.push(action.payload.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Не удалось создать заказ';
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка загрузки заказа';
      });
  },
  selectors: {
    selectOrder: (state) => state.order,
    selectOrderIsLoading: (state) => state.isLoading,
    selectFeeds: (state) => state.feeds,
    selectFeedsTotal: (state) => state.total,
    selectFeedsTotalToday: (state) => state.totalToday,
    selectOrders: (state) => state.orders
  }
});

export const orderReducer = orderSlice.reducer;
export const {
  selectOrder,
  selectOrderIsLoading,
  selectFeeds,
  selectFeedsTotal,
  selectFeedsTotalToday,
  selectOrders
} = orderSlice.selectors;
export const { clearOrder } = orderSlice.actions;
