import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import cl from 'classnames';
import { FaTrashAlt } from 'react-icons/fa';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function SetTime({ setIsSetTime, onPostSuccess, isLoading, setIsLoading }) { 
    const [timeFields, setTimeFields] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    // const [isLoading, setIsLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState({ index: null, field: null });
    const dropdownRefs = useRef([]);
    const callApi = useCallApi();

    // Fetch dữ liệu lịch sử từ API
    const fetchData = useCallback(() => {
        setIsLoading(true);
        callApi(
            [DashboardRequestApi.setTimeRequest.historySetTime()],
            (res) => {
                if (Array.isArray(res) && Array.isArray(res[0])) {
                    const times = res[0].map(item => {
                        const [hour, minute] = item.time.split(':');
                        return { hour, minute };
                    });
                    setTimeFields(times);
                } else {
                    setTimeFields([]);
                }
                setIsLoading(false);
            },
            () => {
                console.error("Gọi API thất bại");
                setTimeFields([]);
                setIsLoading(false);
            }
        );
    }, [callApi]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddTimeField = () => {
        setTimeFields([...timeFields, { hour: "", minute: "" }]);
    };

    const handleRemoveTimeField = (index) => {
        const newTimeFields = timeFields.filter((_, i) => i !== index);
        setTimeFields(newTimeFields);
    };

    const toggleDropdown = (index, field) => {
        setDropdownVisible((prev) =>
            prev.index === index && prev.field === field
                ? { index: null, field: null }
                : { index, field }
        );
    };

    const handleTimeChange = (index, field, value) => {
        const newTimeFields = [...timeFields];
        newTimeFields[index][field] = value;
        setTimeFields(newTimeFields);
        setDropdownVisible({ index: null, field: null });
    };

    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (timeFields.every(({ hour, minute }) => hour !== "" && minute !== "")) {
            const data = {
                timeSettingObjects: timeFields.map((time, index) => ({
                    index: index,
                    time: `${time.hour}:${time.minute}:00`
                }))
            };
            setIsLoading(true);

            callApi(
                () => DashboardRequestApi.timeRequest.setTimeRequest(data),
                () => {
                    setIsLoading(false);
                    toast.success("Đã thiết lập thời gian thành công!");
                    setErrorMessage('');
                    setIsSetTime(false);
                    onPostSuccess();
                },
                (err) => {
                    setIsLoading(false);
                    if (err.response && err.response.data && err.response.data.title) {
                        setErrorMessage(err.response.data.title);
                    } else {
                        setErrorMessage('Đã có lỗi xảy ra, vui lòng thử lại!');
                    }
                }
            );
        } else {
            setErrorMessage('Cả hai thời gian không được để trống!');
        }
    };

    return (
        <div 
            className={cl("fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-30 z-9")}
            onClick={() => setDropdownVisible({ index: null, field: null })}
        >
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[600px] min-h-[200px] border-2 border-black">
                <i 
                    className="absolute top-0 right-0 text-2xl p-3 cursor-pointer hover:bg-gray-400 rounded-full"
                    onClick={() => setIsSetTime(false)}
                >
                    <IoCloseSharp />
                </i>
                <header className="text-xl font-bold text-center uppercase mb-4">Thiết Lập Thời Gian</header>

                <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                    {timeFields.map((time, index) => (
                        <div className="flex mb-2 items-center space-x-2" key={index}>
                            <h2 className="font-semibold">Lần đo {index + 1}</h2>
                            
                            {/* Dropdown giờ */}
                            <div className="relative flex-1">
                                <input 
                                    type="text"
                                    placeholder="Chọn giờ"
                                    value={time.hour}
                                    onClick={() => toggleDropdown(index, 'hour')}
                                    readOnly
                                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-green-500 focus:border-green-500"
                                />
                                {dropdownVisible.index === index && dropdownVisible.field === 'hour' && (
                                    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto w-full">
                                        {hourOptions.map((hour) => (
                                            <div 
                                                key={hour}
                                                onClick={() => handleTimeChange(index, 'hour', hour)}
                                                className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-green-100 transition-colors duration-150"
                                            >
                                                {hour}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown phút */}
                            <div className="relative flex-1">
                                <input 
                                    type="text"
                                    placeholder="Chọn phút"
                                    value={time.minute}
                                    onClick={() => toggleDropdown(index, 'minute')}
                                    readOnly
                                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-green-500 focus:border-green-500"
                                />
                                {dropdownVisible.index === index && dropdownVisible.field === 'minute' && (
                                    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto w-full">
                                        {minuteOptions.map((minute) => (
                                            <div 
                                                key={minute}
                                                onClick={() => handleTimeChange(index, 'minute', minute)}
                                                className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-green-100 transition-colors duration-150"
                                            >
                                                {minute}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <FaTrashAlt 
                                className="text-red-500 font-bold ml-2 cursor-pointer" 
                                onClick={() => handleRemoveTimeField(index)}
                            />
                        </div>
                    ))}

                    {errorMessage && (
                        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
                    )}

                    <div className="flex justify-center space-x-4">
                        <button 
                            type="button"
                            className="bg-blue-300 hover:bg-blue-400 text-black py-2 px-4 rounded-md shadow-md"
                            onClick={handleAddTimeField}
                        >
                            Thêm Thời Gian Đo
                        </button>
                        <button 
                            type="submit" 
                            className={cl("bg-green-300 hover:bg-green-400 text-black py-2 px-4 rounded-md shadow-md", {
                                'opacity-50 cursor-not-allowed': isLoading
                            })}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SetTime;
