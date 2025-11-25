import Swal from 'sweetalert2';

// Custom configuration for SweetAlert2
const defaultConfig = {
  confirmButtonText: 'ตกลง',
  cancelButtonText: 'ยกเลิก',
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#aaa',
  buttonsStyling: true,
  allowOutsideClick: false,
  allowEscapeKey: true,
};

// Success alert
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    ...defaultConfig,
  });
};

// Error alert
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    ...defaultConfig,
  });
};

// Warning alert
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    ...defaultConfig,
  });
};

// Info alert
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    ...defaultConfig,
  });
};

// Confirm dialog
export const showConfirm = (
  title: string,
  text?: string,
  confirmText: string = 'ยืนยัน',
  cancelText: string = 'ยกเลิก'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa',
    buttonsStyling: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
  });
};

// Simple alert (replacement for window.alert)
export const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  const icons = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  return Swal.fire({
    icon: icons[type] as any,
    title: message,
    ...defaultConfig,
  });
};

