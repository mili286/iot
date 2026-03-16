import {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Handle unauthorized
      }
      return Promise.reject(error);
    },
  );
};
