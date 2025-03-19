import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { IoCalendar } from 'react-icons/io5';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi, HarvestRequest } from '../../services/api';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const HarvestForm = () => {
  const [formData, setFormData] = useState({
    pondId: '',
    harvestType: '0',
    harvestDate: '',
    size: '',
    harvestTime: '',
    amount: '',
  });
  const [certificates, setCertificates] = useState([]);
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

  // Fetch harvest time
  const fetchHarvestTime = useCallback(() => {
    if (!formData.pondId) return;

    callApi(
      [HarvestRequest.HarvestRequestApi.getHarvestTime(formData.pondId)],
      (res) => {
        setFormData((prev) => ({ ...prev, harvestTime: String(res[0].harvestTime + 1) }));
      },
      null,
      (err) => console.error('Error fetching harvest time:', err)
    );
  }, [callApi, formData.pondId]);

  useEffect(() => {
    fetchHarvestTime();
  }, [fetchHarvestTime]);

  // Fetch pond options
  const fetchPondOptions = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 1)],
      (res) => {
        const ponds = res[0] || [];
        setPondOptions(
          ponds.map((pond) => ({
            value: pond.pondId,
            label: pond.pondName,
          }))
        );
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

  // Handle file upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCertificates([reader.result.split(',')[1]]);
    reader.readAsDataURL(file);
  }, []);

  // Form validation
  const isFormValid = useCallback(() => {
    const { pondId, harvestDate, size, amount } = formData;
    return pondId && harvestDate && parseFloat(size) > 0 && parseFloat(amount) > 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!isFormValid()) {
        setErrorMessage('Vui lòng điền đầy đủ thông tin và đảm bảo giá trị hợp lệ!');
        return;
      }

      setIsLoading(true);
      const submitData = {
        harvestType: parseFloat(formData.harvestType),
        harvestDate: new Date(formData.harvestDate).toISOString(),
        amount: parseFloat(formData.amount),
        size: parseFloat(formData.size),
        certificates,
        pondId: formData.pondId.trim(),
        farmId: farmId,
      };

      callApi(
        [HarvestRequest.HarvestRequestApi.postHarvest(submitData)],
        () => {
          setIsLoading(false);
          toast.success('Thu hoạch đã được tạo thành công!');
          setFormData({
            pondId: '',
            harvestType: '0',
            harvestDate: '',
            size: '',
            harvestTime: '',
            amount: '',
          });
          setCertificates([]);
          setErrorMessage('');
        },
        (err) => {
          setIsLoading(false);
          setErrorMessage(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
          toast.error('Đã có lỗi xảy ra khi tạo thu hoạch!');
        }
      );
    },
    [formData, certificates, callApi, isFormValid]
  );

  const handleCalendarClick = useCallback(() => dateInputRef.current?.focus(), []);

  return (
    <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <h2 className="text-lg sm:text-xl font-bold text-teal-700 mb-4 sm:mb-6">
        Thêm thông tin thu hoạch
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="pondId">
              Chọn ao
            </label>
            <select
              id="pondId"
              value={formData.pondId}
              onChange={handleInputChange('pondId')}
              disabled={isLoading}
              required
              className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
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
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="harvestType">
              Loại thu hoạch
            </label>
            <select
              id="harvestType"
              value={formData.harvestType}
              onChange={handleInputChange('harvestType')}
              disabled={isLoading}
              required
              className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
            >
              <option value="0">Thu tỉa</option>
              <option value="1">Thu toàn bộ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="harvestTime">
              Lần thu hoạch
            </label>
            <div className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg bg-teal-100 text-teal-700 text-sm sm:text-base cursor-not-allowed">
              {formData.harvestTime || 'Chưa có dữ liệu'}
            </div>
          </div>
          <div className="relative">
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="harvestDate">
              Ngày thu hoạch
            </label>
            <input
              type="date"
              id="harvestDate"
              ref={dateInputRef}
              value={formData.harvestDate}
              onChange={handleInputChange('harvestDate')}
              disabled={isLoading}
              required
              className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
            />
            <IoCalendar
              className="absolute right-4 top-[60%] transform -translate-y-1/2 text-teal-500 cursor-pointer hover:text-teal-700 transition-all duration-200"
              onClick={handleCalendarClick}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="size">
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
          <div>
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="amount">
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
        </div>

        <div>
          <label className="block text-teal-800 font-semibold mb-2" htmlFor="certificates">
            Giấy chứng nhận
          </label>
          <input
            type="file"
            id="certificates"
            onChange={handleFileChange}
            disabled={isLoading}
            className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
          />
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
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              'Lưu'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default memo(HarvestForm);