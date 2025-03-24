import React, { useState, useCallback, memo, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';
import InputField from '../InputField';
import FileInputField from '../FileInputField';
import SelectField from '../SelectField';
import PropTypes from 'prop-types';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';

function ActiveCard({ pondId, setIsActiveModal, onDeleteCardSuccess }) {
  const [formData, setFormData] = useState({
    seedId: '',
    seedName: '',
    originPondId: '',
    sizeShrimp: '0',
    amountShrimp: '0',
  });
  const [certificates, setCertificates] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pondOptions, setPondOptions] = useState([]);
  const callApi = useCallApi();
  const farmId = Number(localStorage.getItem('farmId'));

  // Fetch pond options
  useEffect(() => {
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 1)],
      (res) => {
        const ponds = res[0];
        const options = ponds
          .filter((pond) => pond.pondId !== pondId)
          .map((pond) => ({
            value: pond.pondId,
            label: pond.pondName,
          }));
        setPondOptions([{ value: '', label: 'Không có' }, ...options]);
      },
      null,
      (err) => console.error('Failed to fetch ponds:', err)
    );
  }, [callApi, pondId]);

  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  }, []);

  const handleNumericChange = useCallback((field) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrorMessage('');
    }
  }, []);

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

    // Kiểm tra kích thước file (500KB = 500 * 1024 bytes)
    const maxSizeBeforeCompression = 500 * 1024; // 500KB
    if (file.size > maxSizeBeforeCompression) {
      try {
        // Cấu hình nén ảnh xuống khoảng 500KB
        const options = {
          maxSizeMB: 0.5, // Giới hạn kích thước tối đa sau nén là 500KB (0.5MB)
          maxWidthOrHeight: 1280, // Giảm độ phân giải tối đa để đạt kích thước mong muốn
          useWebWorker: true, // Tăng hiệu suất bằng web worker
        };

        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setCertificates([reader.result.split(',')[1]]);
          toast.success(`Ảnh đã được nén thành công xuống ~500KB! (Kích thước gốc: ${(file.size / 1024).toFixed(2)}KB)`);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        toast.error('Lỗi khi nén ảnh: ' + error.message);
        e.target.value = '';
      }
    } else {
      // Nếu ảnh nhỏ hơn 500KB, không nén
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
    const { seedId, seedName } = formData;
    return seedId.trim() && seedName.trim();
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!isFormValid()) {
        setErrorMessage('Vui lòng điền đầy đủ và đúng định dạng các trường!');
        return;
      }

      setIsLoading(true);
      const submitData = {
        pondId: pondId,
        seedId: formData.seedId.trim(),
        seedName: formData.seedName.trim(),
        originPondId: formData.originPondId || '',
        certificates,
        sizeShrimp: parseFloat(formData.sizeShrimp),
        amountShrimp: parseFloat(formData.amountShrimp),
      };

      callApi(
        [DashboardRequestApi.pondRequest.updatePondRequest(submitData)],
        () => {
          onDeleteCardSuccess();
          setIsActiveModal(false);
        },
        'Kích hoạt ao thành công!',
        (err) => {
          setIsLoading(false);
          setErrorMessage(err?.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
          console.error('Activation Error:', err);
        }
      );
    },
    [formData, certificates, pondId, callApi, onDeleteCardSuccess, setIsActiveModal, isFormValid]
  );

  // Handle modal close
  const handleClose = useCallback(() => {
    setIsActiveModal(false);
  }, [setIsActiveModal]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-200 animate-in fade-in">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
          aria-label="Close modal"
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>

        <header className="text-2xl font-bold text-center text-gray-800 mb-6">
          Kích hoạt Ao
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Mã lô"
              id="seedId"
              value={formData.seedId}
              onChange={handleInputChange('seedId')}
              placeholder="Nhập mã lô"
              disabled={isLoading}
              required
            />
            <InputField
              label="Tên lô"
              id="seedName"
              value={formData.seedName}
              onChange={handleInputChange('seedName')}
              placeholder="Nhập tên lô"
              disabled={isLoading}
              required
            />
          </div>

          <SelectField
            label="Mã Ao gốc"
            id="originPondId"
            value={formData.originPondId}
            onChange={handleInputChange('originPondId')}
            options={pondOptions}
            disabled={isLoading || pondOptions.length === 0}
          />

          <div>
            <FileInputField
              label="Giấy chứng nhận"
              id="certificates"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/jpeg,image/png" // Chỉ chấp nhận ảnh
            />
            <p className="text-gray-600 text-sm mt-1">
              Ảnh lớn hơn 500KB sẽ được nén xuống ~500KB. Định dạng: JPEG, PNG.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Kích thước Tôm (cm)"
              id="sizeShrimp"
              type="text"
              value={formData.sizeShrimp}
              onChange={handleNumericChange('sizeShrimp')}
              placeholder="Nhập kích thước tôm"
              disabled={isLoading}
            />
            <InputField
              label="Số lượng Tôm (kg)"
              id="amountShrimp"
              type="text"
              value={formData.amountShrimp}
              onChange={handleNumericChange('amountShrimp')}
              placeholder="Nhập số lượng tôm"
              disabled={isLoading}
            />
          </div>

          {errorMessage && (
            <p className="text-red-600 text-center animate-shake">{errorMessage}</p>
          )}

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className={cl(
                'px-4 py-2 bg-green-600 text-white rounded-md shadow-sm transition-all',
                {
                  'opacity-50 cursor-not-allowed': isLoading || !isFormValid(),
                  'hover:bg-green-700': !isLoading && isFormValid(),
                }
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Kích hoạt'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

ActiveCard.propTypes = {
  pondId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setIsActiveModal: PropTypes.func.isRequired,
  onDeleteCardSuccess: PropTypes.func.isRequired,
};

export default memo(ActiveCard);