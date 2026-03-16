import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth',
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
    }),
    refreshToken: builder.mutation({
      query: (token) => ({
        url: '/refresh-token',
        method: 'POST',
        body: { refreshToken: token },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
} = authApi;
