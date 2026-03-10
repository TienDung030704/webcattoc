import AppRoutes from "@/components/AppRoutes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster toastOptions={{ className: "text-base [&_svg]:!size-5 [&_svg]:!mr-2" }} />
    </>
  );
}

export default App;
