import React from 'react';

function InputTypeSelector({ inputType, dispatch }) {
  const types = ['image', 'video', 'webcam'];

  return (
    <div className="mb-4 flex gap-2">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => dispatch({ type: 'SET_INPUT_TYPE', payload: type })}
          className={`px-4 py-2 rounded ${
            inputType === type ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default InputTypeSelector;
