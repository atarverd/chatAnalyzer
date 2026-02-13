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

export type AnalysisBlock = {
  header: string;
  type:
    | 'main_block'
    | 'secondary_block'
    | 'recommendations_block'
    | 'answer_variants';
  text: string;
};

export type AnalyzeResponse = {
  analysis?: string;
  blocks?: AnalysisBlock[];
};

const baseQueryWithLogging = async (args: any, api: any, extraOptions: any) => {
  const result = await fetchBaseQuery({
    baseUrl: API_BASE_URL,
    // Include credentials to send cookies with requests
    // Backend must have AllowCredentials: true and specific origins (not *)
    credentials: 'include',
  })(args, api, extraOptions);

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
          const url = 'https://chatvibe.dategram.io/chats';
          const response = await fetch(url, {
            credentials: 'include', // Include cookies in requests
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
              error: error.message || 'Failed to fetch chats',
            },
          };
        }
      },
    }),
    getAnalyzePossible: builder.query<{ possible: boolean }, number>({
      queryFn: async (chatId) => {
        try {
          const url = `https://chatvibe.dategram.io/chats/${chatId}/analyze/possible`;
          const response = await fetch(url, {
            credentials: 'include',
          });
          const data = await response.json();

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: data ?? {},
              },
            };
          }

          return {
            data: {
              possible:
                data === true || data === false
                  ? data
                  : (data?.possible ?? true),
            },
          };
        } catch (error: any) {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error.message || 'Failed to check analyze possibility',
            },
          };
        }
      },
    }),
    analyzeChat: builder.mutation<
      AnalyzeResponse,
      { chatId: number; type: string; tone?: string; language?: string }
    >({
      queryFn: async ({ chatId, type, tone, language }) => {
        try {
          const url = `https://chatvibe.dategram.io/chats/${chatId}/analyze`;

          // Don't use abort signal - let request continue in background
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type,
              ...(tone && { tone }),
              ...(language && { language }),
            }),
            credentials: 'include', // Include cookies in requests
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

          // Normalize: API may return blocks array as root or in { blocks }
          const normalized: AnalyzeResponse = Array.isArray(data)
            ? { blocks: data }
            : data?.blocks
              ? data
              : {
                  analysis:
                    typeof data?.analysis === 'string'
                      ? data.analysis
                      : JSON.stringify(data),
                };

          return { data: normalized };
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
    logout: builder.mutation<{ success?: boolean }, void>({
      queryFn: async () => {
        try {
          const url = 'https://chatvibe.dategram.io/api/auth/logout';
          const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
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
              error: error.message || 'Failed to logout',
            },
          };
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useAuthStatusQuery,
  useSendCodeMutation,
  useSignInMutation,
  useSubmitPasswordMutation,
  useGetChatsQuery,
  useLazyGetAnalyzePossibleQuery,
  useAnalyzeChatMutation,
  useLogoutMutation,
} = api;
