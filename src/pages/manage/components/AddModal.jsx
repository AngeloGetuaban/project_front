import React, { useState } from 'react';

const AddModal = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [columns, setColumns] = useState(['']);

  const handleAddColumn = () => {
    setColumns([...columns, '']);
  };

  const handleChangeColumn = (index, value) => {
    const newCols = [...columns];
    newCols[index] = value;
    setColumns(newCols);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-lg h-[500px] rounded-xl shadow-xl relative overflow-hidden">
        <div className="p-6 overflow-y-auto h-full">
          <h2 className="text-xl font-semibold mb-4">Create New Database</h2>

          <label className="block font-medium mb-2">Database Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg"
          />

          <label className="block font-medium mb-2">Columns</label>
          {columns.map((col, idx) => (
            <input
              key={idx}
              type="text"
              value={col}
              onChange={e => handleChangeColumn(idx, e.target.value)}
              placeholder={`Column ${idx + 1}`}
              className="w-full mb-2 px-4 py-2 border rounded-lg"
            />
          ))}

          <button
            onClick={handleAddColumn}
            className="mb-4 text-blue-600 hover:underline text-sm"
          >
            + Add another column
          </button>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => alert(`Saving: ${title} with ${columns.join(', ')}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
