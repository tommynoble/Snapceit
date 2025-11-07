import { toast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'loading';

export const useToast = () => {
  const showToast = (message: string, type: ToastType = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message, {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: 'white',
          },
        });
        break;
      case 'error':
        toast.error(message, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: 'white',
          },
        });
        break;
      case 'loading':
        toast.loading(message, {
          position: 'top-right',
        });
        break;
      default:
        toast(message, {
          duration: 3000,
          position: 'top-right',
        });
    }
  };

  const dismissToast = () => {
    toast.dismiss();
  };

  return { showToast, dismissToast };
};
