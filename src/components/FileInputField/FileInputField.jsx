// FileInputField.jsx
import React from 'react';

function FileInputField({ label, id, onChange, accept = ".pdf,.jpg,.jpeg,.png" }) {
    return (
        <div className="mb-2">
            <label htmlFor={id} className="block text-left font-semibold mb-2">{label}:</label>
            <input 
                type="file"
                id={id}
                name={id}
                accept={accept} 
                onChange={onChange} 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
        </div>
    );
}

export default FileInputField;
