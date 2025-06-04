import React, { useEffect, useState } from 'react';

const CustomAlert = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-md shadow-xl text-white transition-all duration-500 ease-in-out
      ${type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
          'bg-blue-600'}
      animate-slide-in`}
    >
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default CustomAlert;
