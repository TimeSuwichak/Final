import Swal from 'sweetalert2';

// Custom configuration for SweetAlert2 with theme support
const getThemeConfig = () => {
  // ตรวจสอบว่า dark mode เปิดอยู่หรือไม่
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return {
    confirmButtonText: 'ตกลง',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#3085d6',
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
  confirmButtonColor: '#3085d6',
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
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa',
    buttonsStyling: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    background: config.background,
    color: config.color,
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

