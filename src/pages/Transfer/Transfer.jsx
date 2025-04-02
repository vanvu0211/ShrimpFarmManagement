import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { IoCalendar } from 'react-icons/io5';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi, HarvestRequest } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading';
import { useLocation } from 'react-router-dom';
import TransferRequest from '../../services/api/Transfer/TransferRequestApi';
import imageCompression from 'browser-image-compression';

const Transfer = () => {
    const [formData, setFormData] = useState({
        transferPondId: '',
        originPondId: '',
        transferDate: new Date().toISOString().split('T')[0], // Khởi tạo ngày hiện tại
        size: '',
        amount: '',
    });
    const [certificates, setCertificates] = useState([]);
    const [transferPondOptions, setTransferPondOptions] = useState([]);
    const [originPondOptions, setOriginPondOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const farmId = Number(localStorage.getItem('farmId'));
    const farmName = localStorage.getItem('farmName') || '';
    const username = localStorage.getItem('username') || '';
    const dateInputRef = useRef(null);
    const callApi = useCallApi();
    const location = useLocation();

    // Fetch origin pond options
    const fetchOriginPondOptions = useCallback(() => {
        callApi(
            [DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 1)],
            (res) => {
                const ponds = res[0] || [];
                setOriginPondOptions(
                    ponds.map((pond) => ({
                        value: pond.pondId,
                        label: pond.pondName,
                    }))
                );
            },
            null,
            (err) => {
                console.error('Error fetching origin ponds:', err);
                setOriginPondOptions([]);
            }
        );
    }, [callApi, farmId]);

    // Fetch transfer pond options
    const fetchTransferPondOptions = useCallback(() => {
        callApi(
            [DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 0)],
            (res) => {
                const ponds = res[0] || [];
                const filteredPonds = ponds.filter(
                    (pond) => pond.pondId !== formData.originPondId
                );
                setTransferPondOptions(
                    filteredPonds.map((pond) => ({
                        value: pond.pondId,
                        label: pond.pondName,
                    }))
                );
            },
            null,
            (err) => {
                console.error('Error fetching transfer ponds:', err);
                setTransferPondOptions([]);
            }
        );
    }, [callApi, farmId, formData.originPondId]);

    useEffect(() => {
        fetchOriginPondOptions();
    }, [fetchOriginPondOptions]);

    useEffect(() => {
        if (formData.originPondId) {
            fetchTransferPondOptions();
        }
    }, [formData.originPondId, fetchTransferPondOptions]);

    // Handle input changes
    const handleInputChange = useCallback(
        (field) => (e) => {
            setFormData((prev) => ({ ...prev, [field]: e.target.value }));
            setErrorMessage('');
        },
        []
    );

    const handleNumericChange = useCallback(
        (field) => (e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value) || value === '') {
                setFormData((prev) => ({ ...prev, [field]: value }));
                setErrorMessage('');
            }
        },
        []
    );

    // Handle file upload với kiểm tra và nén ảnh
    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra loại file (chỉ chấp nhận ảnh)
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận file ảnh (JPEG, PNG)!');
            e.target.value = '';
            return;
        }

        // Kiểm tra kích thước file (300KB = 300 * 1024 bytes)
        const maxSizeBeforeCompression = 300 * 1024; // 300KB
        if (file.size > maxSizeBeforeCompression) {
            try {
                // Cấu hình nén ảnh xuống khoảng 300KB
                const options = {
                    maxSizeMB: 0.3, // Giới hạn kích thước tối đa sau nén là 300KB (0.3MB)
                    maxWidthOrHeight: 1920, // Giữ độ phân giải cao để chất lượng không giảm quá nhiều
                    useWebWorker: true, // Tăng hiệu suất bằng web worker
                    initialQuality: 0.9, // Chất lượng ban đầu cao (0-1)
                };

                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setCertificates([reader.result.split(',')[1]]);
                    toast.success(`Ảnh đã được nén thành công xuống ~300KB! (Kích thước gốc: ${(file.size / 1024).toFixed(2)}KB)`);
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                toast.error('Lỗi khi nén ảnh: ' + error.message);
                e.target.value = '';
            }
        } else {
            // Nếu ảnh nhỏ hơn 300KB, không nén
            const reader = new FileReader();
            reader.onloadend = () => {
                setCertificates([reader.result.split(',')[1]]);
                toast.success('Ảnh đã được chọn thành công!');
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // Form validation
    const isFormValid = useCallback(() => {
        const { transferPondId, originPondId, transferDate, size, amount } = formData;
        return (
            transferPondId &&
            originPondId &&
            transferDate &&
            parseFloat(size) > 0 &&
            parseFloat(amount) > 0
        );
    }, [formData]);

    // Handle form submission
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();

            if (!isFormValid()) {
                setErrorMessage('Vui lòng điền đầy đủ thông tin và đảm bảo giá trị hợp lệ!');
                toast.error('Vui lòng điền đầy đủ thông tin và đảm bảo giá trị hợp lệ!');
                return;
            }

            setIsLoadin(true);
            const submitData = {
                transferDate: new Date(formData.transferDate).toISOString(),
                amount: parseFloat(formData.amount),
                size: parseFloat(formData.size),
                transferPondId: formData.transferPondId.trim(),
                originPondId: formData.originPondId.trim(),
            };

            callApi(
                [TransferRequest.TransferRequestApi.postTransfer(submitData)],
                () => {
                    setIsLoading(false);
                    toast.success('Chuyển ao đã được tạo thành công!');
                    const today = new Date().toISOString().split('T')[0]; // Ngày hiện tại
                    setFormData({
                        transferPondId: '',
                        originPondId: '',
                        transferDate: today, // Reset về ngày hiện tại
                        size: '',
                        amount: '',
                    });
                    setCertificates([]);
                    setErrorMessage('');
                },
                (err) => {
                    setIsLoading(false);
                    toast.error(
                        err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!'
                    );
                    setErrorMessage(
                        err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!'
                    );
                }
            );
        },
        [formData, certificates, callApi, isFormValid]
    );

    const handleCalendarClick = useCallback(() => dateInputRef.current?.focus(), []);

    // Initialize form with location state and current date
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (location.state?.pondId) {
            setFormData((prev) => ({
                ...prev,
                originPondId: location.state.pondId,
                transferDate: today,
            }));
            fetchOriginPondOptions();
        } else {
            setFormData((prev) => ({
                ...prev,
                transferDate: today,
            }));
            fetchOriginPondOptions();
        }
    }, [location.state, fetchOriginPondOptions]);

    return (
        <div className="flex max-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
            {/* Sidebar */}
            <aside>
                <Sidebar />
            </aside>

            <main className="w-full mt-16 sm:mt-0 mx-auto max-w-6xl overflow-y-auto overflow-hidden no-scrollbar p-4 sm:p-6 lg:p-8 transition-all duration-300">
                <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 sm:mb-8">
                    Chuyển ao
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="mb-4 sm:mb-6">
                            <label
                                className="block text-teal-800 font-semibold mb-2"
                                htmlFor="originPondId"
                            >
                                Chọn ao gốc
                            </label>
                            <select
                                id="originPondId"
                                value={formData.originPondId}
                                onChange={handleInputChange('originPondId')}
                                disabled={isLoading}
                                required
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                            >
                                <option value="">Chọn ao</option>
                                {originPondOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4 sm:mb-6">
                            <label
                                className="block text-teal-800 font-semibold mb-2"
                                htmlFor="transferPondId"
                            >
                                Chọn ao chuyển đến
                            </label>
                            <select
                                id="transferPondId"
                                value={formData.transferPondId}
                                onChange={handleInputChange('transferPondId')}
                                disabled={isLoading || !formData.originPondId}
                                required
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                            >
                                <option value="">Chọn ao</option>
                                {transferPondOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="mb-4 sm:mb-6">
                            <label
                                className="block text-teal-800 font-semibold mb-2"
                                htmlFor="amount"
                            >
                                Sinh khối (kg)
                            </label>
                            <input
                                id="amount"
                                type="text"
                                value={formData.amount}
                                onChange={handleNumericChange('amount')}
                                placeholder="Nhập sinh khối"
                                disabled={isLoading}
                                required
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                            />
                        </div>
                        <div className="mb-4 sm:mb-6">
                            <label
                                className="block text-teal-800 font-semibold mb-2"
                                htmlFor="size"
                            >
                                Size tôm (cm)
                            </label>
                            <input
                                id="size"
                                type="text"
                                value={formData.size}
                                onChange={handleNumericChange('size')}
                                placeholder="Nhập size tôm"
                                disabled={isLoading}
                                required
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
                        <div className="mb-4 sm:mb-6 relative">
                            <label
                                className="block text-teal-800 font-semibold mb-2"
                                htmlFor="transferDate"
                            >
                                Ngày chuyển ao
                            </label>
                            <input
                                type="date"
                                id="transferDate"
                                ref={dateInputRef}
                                value={formData.transferDate}
                                onChange={handleInputChange('transferDate')}
                                disabled={isLoading}
                                required
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
                        <div className="mb-4 sm:mb-6">
                            <label
                                className="block text-teal-800 font-semibold mb-2"
                                htmlFor="certificates"
                            >
                                Giấy chứng nhận
                            </label>
                            <input
                                type="file"
                                id="certificates"
                                onChange={handleFileChange}
                                disabled={isLoading}
                                accept="image/jpeg,image/png" // Chỉ chấp nhận ảnh
                                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
                            />
                            <p className="text-gray-600 text-sm mt-1">
                                Ảnh lớn hơn 300KB sẽ được nén xuống ~300KB. Định dạng: JPEG, PNG.
                            </p>
                        </div>
                    </div>

                    {errorMessage && (
                        <p className="text-red-600 text-center text-sm sm:text-base animate-bounce">
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className={cl(
                                'w-full sm:w-auto px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300',
                                {
                                    'opacity-50 cursor-not-allowed': isLoading || !isFormValid(),
                                    'hover:bg-teal-700 hover:shadow-lg': !isLoading && isFormValid(),
                                }
                            )}
                            disabled={isLoading || !isFormValid()}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                'Lưu'
                            )}
                        </button>
                    </div>
                </form>
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
};

export default memo(Transfer);