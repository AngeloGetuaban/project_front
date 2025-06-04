// src/pages/home/components/Container.jsx
import React from 'react';

const Container = ({ icon, title, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-48 h-48 bg-white shadow-md rounded-xl flex flex-col items-center justify-center 
                 cursor-pointer transform transition duration-300 ease-in-out 
                 hover:scale-105 hover:shadow-xl group"
    >
      <div className="text-6xl transition duration-300 group-hover:text-blue-600">
        {icon}
      </div>
      <div className="mt-4 text-lg font-semibold transition duration-300 group-hover:text-blue-600 text-center px-2">
        {title}
      </div>
    </div>
  );
};

export default Container;
