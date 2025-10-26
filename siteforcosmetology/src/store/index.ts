import { configureStore, PayloadAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Types
export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  telegramConnected: boolean;
  telegramId?: string;
  telegramUsername?: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  duration: number;
  comment?: string;
  telegramNotification: boolean;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

// Асинхронные actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { phoneOrEmail: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
);

export const loginAdmin = createAsyncThunk(
  'auth/admin-login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/admin-login', credentials);
    return response.data;
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    name: string;
    surname: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
);

export const getServices = createAsyncThunk('services/getAll', async () => {
  const response = await api.get('/services');
  return response.data;
});

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData: {
    serviceId: string;
    date: string;
    time: string;
    comment?: string;
    telegramNotification: boolean;
  }) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
);

export const getUserBookings = createAsyncThunk('bookings/getUserBookings', async () => {
  const response = await api.get('/bookings/my');
  return response.data;
});

export const linkTelegram = createAsyncThunk('telegram/link', async () => {
  const response = await api.post('/telegram/link');
  return response.data;
});

export const checkTelegramLink = createAsyncThunk('telegram/checkLink', async (code: string) => {
  const response = await api.get(`/telegram/check-link/${code}`);
  return response.data;
});

// Theme Slice
const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: getInitialTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
      if (state.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as User | null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null as string | null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    updateTelegram: (
      state,
      action: PayloadAction<{ telegramId?: string; telegramUsername?: string }>,
    ) => {
      if (state.user) {
        state.user.telegramConnected = true;
        state.user.telegramId = action.payload.telegramId;
        state.user.telegramUsername = action.payload.telegramUsername;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка входа';
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка входа администратора';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка регистрации';
      });
  },
});

// Services Slice
const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [] as Service[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.services = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(getServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки услуг';
      });
  },
});

// Booking Slice
interface CurrentBooking {
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  duration: number;
  comment: string;
  telegramNotification: boolean;
  status?: string;
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    step: 1,
    currentBooking: {
      serviceId: '',
      serviceName: '',
      date: '',
      time: '',
      price: 0,
      duration: 0,
      comment: '',
      telegramNotification: false,
    } as CurrentBooking,
    bookings: [] as Booking[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    setBookingData: (state, action: PayloadAction<Partial<CurrentBooking>>) => {
      state.currentBooking = { ...state.currentBooking, ...action.payload };
    },
    clearBooking: (state) => {
      state.step = 1;
      state.currentBooking = {
        serviceId: '',
        serviceName: '',
        date: '',
        time: '',
        price: 0,
        duration: 0,
        comment: '',
        telegramNotification: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка создания записи';
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      });
  },
});

// Store
export const store = configureStore({
  reducer: {
    theme: themeSlice.reducer,
    auth: authSlice.reducer,
    services: servicesSlice.reducer,
    booking: bookingSlice.reducer,
  },
});

export const { toggleTheme } = themeSlice.actions;
export const { logout, updateTelegram, clearError } = authSlice.actions;
export const { setServices } = servicesSlice.actions;
export const { setStep, setBookingData, clearBooking } = bookingSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Инициализация темы
const initialTheme = getInitialTheme();
if (initialTheme) {
  document.documentElement.classList.add('dark');
}
