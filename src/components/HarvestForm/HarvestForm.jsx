import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { IoCalendar } from 'react-icons/io5';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi, HarvestRequest } from '../../services/api';
import InputField from '../InputField';
import SelectField from '../SelectField';
import { useLocation } from 'react-router-dom';
import Loading from '../Loading';
import PropTypes from 'prop-types';

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

  const farmName = localStorage.getItem('farmName') || '';
  const username = localStorage.getItem('username') || '';
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
        console.log(res);
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
      [DashboardRequestApi.pondRequest.getPondRequestByStatus(username, farmName, 1)],
      (res) => {
        const ponds = res[0] || [];
        setPondOptions(ponds.map((pond) => ({
          value: pond.pondId,
          label: pond.pondId,
        })));
      },
      null,
      (err) => {
        console.error('Error fetching ponds:', err);
        setPondOptions([]);
      }
    );
  }, [callApi, username, farmName]);

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
  const handleSubmit = useCallback((e) => {
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
    };

    callApi(
      () => HarvestRequest.HarvestRequestApi.postHarvest(submitData),
      () => {
        setIsLoading(false);
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
      'Thu hoạch đã được tạo thành công!',
      (err) => {
        setIsLoading(false);
        setErrorMessage(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
      }
    );
  }, [formData, certificates, callApi, isFormValid]);

  const handleCalendarClick = useCallback(() => dateInputRef.current?.focus(), []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto mt-6">
    <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Thu hoạch</h1>
  
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField
          label="Chọn ao"
          id="pondId"
          value={formData.pondId}
          onChange={handleInputChange('pondId')}
          options={[{ value: '', label: 'Chọn ao' }, ...pondOptions]}
          disabled={isLoading}
          required
        />
        <SelectField
          label="Loại thu hoạch"
          id="harvestType"
          value={formData.harvestType}
          onChange={handleInputChange('harvestType')}
          options={[
            { value: '0', label: 'Thu tỉa' },
            { value: '1', label: 'Thu toàn bộ' },
          ]}
          disabled={isLoading}
          required
        />
        <InputField
          label="Lần thu hoạch"
          id="harvestTime"
          value={formData.harvestTime}
          readOnly
          disabled
          placeholder="Số lần thu hoạch"
          className="text-lg"
        />
        <div className="relative">
          <label htmlFor="harvestDate" className="block text-base font-medium text-gray-700 mb-2">
            Ngày thu hoạch
          </label>
          <div className="relative">
            <input
              type="date"
              id="harvestDate"
              ref={dateInputRef}
              value={formData.harvestDate}
              onChange={handleInputChange('harvestDate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-lg"
              disabled={isLoading}
              required
            />
            {/* <IoCalendar
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={handleCalendarClick}
            /> */}
          </div>
        </div>
        <InputField
          label="Size tôm (cm)"
          id="size"
          type="text"
          value={formData.size}
          onChange={handleNumericChange('size')}
          placeholder="Nhập size tôm"
          disabled={isLoading}
          required
          className="text-lg"
        />
        <InputField
          label="Sinh khối (kg)"
          id="amount"
          type="text"
          value={formData.amount}
          onChange={handleNumericChange('amount')}
          placeholder="Nhập sinh khối"
          disabled={isLoading}
          required
          className="text-lg"
        />
      </div>
  
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="certificates" className="block text-base font-medium text-gray-700 mb-2">
            Giấy chứng nhận
          </label>
          <input
            type="file"
            id="certificates"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-lg"
            disabled={isLoading}
          />
        </div>
      </div>
  
      {errorMessage && (
        <p className="text-red-600 text-center text-lg animate-shake">{errorMessage}</p>
      )}
  
      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className={cl(
            'px-8 py-3 bg-green-600 text-white font-medium text-lg rounded-md shadow-sm transition-all',
            { 'opacity-50 cursor-not-allowed': isLoading || !isFormValid() }
          )}
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
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

HarvestForm.propTypes = {
  // Không cần props ở đây vì component không nhận props từ bên ngoài
};

export default memo(HarvestForm);