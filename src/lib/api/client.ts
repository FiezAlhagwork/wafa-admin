import axios from "axios";
import { toApiError } from "./errors";

// The only axios instance in the dashboard. The Clerk token is fetched before every request (never stored);
// AdminProvider registers Clerk's getToken here once, so there is no instance per render.
let tokenGetter: (() => Promise<string | null>) | null = null;
export const setTokenGetter = (fn: typeof tokenGetter) => {
  tokenGetter = fn;
};

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenGetter?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Hooks and components always receive an ApiError.
api.interceptors.response.use(undefined, (error) => Promise.reject(toApiError(error)));
