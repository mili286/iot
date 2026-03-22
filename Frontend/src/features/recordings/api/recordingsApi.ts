import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';

export interface Recording {
  id: string;
  filename: string;
  triggerType: string;
  duration: number;
  size: number;
  createdAt: string;
  recordingDate: string;
  syncDate: string;
  userId?: string;
  userName?: string;
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
    getRecordings: builder.query<
      Recording[], 
      { 
        page: number; 
        limit: number; 
        searchTerm?: string;
        triggerType?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
      }
    >({
      query: ({ page, limit, searchTerm, triggerType, startDate, endDate, sortBy }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (searchTerm) params.append('searchTerm', searchTerm);
        if (triggerType && triggerType !== 'all') params.append('triggerType', triggerType);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sortBy) params.append('sortBy', sortBy);

        return `/recordings?${params.toString()}`;
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const { searchTerm, triggerType, startDate, endDate, sortBy } = queryArgs;
        return `getRecordings-${searchTerm || ''}-${triggerType || ''}-${startDate || ''}-${endDate || ''}-${sortBy || ''}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return [...currentCache, ...newItems];
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.searchTerm !== previousArg?.searchTerm ||
          currentArg?.triggerType !== previousArg?.triggerType ||
          currentArg?.startDate !== previousArg?.startDate ||
          currentArg?.endDate !== previousArg?.endDate ||
          currentArg?.sortBy !== previousArg?.sortBy
        );
      },
      providesTags: ['Recording'],
    }),
    getRecordingById: builder.query<Recording, string>({
      query: (id) => `/recordings/${id}/details`,
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
