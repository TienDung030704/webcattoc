import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import AppRoutes from "@/components/AppRoutes";
import { authUserService } from "@/service/auth/authUser/authUserService";
import { Toaster } from "sonner";

function App() {
  const dispatch = useDispatch();
  const hasHydratedAuthRef = useRef(false);

  useEffect(() => {
    if (hasHydratedAuthRef.current) {
      return;
    }

    hasHydratedAuthRef.current = true;

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      return;
    }

    let isDisposed = false;

    const hydrateCurrentUser = async () => {
      const result = await dispatch(authUserService());

      if (isDisposed) {
        return;
      }

      if (authUserService.fulfilled.match(result) && result.payload) {
        // Ghi đè cache local để các màn hình đang đọc user_data nhận đúng profile mới nhất từ backend.
        localStorage.setItem("user_data", JSON.stringify(result.payload));
        window.dispatchEvent(new CustomEvent("user-data-updated"));
        return;
      }

      if (result.payload?.status === 401) {
        // Khi phiên đăng nhập không còn hợp lệ thì dọn sạch storage để UI quay về trạng thái guest.
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
        window.dispatchEvent(new CustomEvent("user-data-updated"));
      }
    };

    hydrateCurrentUser();

    return () => {
      isDisposed = true;
    };
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster toastOptions={{ className: "text-base [&_svg]:!size-5 [&_svg]:!mr-2" }} />
    </>
  );
}

export default App;
