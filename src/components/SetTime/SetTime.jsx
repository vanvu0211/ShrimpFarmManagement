import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function SetTime({ setIsSetTime, onPostSuccess, isLoading, setIsLoading }) {
  const [timeFields, setTimeFields] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const callApi = useCallApi();
  const farmId = Number(localStorage.getItem('farmId'));
  const lastTimeFieldRef = useRef(null); // Tham chiếu đến mục thời gian mới nhất

  // Tạo danh sách giờ và phút
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Lấy dữ liệu thời gian đã lưu từ API
  const fetchData = useCallback(() => {
    setIsLoading(true);
    callApi(
      [DashboardRequestApi.setTimeRequest.historySetTime(farmId)],
      (res) => {
        if (Array.isArray(res) && Array.isArray(res[0])) {
          const times = res[0].map(item => {
            const [hour, minute] = item.time.split(':');
            // Đảm bảo phút được làm tròn đến giá trị gần nhất trong minuteOptions
            const closestMinute = minuteOptions.reduce((prev, curr) =>
              Math.abs(parseInt(curr) - parseInt(minute)) < Math.abs(parseInt(prev) - parseInt(minute)) ? curr : prev
            );
            return { hour, minute: closestMinute };
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

  // Thêm một mục thời gian mới
  const handleAddTimeField = () => {
    setTimeFields([...timeFields, { hour: "00", minute: "00" }]);
    // Cuộn đến mục mới sau khi danh sách được cập nhật
    setTimeout(() => {
      if (lastTimeFieldRef.current) {
        lastTimeFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  // Xóa một mục thời gian
  const handleRemoveTimeField = (index) => {
    const newTimeFields = timeFields.filter((_, i) => i !== index);
    setTimeFields(newTimeFields);
  };

  // Thay đổi giờ hoặc phút
  const handleTimeChange = (index, field, value) => {
    const newTimeFields = [...timeFields];
    newTimeFields[index][field] = value;
    setTimeFields(newTimeFields);
  };

  // Gửi dữ liệu lên API
  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeFields.length === 0) {
      setErrorMessage('Vui lòng thêm ít nhất một thời gian!');
      return;
    }

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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-teal-100 to-gray-100/40 backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-teal-200 transform transition-all duration-300 hover:shadow-2xl">
        <button
          onClick={() => setIsSetTime(false)}
          className="absolute top-3 right-3 p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full transition-all duration-200"
          aria-label="Đóng modal"
        >
          <IoCloseSharp className="w-5 h-5" />
        </button>

        <header className="text-2xl sm:text-3xl font-bold text-center text-teal-700 mb-6 tracking-tight">
          Thiết Lập Thời Gian Đo
        </header>

        <form onSubmit={handleSubmit}>
          {/* Danh sách thời gian kiểu to-do list */}
          <div className="max-h-64 overflow-y-auto mb-6 space-y-3 pr-2">
            {timeFields.length === 0 ? (
              <p className="text-center text-gray-500">Chưa có thời gian nào được thiết lập.</p>
            ) : (
              timeFields.map((time, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-teal-50 rounded-lg shadow-sm hover:bg-teal-100 transition-all duration-200"
                  ref={index === timeFields.length - 1 ? lastTimeFieldRef : null} // Gán ref cho mục cuối cùng
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-teal-800">Thời gian {index + 1}</span>
                    <select
                      value={time.hour}
                      onChange={(e) => handleTimeChange(index, 'hour', e.target.value)}
                      className="p-2 border border-teal-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                    >
                      {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <span className="text-teal-700 font-medium">:</span>
                    <select
                      value={time.minute}
                      onChange={(e) => handleTimeChange(index, 'minute', e.target.value)}
                      className="p-2 border border-teal-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                    >
                      {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTimeField(index)}
                    className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-200 rounded-full transition-all duration-200"
                  >
                    <FaTrashAlt className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-4 animate-pulse">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddTimeField}
              className="flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 hover:text-teal-800 transition-all duration-200"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Thêm
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