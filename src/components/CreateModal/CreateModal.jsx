import { useState, useCallback, memo, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';
import InputField from '../InputField';
import PropTypes from 'prop-types';

const CreateModal = ({ setIsCreateModal, onPostSuccess, pondTypeName }) => {
  const [formData, setFormData] = useState({
    pondId: '',
    deep: '',
    diameter: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const callApi = useCallApi();

  const farmName = localStorage.getItem('farmName') || '';
  const username = localStorage.getItem('username') || '';

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

  // Form validation
  const isFormValid = useCallback(() => {
    const { pondId, deep, diameter } = formData;
    return (
      pondId.trim() &&
      parseFloat(deep) > 0 &&
      parseFloat(diameter) > 0
    );
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setErrorMessage('Vui lòng điền đầy đủ và đúng định dạng các trường!');
      return;
    }

    setIsLoading(true);
    const submitData = {
      pondId: formData.pondId.trim(),
      pondTypeName: pondTypeName.trim(),
      deep: parseFloat(formData.deep),
      diameter: parseFloat(formData.diameter),
      farmName: farmName.trim(),
    };

    callApi(
      () => DashboardRequestApi.pondRequest.createPondRequest(submitData),
      () => {
        onPostSuccess();
        setIsCreateModal(false);
        setFormData({ pondId: '', deep: '', diameter: '' });
      },
      'Ao đã được tạo thành công!',
      (err) => {
        setIsLoading(false);
        setErrorMessage(err?.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        console.error('Create Pond Error:', err);
      }
    );
  }, [formData, pondTypeName, farmName, callApi, onPostSuccess, setIsCreateModal, isFormValid]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setIsCreateModal(false);
    setFormData({ pondId: '', deep: '', diameter: '' });
    setErrorMessage('');
  }, [setIsCreateModal]);

  // Handle outside click and Escape key
  const handleOutsideClick = useCallback((e) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300"
      onClick={handleOutsideClick}
    >
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg mx-4 border border-gray-200 animate-in fade-in">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
          aria-label="Close modal"
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>

        <header className="text-2xl font-bold text-center text-gray-800 mb-6">
          Tạo Ao Mới
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Pond ID"
            id="pondId"
            value={formData.pondId}
            onChange={handleInputChange('pondId')}
            placeholder="Nhập Pond ID"
            disabled={isLoading}
            required
          />

          <InputField
            label="Độ sâu (m)"
            id="deep"
            type="text"
            value={formData.deep}
            onChange={handleNumericChange('deep')}
            placeholder="Nhập độ sâu"
            disabled={isLoading}
            required
          />

          <InputField
            label="Đường kính (m)"
            id="diameter"
            type="text"
            value={formData.diameter}
            onChange={handleNumericChange('diameter')}
            placeholder="Nhập đường kính"
            disabled={isLoading}
            required
          />

          {errorMessage && (
            <p className="text-red-600 text-center animate-shake">{errorMessage}</p>
          )}

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
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
                'Tạo mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateModal.propTypes = {
  setIsCreateModal: PropTypes.func.isRequired,
  onPostSuccess: PropTypes.func.isRequired,
  pondTypeName: PropTypes.string.isRequired,
};

export default memo(CreateModal);