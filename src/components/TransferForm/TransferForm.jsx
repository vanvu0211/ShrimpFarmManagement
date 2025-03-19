import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { IoCalendar } from 'react-icons/io5';
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi, HarvestRequest } from '../../services/api';
import InputField from '../InputField';
import SelectField from '../SelectField';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import TransferRequest from '../../services/api/Transfer/TransferRequestApi';

const TransferForm = () => {
  const [formData, setFormData] = useState({
    transferPondId: '',
    originPondId: '',
    transferDate: '',
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

  // Initialize form with location state
  useEffect(() => {
    if (location.state?.pondId) {
      setFormData((prev) => ({ ...prev, originPondId: location.state.pondId }));
      fetchOriginPondOptions();
    }
  }, [location.state]);

  // Fetch harvest time
  const fetchHarvestTime = useCallback(() => {
    if (!formData.transferPondId) return;

    callApi(
      [HarvestRequest.HarvestRequestApi.getHarvestTime(formData.transferPondId)],
      (res) => {
        console.log(res);
        setFormData((prev) => ({ ...prev, harvestTime: String(res[0].harvestTime + 1) }));
      },
      null,
      (err) => console.error('Error fetching harvest time:', err)
    );
  }, [callApi, formData.transferPondId]);

  useEffect(() => {
    fetchHarvestTime();
  }, [fetchHarvestTime]);

  // Fetch origin pond options
  const fetchOriginPondOptions = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 1)],
      (res) => {
        const ponds = res[0] || [];
        setOriginPondOptions(ponds.map((pond) => ({
          value: pond.pondId,
          label: pond.pondName,
        })));
      },
      null,
      (err) => {
        console.error('Error fetching origin ponds:', err);
        setOriginPondOptions([]);
      }
    );
  }, [callApi, farmId]);

  // Fetch pond options (filtered based on originPondId)
  const fetchTransferPondOptions = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId,0)],
      (res) => {
        const ponds = res[0] || [];
        const filteredPonds = ponds.filter(
          (pond) => pond.transferPondId !== formData.originPondId // Loại bỏ ao đã chọn trong originPondId
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
        console.error('Error fetching ponds:', err);
        setTransferPondOptions([]);
      }
    );
  }, [callApi, farmId, formData.originPondId]);

  // Fetch initial originTransferPondOptions and update TransferPondOptions when originPondId changes
  useEffect(() => {
    fetchOriginPondOptions();
  }, [fetchOriginPondOptions]);

  useEffect(() => {
    if (formData.originPondId) {
      fetchTransferPondOptions(); // Gọi lại fetchPondOptions khi originPondId thay đổi
    }
  }, [formData.originPondId, fetchTransferPondOptions]);

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
    const { transferPondId, originPondId, transferDate, size, amount } = formData;
    return transferPondId && originPondId && transferDate && parseFloat(size) > 0 && parseFloat(amount) > 0;
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
      transferDate: new Date(formData.transferDate).toISOString(),
      amount: parseFloat(formData.amount),
      size: parseFloat(formData.size),
      transferPondId: formData.transferPondId.trim(),
      originPondId: formData.originPondId.trim(),
    };

    callApi(
      () => TransferRequest.TransferRequestApi.postTransfer(submitData),
      () => {
        setIsLoading(false);
        setFormData({
          transferPondId: '',
          originPondId: '',
          transferDate: '',
          size: '',
          amount: '',
          
        });
        setCertificates([]);
        setErrorMessage('');
      },
      'Chuyển ao đã được tạo thành công!',
      (err) => {
        setIsLoading(false);
        setErrorMessage(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
      }
    );
  }, [formData, certificates, callApi, isFormValid]);

  const handleCalendarClick = useCallback(() => dateInputRef.current?.focus(), []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl mx-auto mt-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Chuyển ao</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Chọn ao"
            id="originPondId"
            value={formData.originPondId}
            onChange={handleInputChange('originPondId')}
            options={[{ value: '', label: 'Chọn ao' }, ...originPondOptions]}
            disabled={isLoading}
            required
          />
          <SelectField
            label="Chọn ao chuyển đến"
            id="transferPondId"
            value={formData.transferPondId}
            onChange={handleInputChange('transferPondId')}
            options={[{ value: '', label: 'Chọn ao' }, ...  transferPondOptions]}
            disabled={isLoading || !formData.originPondId} // Vô hiệu hóa nếu chưa chọn ao gốc
            required
          />
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
          <div className="relative">
            <label htmlFor="transferDate" className="block text-base font-medium text-gray-700 mb-2">
              Ngày chuyển ao
            </label>
            <div className="relative">
              <input
                type="date"
                id="transferDate"
                ref={dateInputRef}
                value={formData.transferDate}
                onChange={handleInputChange('transferDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-lg"
                disabled={isLoading}
                required
              />
            </div>
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

TransferForm.propTypes = {};

export default memo(TransferForm);