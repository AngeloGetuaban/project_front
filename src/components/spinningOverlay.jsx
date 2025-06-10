import React from 'react';

const SpinnerOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
  </div>
);

export default SpinnerOverlay;
