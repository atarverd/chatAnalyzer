import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

type AuthState = {
  authorized: boolean;
  checked: boolean;
  phone: string;
  step: 'phone' | 'code' | 'password';
};

const initialState: AuthState = {
  authorized: false,
  checked: false,
  phone: '',
  step: 'phone',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setStep: (state, action: PayloadAction<AuthState['step']>) => {
      state.step = action.payload;
    },
    logout: (state) => {
      state.authorized = false;
      state.phone = '';
      state.step = 'phone';
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.authStatus.matchFulfilled,
      (state, action) => {
        state.authorized = action.payload.authorized;
        state.checked = true;
      },
    );
    builder.addMatcher(api.endpoints.authStatus.matchRejected, (state) => {
      state.authorized = false;
      state.checked = true;
    });
    builder.addMatcher(api.endpoints.sendCode.matchFulfilled, (state) => {
      state.step = 'code';
    });
    builder.addMatcher(api.endpoints.signIn.matchFulfilled, (state, action) => {
      if (action.payload.needPassword) {
        state.step = 'password';
      } else if (action.payload.success) {
        state.authorized = true;
      }
    });
    builder.addMatcher(
      api.endpoints.submitPassword.matchFulfilled,
      (state, action) => {
        if (action.payload.success) {
          state.authorized = true;
        }
      },
    );
  },
});

export const authReducer = authSlice.reducer;
export const { setPhone, setStep, logout } = authSlice.actions;
