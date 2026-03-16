import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../types';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/users' }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '',
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/${id}`,
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = usersApi;
