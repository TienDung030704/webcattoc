import { useEffect, useState } from "react";
import { authLogin, authLogout, authRegister } from "@/service/auth/authService";
import { useDispatch, useSelector } from "react-redux";

// Ham dispatch de dispatch toi API register
export const useAutoRegister = () => {
  const dispatch = useDispatch();
  const register = async (data) => {
    const result = await dispatch(authRegister(data));
    return result.payload;
  };

  return register;
};

// Ham dispatch de dispatch toi API login
export const useAutoLogin = () => {
  const dispatch = useDispatch();
  const login = async (data) => {
    const result = await dispatch(authLogin(data));
    return result.payload;
  };

  return login;
};

export const useAutoLogout = () => {
  const dispatch = useDispatch();

  const logout = async (data) => {  
    const result = await dispatch(authLogout(data));
    return result.payload;
  };

  return logout;
};

const readCurrentUserFromStorage = () => {
  const localStorageUser = localStorage.getItem("user_data");

  if (!localStorageUser) {
    return null;
  }

  try {
    return JSON.parse(localStorageUser);
  } catch {
    localStorage.removeItem("user_data");
    return null;
  }
};

export const useGetCurrentUser = () => {
  const currentUser = useSelector((state) => state.authLogin?.userInfo);
  const hydratedUser = useSelector((state) => state.user?.userInfo);
  const [storedUser, setStoredUser] = useState(() => readCurrentUserFromStorage());
  const hasAccessToken = Boolean(localStorage.getItem("access_token"));
  const hasHydratedUser = hydratedUser && Object.keys(hydratedUser).length > 0;

  useEffect(() => {
    // Khi profile vừa được cập nhật thì đọc lại localStorage để UI đổi ngay không cần reload.
    const syncCurrentUser = () => {
      setStoredUser(readCurrentUserFromStorage());
    };

    window.addEventListener("user-data-updated", syncCurrentUser);

    return () => {
      window.removeEventListener("user-data-updated", syncCurrentUser);
    };
  }, []);

  if (!hasAccessToken) {
    return null;
  }

  return (hasHydratedUser ? hydratedUser : null) || storedUser || currentUser;
};
