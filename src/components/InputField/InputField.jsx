// InputField.jsx
import React from 'react';

function InputField({ label, id, value, onChange, type = "text", placeholder = "", min = 0 }) {
    return (
        <div className="mb-2">
            <label htmlFor={id} className="block text-left font-semibold mb-2">{label}:</label>
            <input 
                type={type} 
                id={id} 
                name={id} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder} 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
                min={min}
            />
        </div>
    );
}

export default InputField;
