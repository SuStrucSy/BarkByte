import Axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

export const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
});

AXIOS_INSTANCE.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const promise = AXIOS_INSTANCE({ ...config }).then(({ data }) => data);
  return promise;
};

export interface ErrorType<Error> extends AxiosError<Error> {}
