import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';

export interface SystemParameters {
  recordingsCount: number;
  totalRecordingsDuration: number;
  motionEventsCount: number;
  status: string;
  resolution: string;
  lastUpdated: string;
}

export const systemApi = createApi({
  reducerPath: 'systemApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['SystemParameters'],
  endpoints: (builder) => ({
    getSystemParameters: builder.query<SystemParameters, void>({
      query: () => '/system/parameters',
      providesTags: ['SystemParameters'],
    }),
  }),
});

export const { useGetSystemParametersQuery } = systemApi;
