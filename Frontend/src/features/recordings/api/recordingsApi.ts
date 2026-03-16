import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';

export interface Recording {
  id: string;
  filename: string;
  triggerType: 'motion' | 'user' | 'button';
  duration: number;
  fileSize: number;
  createdAt: string;
}

export const recordingsApi = createApi({
  reducerPath: 'recordingsApi',
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
  tagTypes: ['Recording'],
  endpoints: (builder) => ({
    getRecordings: builder.query<Recording[], { page: number; limit: number }>({
      query: ({ page, limit }) => `/recordings?page=${page}&limit=${limit}`,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return [...currentCache, ...newItems];
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ['Recording'],
    }),
    getRecordingById: builder.query<Recording, string>({
      query: (id) => `/recordings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Recording', id }],
    }),
    deleteRecording: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recordings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recording'],
    }),
  }),
});

export const {
  useGetRecordingsQuery,
  useGetRecordingByIdQuery,
  useDeleteRecordingMutation,
} = recordingsApi;
