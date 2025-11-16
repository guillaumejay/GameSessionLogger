import Swal from 'sweetalert2';
import { useI18n } from './useI18n';

export function useToast() {
  const { t } = useI18n();

  function showSuccess(message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }

  function showError(message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  function showWarning(message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  async function confirm(title: string, text: string): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('common.confirmDelete'),
      cancelButtonText: t('common.cancel')
    });

    return result.isConfirmed;
  }

  return {
    showSuccess,
    showError,
    showWarning,
    confirm
  };
}
