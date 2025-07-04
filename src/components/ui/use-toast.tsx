import { toast as hotToast } from "react-hot-toast";

export const useToast = () => {
  return {
    toast: {
      success: (message: string) => hotToast.success(message),
      error: (message: string) => hotToast.error(message),
      loading: (message: string) => hotToast.loading(message),
      dismiss: () => hotToast.dismiss(),
    },
  };
};
