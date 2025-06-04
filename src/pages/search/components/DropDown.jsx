// src/pages/search/components/Dropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
const DropDown = ({ label = "Select Option", options = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left w-64" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full z-30 bg-white border border-gray-300 rounded-lg px-4 py-2 text-left shadow-sm hover:border-gray-400 transition"
      >
        <span>{selected}</span>
        <svg
          className="w-5 h-5 inline float-right mt-1 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

        <div
        className={`absolute z-50 top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        >
        <ul className="py-2 max-h-60 overflow-y-auto">
            {options.map((option, index) => (
            <li
                key={index}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => handleSelect(option)}
            >
                {option}
            </li>
            ))}
        </ul>
        </div>
    </div>
  );
};

export default DropDown;
