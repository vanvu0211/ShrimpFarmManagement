import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi, EvistaRequestApi } from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading';
import { useLocation } from 'react-router-dom';

function Nh3No2Field() {
    const [formData, setFormData] = useState({
        pondId: '',
        name: '',
        value: '',
        timestamp: '',
    });
    const [pondOptions, setPondOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const farmId = Number(localStorage.getItem('farmId'));
    const dateInputRef = useRef(null);
    const callApi = useCallApi();
    const location = useLocation();

    // Initialize form with location state
    useEffect(() => {
        if (location.state?.pondId) {
            setFormData((prev) => ({ ...prev, pondId: location.state.pondId }));
            fetchPondOptions();
        }
    }, [location.state]);

    // Fetch pond options
    const fetchPondOptions = useCallback(() => {
        callApi(
            [DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 1)],
            (res) => {
                const ponds = res[0] || [];
                setPondOptions(ponds.map((pond) => ({
                    value: pond.pondId,
                    label: pond.pondName,
                })));
            },
            null,
            (err) => {
                console.error('Error fetching ponds:', err);
                setPondOptions([]);
            }
        );
    }, [callApi, farmId]);

    useEffect(() => {
        fetchPondOptions();
    }, [fetchPondOptions]);

    // Handle input changes
    const handleInputChange = useCallback((field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        setErrorMessage('');
    }, []);

    const handleNumericChange = useCallback((field) => (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrorMessage('');
        }
    }, []);

    // Form validation
    const isFormValid = useCallback(() => {
        const { pondId, name, value, timestamp } = formData;
        return pondId && name && parseFloat(value) >= 0 && timestamp;
    }, [formData]);

    // Handle form submission
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            if (!isFormValid()) {
                setErrorMessage('Vui lòng điền đầy đủ và đúng thông tin!');
                toast.error('Vui lòng điền đầy đủ và đúng thông tin!');
                return;
            }

            setIsLoading(true);
            const submitData = {
                pondId: formData.pondId.trim(),
                name: formData.name,
                value: formData.value,
                timestamp: new Date(formData.timestamp).toISOString(),
            };

            callApi(
                [EvistaRequestApi.TemperatureRequest.createRequest(submitData)],
                () => {
                    setIsLoading(false);
                    toast.success('Cập nhật dữ liệu thành công!');
                    setFormData({ pondId: '', name: '', value: '', timestamp: '' });
                    setErrorMessage('');
                },
                (err) => {
                    setIsLoading(false);
                    toast.error(err?.response?.data?.title || 'Lỗi, vui lòng thử lại!');
                    setErrorMessage(err?.response?.data?.title || 'Lỗi, vui lòng thử lại!');
                }
            );
        },
        [formData, callApi, isFormValid]
    );

    return (
        <div className="bg-white p-4 rounded-lg ">
            {/* <h1 className="text-xl font-bold text-teal-700 mb-4">Cập nhật NH3/NO2</h1> */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-teal-800 font-medium mb-1" htmlFor="pondId">
                        Chọn ao
                    </label>
                    <select
                        id="pondId"
                        value={formData.pondId}
                        onChange={handleInputChange('pondId')}
                        disabled={isLoading}
                        required
                        className="w-full p-2 border border-teal-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-teal-50 text-sm"
                    >
                        <option value="">Chọn ao</option>
                        {pondOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-teal-800 font-medium mb-1" htmlFor="name">
                        Loại dữ liệu
                    </label>
                    <select
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        disabled={isLoading}
                        required
                        className="w-full p-2 border border-teal-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-teal-50 text-sm"
                    >
                        <option value="">Chọn loại</option>
                        <option value="NH3">NH3</option>
                        <option value="NO2">NO2</option>
                    </select>
                </div>

                <div>
                    <label className="block text-teal-800 font-medium mb-1" htmlFor="value">
                        Giá trị (mg/L)
                    </label>
                    <input
                        id="value"
                        type="text"
                        value={formData.value}
                        onChange={handleNumericChange('value')}
                        placeholder="Nhập giá trị"
                        disabled={isLoading}
                        required
                        className="w-full p-2 border border-teal-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-teal-50 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-teal-800 font-medium mb-1" htmlFor="timestamp">
                        Ngày giờ đo
                    </label>
                    <input
                        type="datetime-local"
                        id="timestamp"
                        ref={dateInputRef}
                        value={formData.timestamp}
                        onChange={handleInputChange('timestamp')}
                        disabled={isLoading}
                        required
                        className="w-full p-2 border border-teal-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-teal-50 text-sm"
                    />
                </div>

                {errorMessage && (
                    <p className="text-red-600 text-center text-sm">{errorMessage}</p>
                )}

                <button
                    type="submit"
                    className={cl(
                        'w-full py-2 bg-teal-600 text-white rounded-md transition-all duration-200',
                        {
                            'opacity-50 cursor-not-allowed': isLoading || !isFormValid(),
                            'hover:bg-teal-700': !isLoading && isFormValid(),
                        }
                    )}
                    disabled={isLoading || !isFormValid()}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Đang xử lý...
                        </span>
                    ) : (
                        'Lưu'
                    )}
                </button>
            </form>

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

export default memo(Nh3No2Field);