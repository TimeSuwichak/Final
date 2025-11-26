import Swal from 'sweetalert2';

// Custom configuration for SweetAlert2 with theme support
const getThemeConfig = () => {
  // ตรวจสอบว่า dark mode เปิดอยู่หรือไม่
  const isDarkMode = document.documentElement.classList.contains('dark');

  return {
    confirmButtonText: 'ตกลง',
    cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#aaa',
    buttonsStyling: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    background: isDarkMode ? '#1a1c2e' : '#ffffff',
    color: isDarkMode ? '#e5e5e5' : '#000000',
  };
};

const defaultConfig = {
  confirmButtonText: 'ตกลง',
  cancelButtonText: 'ยกเลิก',
  confirmButtonColor: '#7c3aed',
  cancelButtonColor: '#aaa',
  buttonsStyling: true,
  allowOutsideClick: false,
  allowEscapeKey: true,
};

// Success alert
export const showSuccess = (title: string, text?: string) => {
  const config = getThemeConfig();
  return Swal.fire({
    icon: 'success',
    title,
    text,
    ...config,
    didOpen: () => {
      const icon = document.querySelector('.swal2-icon.swal2-success');
      if (icon) {
        (icon as HTMLElement).style.borderColor = '#7c3aed';
        (icon as HTMLElement).style.color = '#7c3aed';
        const lines = icon.querySelectorAll('[class^=swal2-success-line]');
        lines.forEach((line) => {
          (line as HTMLElement).style.backgroundColor = '#7c3aed';
        });
        const ring = icon.querySelector('.swal2-success-ring');
        if (ring) {
          (ring as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }
      }
    },
  });
};

// Error alert
export const showError = (title: string, text?: string) => {
  const config = getThemeConfig();
  return Swal.fire({
    icon: 'error',
    title,
    text,
    ...config,
  });
};

// Warning alert
export const showWarning = (title: string, text?: string) => {
  const config = getThemeConfig();
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    ...config,
    didOpen: () => {
      const icon = document.querySelector('.swal2-icon.swal2-warning');
      if (icon) {
        (icon as HTMLElement).style.borderColor = '#7c3aed';
        (icon as HTMLElement).style.color = '#7c3aed';
      }
    },
  });
};

// Info alert
export const showInfo = (title: string, text?: string) => {
  const config = getThemeConfig();
  return Swal.fire({
    icon: 'info',
    title,
    text,
    ...config,
    didOpen: () => {
      const icon = document.querySelector('.swal2-icon.swal2-info');
      if (icon) {
        (icon as HTMLElement).style.borderColor = '#7c3aed';
        (icon as HTMLElement).style.color = '#7c3aed';
      }
    },
  });
};

// Confirm dialog
export const showConfirm = (
  title: string,
  text?: string,
  confirmText: string = 'ยืนยัน',
  cancelText: string = 'ยกเลิก'
) => {
  const config = getThemeConfig();
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#7c3aed',
    cancelButtonColor: '#aaa',
    buttonsStyling: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    background: config.background,
    color: config.color,
    didOpen: () => {
      const icon = document.querySelector('.swal2-icon.swal2-question');
      if (icon) {
        (icon as HTMLElement).style.borderColor = '#7c3aed';
        (icon as HTMLElement).style.color = '#7c3aed';
      }
    },
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
  const config = getThemeConfig();

  return Swal.fire({
    icon: icons[type] as any,
    title: message,
    ...config,
    didOpen: () => {
      const iconClass = `.swal2-icon.swal2-${icons[type]}`;
      const icon = document.querySelector(iconClass);
      if (icon) {
        if (type === 'success') {
          (icon as HTMLElement).style.borderColor = '#7c3aed';
          (icon as HTMLElement).style.color = '#7c3aed';
          const lines = icon.querySelectorAll('[class^=swal2-success-line]');
          lines.forEach((line) => {
            (line as HTMLElement).style.backgroundColor = '#7c3aed';
          });
          const ring = icon.querySelector('.swal2-success-ring');
          if (ring) {
            (ring as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.3)';
          }
        } else if (type !== 'error') {
          (icon as HTMLElement).style.borderColor = '#7c3aed';
          (icon as HTMLElement).style.color = '#7c3aed';
        }
      }
    },
  });
};

// Prompt with input (e.g., for numeric quantity)
export const showPrompt = async (
  title: string,
  inputLabel?: string,
  inputType: 'text' | 'number' | 'textarea' = 'text',
  placeholder?: string,
  inputValue?: string | number
) => {
  const config = getThemeConfig();
  return Swal.fire({
    title,
    input: inputType as any,
    inputLabel: inputLabel,
    inputPlaceholder: placeholder,
    inputValue: inputValue as any,
    showCancelButton: true,
    confirmButtonText: defaultConfig.confirmButtonText,
    cancelButtonText: defaultConfig.cancelButtonText,
    confirmButtonColor: defaultConfig.confirmButtonColor,
    cancelButtonColor: defaultConfig.cancelButtonColor,
    inputAttributes: inputType === 'number' ? { min: '1', step: '1' } : undefined,
    allowOutsideClick: defaultConfig.allowOutsideClick,
    allowEscapeKey: defaultConfig.allowEscapeKey,
    background: config.background,
    color: config.color,
  });
};

