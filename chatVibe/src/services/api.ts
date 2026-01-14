import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@env';

type AuthStatusResponse = { authorized: boolean };
type SendCodeResponse = { message?: string };
type SignInResponse = {
  needPassword?: boolean;
  success?: boolean;
  error?: string;
};
type PasswordResponse = { success?: boolean; error?: string };
type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

const baseQueryWithLogging = async (args: any, api: any, extraOptions: any) => {
  const result = await fetchBaseQuery({ baseUrl: API_BASE_URL })(
    args,
    api,
    extraOptions
  );

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogging,
  tagTypes: ['Auth'],
  // Keep data even when components unmount
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    authStatus: builder.query<AuthStatusResponse, void>({
      query: () => '/auth/status',
      providesTags: ['Auth'],
    }),
    sendCode: builder.mutation<SendCodeResponse, { phone: string }>({
      query: (body) => ({
        url: '/auth/send-code',
        method: 'POST',
        body,
      }),
    }),
    signIn: builder.mutation<SignInResponse, { phone: string; code: string }>({
      query: (body) => ({
        url: '/auth/sign-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    submitPassword: builder.mutation<PasswordResponse, { password: string }>({
      query: (body) => ({
        url: '/auth/password',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    getChats: builder.query<Chat[], void>({
      queryFn: async () => {
        try {
          const url = 'https://chatvibe.tvintla.net/chats';
          const response = await fetch(url);
          const data = await response.json();

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: data,
              },
            };
          }

          return { data };
        } catch (error: any) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error.message || 'Failed to fetch chats',
            },
          };
        }
      },
    }),
    analyzeChat: builder.mutation<
      { analysis: string },
      { chatId: number; type: string }
    >({
      queryFn: async ({ chatId, type }) => {
        try {
          const url = `https://chatvibe.tvintla.net/chats/${chatId}/analyze`;

          // Don't use abort signal - let request continue in background
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
            // No signal - request will continue even if app goes to background
          });

          const data = await response.json();

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: data,
              },
            };
          }

          return { data };
        } catch (error: any) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error.message || 'Failed to analyze chat',
            },
          };
        }
      },
    }),
  }),
});

export const {
  useAuthStatusQuery,
  useSendCodeMutation,
  useSignInMutation,
  useSubmitPasswordMutation,
  useGetChatsQuery,
  useAnalyzeChatMutation,
} = api;
