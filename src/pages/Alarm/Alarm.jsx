import React, { useState, useRef, useCallback, memo } from 'react';
import { IoCalendar } from 'react-icons/io5';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { AlarmRequestApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading';

function Alarm() {
    const [alarms, setAlarms] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Khởi tạo giá trị ban đầu là 1
    const [pageSize] = useState(20);
    const [totalAlarms, setTotalAlarms] = useState(0);
    const farmId = Number(localStorage.getItem('farmId'));
    const dateStartInputRef = useRef(null);
    const dateEndInputRef = useRef(null);
    const callApi = useCallApi();

    // Tính tổng số trang
    const totalPages = Math.ceil(totalAlarms / pageSize) || 1; // Đảm bảo totalPages ít nhất là 1

    // Tính chỉ số bắt đầu của mục trên trang hiện tại
    const startIndex = (currentPage - 1) * pageSize + 1;

    // Fetch alarm data
    const fetchAlarms = useCallback((page = currentPage) => { // Thêm tham số page mặc định là currentPage
        if (!startDate || !endDate) {
            if (!isLoading) {
                toast.error('Vui lòng chọn khoảng thời gian để truy xuất dữ liệu!');
            }
            return;
        }

        setIsLoading(true);
        callApi(
            [AlarmRequestApi.alarmRequest.getAllAlarmByFarmId(farmId, startDate, endDate, pageSize, page)],
            (res) => {
                const responseData = res[0] || {};
                const alarmData = responseData.data || [];
                const totalCount = responseData.totalCount || 0;
                setAlarms(alarmData);
                setTotalAlarms(totalCount);
                setIsLoading(false);
                toast.success('Dữ liệu cảnh báo đã được tải thành công!');
            },
            null,
            (err) => {
                console.error('Error fetching alarms:', err);
                setIsLoading(false);
                toast.error('Không thể tải dữ liệu cảnh báo: ' + (err?.response?.data?.title || 'Thử lại sau!'));
            }
        );
    }, [callApi, farmId, startDate, endDate, pageSize]);

    // Handle date input changes
    const handleDateChange = useCallback((field) => (e) => {
        const value = e.target.value;
        if (field === 'startDate') {
            setStartDate(value);
            setCurrentPage(1);
        } else {
            setEndDate(value);
            setCurrentPage(1);
        }
    }, []);

    // Handle calendar icon click
    const handleCalendarClick = useCallback((field) => () => {
        if (field === 'startDate') {
            dateStartInputRef.current?.focus();
        } else {
            dateEndInputRef.current?.focus();
        }
    }, []);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchAlarms(newPage); // Truyền trực tiếp newPage vào fetchAlarms
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div className="flex max-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
            <aside>
                <Sidebar />
            </aside>

            <main className="w-full mt-16 sm:mt-0 mx-auto max-w-6xl overflow-y-auto overflow-hidden no-scrollbar p-4 sm:p-6 lg:p-8 transition-all duration-300">
                <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 sm:mb-8">
                    Danh sách cảnh báo
                </h1>

                {/* Datepicker Section */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="mb-4 sm:mb-6 relative">
                            <label className="block text-teal-800 font-semibold mb-2" htmlFor="startDate">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                ref={dateStartInputRef}
                                value={startDate}
                                onChange={handleDateChange('startDate')}
                                disabled={isLoading}
                                required
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                            />
                            <IoCalendar
                                className="absolute right-4 top-[60%] transform -translate-y-1/2 text-teal-500 cursor-pointer hover:text-teal-700 transition-all duration-200"
                                onClick={handleCalendarClick('startDate')}
                            />
                        </div>

                        <div className="mb-4 sm:mb-6 relative">
                            <label className="block text-teal-800 font-semibold mb-2" htmlFor="endDate">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                ref={dateEndInputRef}
                                value={endDate}
                                onChange={handleDateChange('endDate')}
                                disabled={isLoading}
                                required
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                            />
                            <IoCalendar
                                className="absolute right-4 top-[60%] transform -translate-y-1/2 text-teal-500 cursor-pointer hover:text-teal-700 transition-all duration-200"
                                onClick={handleCalendarClick('endDate')}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => fetchAlarms(currentPage)} // Gọi fetchAlarms với currentPage hiện tại
                            className={cl(
                                'w-full sm:w-auto px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300',
                                {
                                    'opacity-50 cursor-not-allowed': isLoading || !startDate || !endDate,
                                    'hover:bg-teal-700 hover:shadow-lg': !isLoading && startDate && endDate,
                                }
                            )}
                            disabled={isLoading || !startDate || !endDate}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Đang tải...
                                </span>
                            ) : (
                                'Tải dữ liệu'
                            )}
                        </button>
                    </div>
                </div>

                {/* Alarm List */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <h2 className="text-xl sm:text-2xl font-semibold text-teal-700 mb-4 sm:mb-6">
                        Danh sách cảnh báo
                    </h2>
                    {alarms.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {alarms.map((alarm, index) => (
                                    <div
                                        key={alarm.alarmId}
                                        className="p-4 border border-teal-200 rounded-lg bg-teal-50 hover:bg-teal-100 transition-all duration-200 flex items-start"
                                    >
                                        <span className="text-teal-800 font-semibold mr-4">
                                            {startIndex + index}.
                                        </span>
                                        <div>
                                            <p className="text-teal-800 font-semibold">
                                                {alarm.alarmName}
                                            </p>
                                            <p className="text-gray-700">
                                                {alarm.alarmDetail}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Thời gian: {formatDate(alarm.alarmDate)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="mt-6 flex justify-between items-center">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                    className={cl(
                                        'px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300',
                                        {
                                            'opacity-50 cursor-not-allowed': currentPage === 1 || isLoading,
                                            'hover:bg-teal-700 hover:shadow-lg': currentPage > 1 && !isLoading,
                                        }
                                    )}
                                >
                                    Trang trước
                                </button>
                                <span className="text-teal-700">
                                    Trang {currentPage} / {totalPages} ({startIndex} - {Math.min(startIndex + pageSize - 1, totalAlarms)} / {totalAlarms} mục)
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                    className={cl(
                                        'px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300',
                                        {
                                            'opacity-50 cursor-not-allowed': currentPage === totalPages || isLoading,
                                            'hover:bg-teal-700 hover:shadow-lg': currentPage < totalPages && !isLoading,
                                        }
                                    )}
                                >
                                    Trang sau
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-teal-700 text-center text-sm sm:text-base">
                            Chưa có dữ liệu cảnh báo. Vui lòng chọn khoảng thời gian và tải dữ liệu.
                        </p>
                    )}
                </div>
            </main>

            {isLoading && <Loading />}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
            />
        </div>
    );
}

export default memo(Alarm);