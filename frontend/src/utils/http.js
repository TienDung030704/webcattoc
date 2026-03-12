import axios from "axios";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
});

httpClient.interceptors.request.use((config) => {
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const refreshToken = async () => {
  try {
    const result = await post("auth/refresh-token", {
      refreshToken: localStorage.getItem("refresh_token"),
    });

    const payload = result?.data || result;
    const nextAccessToken = payload?.accessToken || payload?.access_token;
    const nextRefreshToken = payload?.refreshToken || payload?.refresh_token;

    if (nextAccessToken) {
      localStorage.setItem("access_token", nextAccessToken);
    }

    if (nextRefreshToken) {
      localStorage.setItem("refresh_token", nextRefreshToken);
    }

    if (payload) {
      const currentUserData = localStorage.getItem("user_data");
      let mergedUserData = payload;

      if (currentUserData) {
        try {
          mergedUserData = {
            ...JSON.parse(currentUserData),
            ...payload,
          };
        } catch {
          mergedUserData = payload;
        }
      }

      localStorage.setItem("user_data", JSON.stringify(mergedUserData));
      window.dispatchEvent(new Event("user-data-updated"));
    }

    processQueue(null);
  } catch (error) {
    processQueue(error);
    throw error;
  }
};

const getNewToken = async () => {
  if (!isRefreshing) {
    isRefreshing = true;
    await refreshToken();
    isRefreshing = false;
    return;
  }

  // Return a promise that resolves with the new token
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
};

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(error);
  }
);

// Handle refresh token
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest = requestUrl.includes("auth/login") || requestUrl.includes("auth/register");
    const hasRefreshToken = Boolean(localStorage.getItem("refresh_token"));
    const shouldRenewToken =
      status === 401 &&
      !originalRequest?._retry &&
      !isAuthRequest &&
      hasRefreshToken;

    if (shouldRenewToken) {
      originalRequest._retry = true;
      try {
        await getNewToken();
        return httpClient(originalRequest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

const _send = async (method, path, data, config) => {
  const response = await httpClient.request({
    ...config,
    method,
    url: path,
    data,
  });
  return response.data;
};
const get = async (path, config) => {
  return await _send("get", path, null, config);
};
const post = async (path, data, config) => {
  return await _send("post", path, data, config);
};
const put = async (path, data, config) => {
  return await _send("put", path, data, config);
};
const patch = async (path, data, config) => {
  return await _send("patch", path, data, config);
};
const del = async (path, config) => {
  return await _send("delete", path, null, config);
};

const http = { get, post, put, patch, del };

export default http;
