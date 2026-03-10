import { authUserService } from "@/service/auth/authUser/authUserService";
import { useDispatch, useSelector } from "react-redux";

// Hook để gọi API lấy thông tin user
export const useFetchUser = () => {
  const dispatch = useDispatch();
  const fetchUserInfo = async () => {
    const result = await dispatch(authUserService());
    return result.payload;
  };
  return fetchUserInfo;
};

// Hook để lấy thông tin user từ store
export const useCurrentUser = () => {
  const currentUser = useSelector((state) => state.user?.userInfo);
  return currentUser;
};
