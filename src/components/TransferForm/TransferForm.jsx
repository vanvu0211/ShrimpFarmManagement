import { useState, useRef, useCallback, useEffect } from 'react';
import { IoCalendar, IoDocument } from 'react-icons/io5';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi, HarvestRequest } from '../../services/api';
import InputField from '../InputField';
import SelectField from '../SelectField';
import { useLocation } from 'react-router-dom';
import Loading from '../Loading'
function TransferForm() {
    const [pondId, setPondId] = useState('');
    const [harvestType, setHarvestType] = useState(0);
    const [harvestDate, setHarvestDate] = useState('');
    const [size, setSize] = useState(0);
    const [harvestTime, setHarvestTime] = useState(0);
    const [amount, setAmount] = useState(0);
    const [certificates, setCertificates] = useState([]);
    const [ponds, setPonds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const farmName = localStorage.getItem('farmName') || '';
    const username = localStorage.getItem('username') || '';

    const dateInputRef = useRef(null);
    const callApi = useCallApi();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.pondId) {
            setPondId(location.state.pondId);
            fetchData();
        }
    }, [location.state]);

    const harvestData = useCallback(() => {
        if (!pondId || pondId === '') return;

        callApi(
            [
                HarvestRequest.HarvestRequestApi.getHarvestTime(pondId),
            ],
            (res) => {
                setHarvestTime(res[0].harvestTime + 1);
            },
        );
    }, [callApi, pondId]);

    useEffect(() => {
        harvestData();
    }, [harvestData, pondId]);

    const fetchData = useCallback(() => {
        callApi(
            [
                DashboardRequestApi.pondRequest.getPondRequestByStatus(username, farmName, 1),
            ],
            (res) => {
                if (res && res[0]) {
                    setPonds(res[0]);
                } else {
                    setPonds([]); // Đặt giá trị mặc định là mảng rỗng nếu không có dữ liệu
                }
            },
            (err) => {
                console.error("Lỗi khi lấy dữ liệu ao:", err);
                setPonds([]); // Xử lý lỗi bằng cách đặt giá trị mặc định
            }
        );
        
    }, [callApi]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setErrorMessage('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setCertificates([base64String]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!pondId || !harvestDate || amount <= 0 || size <= 0) {
            setErrorMessage('Vui lòng điền đầy đủ thông tin và đảm bảo giá trị hợp lệ!');
            return;
        }

        const data = {
            harvestType: parseFloat(harvestType),
            harvestDate: new Date(harvestDate).toISOString(),
            amount: parseFloat(amount),
            size: parseFloat(size),
            certificates,
            pondId: pondId.trim(),
        };

        setIsLoading(true);
        callApi(
            () => HarvestRequest.HarvestRequestApi.postHarvest(data),
            (res) => {
                setIsLoading(false);
                setErrorMessage('');
            },
            'Thu hoạch đã được tạo thành công!',
            (err) => {
                setIsLoading(false);
                if (err.response && err.response.data && err.response.data.title) {
                    setErrorMessage(err.response.data.title);
                } else {
                    setErrorMessage('Đã có lỗi xảy ra, vui lòng thử lại!');
                }
            }
        );
    };

    const handleCalendarClick = () => {
        dateInputRef.current.focus();
    };

    const handleInputChangeWithValidation = (setter) => (e) => {
        const value = e.target.value;

        // Chỉ cho phép số thực (có dấu . hoặc , hoặc số âm)
        const regex = /^-?\d*(\.\d*)?$/;
        if (regex.test(value) || value === '') {
            setter(value); // Cập nhật giá trị nếu hợp lệ
            setErrorMessage(''); // Xóa thông báo lỗi
        } else {
            setErrorMessage('Chỉ được nhập số thực!');
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl mx-auto h-[90%] mt-5">
                <h1 className="text-xl font-bold mb-4">Chuyển ao</h1>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <SelectField
                            label="Chọn ao gốc"
                            id="pondId"
                            value={pondId}
                            onChange={handleInputChange(setPondId)}
                            options={[
                                { value: '', label: 'Chọn ao' },
                                ...ponds.map((pond) => ({ value: pond.pondId, label: pond.pondId }))
                            ]}
                        />
                        <SelectField
                            label="Chọn ao chuyển"
                            id="pondId"
                            value={pondId}
                            onChange={handleInputChange(setPondId)}
                            options={[
                                { value: '', label: 'Chọn ao' },
                                ...ponds.map((pond) => ({ value: pond.pondId, label: pond.pondId }))
                            ]}
                        />
                        {/* <InputField
                            label="Lần thu hoạch"
                            id="harvestTime"
                            value={harvestTime}
                            onChange={() => {}}
                            placeholder="Nhập lần thu hoạch"
                            readOnly
                        />
                        <SelectField
                            label="Loại thu hoạch"
                            id="harvestType"
                            value={harvestType}
                            onChange={handleInputChange(setHarvestType)}
                            options={[
                                { value: 0, label: 'Thu tỉa' },
                                { value: 1, label: 'Thu toàn bộ' }
                            ]}
                        /> */}
                        <div className="relative">
                            <label htmlFor="harvestDate" className="block text-gray-700">
                                Ngày chuyển ao:
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="date"
                                    id="harvestDate"
                                    ref={dateInputRef}
                                    value={harvestDate}
                                    onChange={handleInputChange(setHarvestDate)}
                                    className="block w-full pl-3 text-xl pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                                <span
                                    className="absolute right-3 text-2xl text-gray-500 cursor-pointer"
                                    onClick={handleCalendarClick}
                                >
                                    <IoCalendar />
                                </span>
                            </div>
                        </div>
                        {/* <InputField
                            label="Size tôm (cm)"
                            id="size"
                            type="text"
                            value={size}
                            onChange={handleInputChangeWithValidation(setSize)}
                            placeholder="Nhập kích cỡ tôm"
                        />
                        <InputField
                            label="Sinh khối lúc thu hoạch"
                            id="amount"
                            type="text"
                            value={amount}
                            onChange={handleInputChangeWithValidation(setAmount)}
                            placeholder="Nhập sinh khối thu hoạch"
                        /> */}
                    </div>

                    {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <label htmlFor="certificates" className="block text-gray-700">
                                Giấy xét nghiệm kháng sinh:
                            </label>
                            <input
                                type="file"
                                id="certificates"
                                onChange={handleFileChange}
                                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div> */}

                    {errorMessage && (
                        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
                    )}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className={cl('bg-green-500 hover:bg-green-600 text-xl font-medium text-white py-2 px-6 rounded-md', {
                                'opacity-50 cursor-not-allowed': isLoading
                            })}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
            {isLoading && <Loading/>}
        </>
    );
}

export default TransferForm;
