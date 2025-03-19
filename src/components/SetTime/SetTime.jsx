import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { FaTrashAlt } from 'react-icons/fa';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function SetTime({ setIsSetTime, onPostSuccess, isLoading, setIsLoading }) {
  const [timeFields, setTimeFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState({ index: null, field: null });
  const dropdownRefs = useRef([]);
  const callApi = useCallApi();
  const farmId = Number(localStorage.getItem('farmId'));

  const fetchData = useCallback(() => {
    setIsLoading(true);
    callApi(
      [DashboardRequestApi.setTimeRequest.historySetTime(farmId)],
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
  }, [callApi, farmId, setIsLoading]);

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
        farmId: farmId,
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
          setErrorMessage(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        }
      );
    } else {
      setErrorMessage('Vui lòng điền đầy đủ giờ và phút!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-teal-100 to-gray-100/40 backdrop-blur-sm transition-all duration-300 ease-in-out"
      onClick={() => setDropdownVisible({ index: null, field: null })}
    >
      <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md mx-4 border border-teal-200 transform transition-all duration-300 hover:shadow-2xl">
        <button
          onClick={() => setIsSetTime(false)}
          className="absolute top-3 right-3 p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full transition-all duration-200"
          aria-label="Đóng modal"
        >
          <IoCloseSharp className="w-5 h-5" />
        </button>

        <header className="text-2xl sm:text-3xl font-bold text-center text-teal-700 mb-6 tracking-tight">
          Thiết Lập Thời Gian
        </header>

        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          {timeFields.map((time, index) => (
            <div className="flex items-center mb-4 space-x-3" key={index}>
              <span className="text-sm font-medium text-teal-800 w-32">
                Thời gian {index + 1}
              </span>

              {/* Dropdown giờ */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Giờ"
                  value={time.hour}
                  onClick={() => toggleDropdown(index, 'hour')}
                  readOnly
                  className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                />
                {dropdownVisible.index === index && dropdownVisible.field === 'hour' && (
                  <div className="absolute z-20 mt-1 bg-white border border-teal-200 rounded-lg shadow-lg max-h-40 overflow-y-auto w-full">
                    {hourOptions.map((hour) => (
                      <div
                        key={hour}
                        onClick={() => handleTimeChange(index, 'hour', hour)}
                        className="px-3 py-1.5 text-teal-700 cursor-pointer hover:bg-teal-50 hover:text-teal-900 transition-colors duration-150"
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
                  placeholder="Phút"
                  value={time.minute}
                  onClick={() => toggleDropdown(index, 'minute')}
                  readOnly
                  className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                />
                {dropdownVisible.index === index && dropdownVisible.field === 'minute' && (
                  <div className="absolute z-20 mt-1 bg-white border border-teal-200 rounded-lg shadow-lg max-h-40 overflow-y-auto w-full">
                    {minuteOptions.map((minute) => (
                      <div
                        key={minute}
                        onClick={() => handleTimeChange(index, 'minute', minute)}
                        className="px-3 py-1.5 text-teal-700 cursor-pointer hover:bg-teal-50 hover:text-teal-900 transition-colors duration-150"
                      >
                        {minute}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveTimeField(index)}
                className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full transition-all duration-200"
              >
                <FaTrashAlt className="w-4 h-4" />
              </button>
            </div>
          ))}

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-4 animate-pulse">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleAddTimeField}
              className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 hover:text-teal-800 transition-all duration-200"
            >
              Thêm Thời Gian
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cl(
                "px-4 py-2 sm:py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-300",
                {
                  "bg-teal-600 hover:bg-teal-700 hover:shadow-lg": !isLoading,
                  "bg-gray-300 cursor-not-allowed": isLoading,
                }
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang Lưu...
                </span>
              ) : (
                'Lưu'
              )}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default SetTime;