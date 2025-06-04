import React, { useEffect, useState } from 'react';

const Loginalert = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`fixed right-6 top-6 z-50 px-4 py-3 rounded-md shadow-lg text-white transition-all duration-500 ease-in-out
      ${type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
          'bg-blue-600'}
      animate-slide-in`}>

      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Loginalert;
