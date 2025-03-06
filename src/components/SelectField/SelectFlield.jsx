function SelectField({ label, id, value, onChange, options }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="text-gray-700 mb-1">
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                className="border border-gray-300 p-2 rounded-md focus:ring-green-500 focus:border-green-500"
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default SelectField;

