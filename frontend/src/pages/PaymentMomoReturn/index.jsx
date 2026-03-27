import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useCartActions } from "@/features/cart/hook";
import { getMomoOrderStatus } from "@/service/order/orderService";

const ORDER_SUCCESS_STORAGE_KEY = "payment_order_snapshot";

function PaymentMomoReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartActions();
  useEffect(() => { 
    const handleReturn = async () => {
      const orderId = searchParams.get("orderId");

      if (!orderId) {
        toast.error("Không tìm thấy đơn hàng MoMo cần xử lý.", {
          position: "top-right",
        });
        navigate("/payment", { replace: true });
        return;
      }

      try {
        const orderSnapshot = await getMomoOrderStatus(orderId);

        if (orderSnapshot.paymentStatus === "PAID") {
          // Callback page chỉ chốt UX điều hướng sau khi backend đã xác nhận paid.
          sessionStorage.setItem(
            ORDER_SUCCESS_STORAGE_KEY,
            JSON.stringify(orderSnapshot),
          );
          clearCart();

          toast.success("Thanh toán MoMo thành công.", {
            position: "top-right",
          });

          navigate("/payment/success", {
            replace: true,
            state: {
              orderSnapshot,
            },
          });
          return;
        }

        if (orderSnapshot.paymentStatus === "PENDING") {
          sessionStorage.setItem(
            "payment_momo_snapshot",
            JSON.stringify(orderSnapshot),
          );
          toast.info("Đơn hàng vẫn đang chờ MoMo xác nhận.", {
            position: "top-right",
          });
          navigate("/payment/momo", {
            replace: true,
            state: {
              orderSnapshot,
            },
          });
          return;
        }

        sessionStorage.setItem(
          "payment_momo_snapshot",
          JSON.stringify(orderSnapshot),
        );
        toast.error("Thanh toán MoMo chưa thành công. Vui lòng thử lại.", {
          position: "top-right",
        });
        navigate("/payment/momo", {
          replace: true,
          state: {
            orderSnapshot,
          },
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.error || "Không thể đồng bộ trạng thái MoMo.",
          {
            position: "top-right",
          },
        );
        navigate("/payment", { replace: true });
      }
    };

    handleReturn();
  }, [clearCart, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm text-white/60">
          Đang đồng bộ trạng thái thanh toán MoMo...
        </p>
      </div>
    </div>
  );
}

export default PaymentMomoReturnPage;
