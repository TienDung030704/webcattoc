import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { authUserService } from "@/service/auth/authUser/authUserService";
import { useCartActions } from "@/features/cart/hook";
import { useFavoriteActions } from "@/features/favorite/hook";
import { toast } from "sonner";

function GoogleCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { syncCartStorageByCurrentUser } = useCartActions();
  const { resetFavoritesState } = useFavoriteActions();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const mode = sessionStorage.getItem("google_mode") || "login";
    sessionStorage.removeItem("google_mode");

    // Xử lý lỗi
    if (error) {
      toast.error("Đăng nhập Google thất bại. Vui lòng thử lại!", {
        position: "top-right",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          border: "1px solid #b91c1c",
        },
      });
      navigate(mode === "register" ? "/auth/register" : "/auth/login", {
        replace: true,
      });
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const userRaw = params.get("user");
    const isNew = params.get("is_new") === "1";

    if (!accessToken || !userRaw) {
      toast.error("Đăng nhập Google thất bại", { position: "top-right" });
      navigate("/auth/login", { replace: true });
      return;
    }

    try {
      const userData = JSON.parse(userRaw);

      // Đăng ký mới → về trang login để đăng nhập lại
      if (isNew) {
        toast.success("Đăng ký Google thành công! Vui lòng đăng nhập.", {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#16a34a",
            color: "#ffffff",
            border: "1px solid #15803d",
          },
        });
        navigate("/auth/login", { replace: true });
        return;
      }

      // Đăng nhập → lưu token và vào trang chủ
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user_data", JSON.stringify(userData));

      const hydrateCurrentUser = async () => {
        const currentUserResult = await dispatch(authUserService());
        if (authUserService.fulfilled.match(currentUserResult) && currentUserResult.payload) {
          // Sau Google login, ghi đè cache local bằng profile từ /auth/me để đồng bộ với login thường.
          localStorage.setItem("user_data", JSON.stringify(currentUserResult.payload));
        }

        resetFavoritesState();
        syncCartStorageByCurrentUser();
        window.dispatchEvent(new CustomEvent("user-data-updated"));

        toast.success("Đăng nhập Google thành công!", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#16a34a",
            color: "#ffffff",
            border: "1px solid #15803d",
          },
        });

        navigate("/", { replace: true });
      };

      hydrateCurrentUser();
      return;
    } catch {
      toast.error("Đăng nhập Google thất bại", { position: "top-right" });
      navigate("/auth/login", { replace: true });
    }
  }, [dispatch, navigate, syncCartStorageByCurrentUser, resetFavoritesState]);

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="text-center text-white">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm text-white/60">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

export default GoogleCallback;
