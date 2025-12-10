import Axios, { type AxiosError, type AxiosRequestConfig, type AxiosInstance } from 'axios';

export const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_API_URL as string || 'http://localhost:8000'
});

// ✅ Add auth interceptor
AXIOS_INSTANCE.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const promise = AXIOS_INSTANCE({ ...config }).then(({ data }) => data);
  return promise;
};

export interface ErrorType<Error> extends AxiosError<Error> { }
