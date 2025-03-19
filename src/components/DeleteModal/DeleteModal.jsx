import { useState, useCallback, memo, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';
import PropTypes from 'prop-types';

const DeleteModal = ({ setIsDeleteModal, pondTypeId,pondTypeName, onDeleteSuccess }) => {
  const [confirmPondTypeName, setConfirmPondTypeName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const callApi = useCallApi();
  const farmId = Number(localStorage.getItem('farmId'));

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setConfirmPondTypeName(e.target.value);
    setErrorMessage('');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!confirmPondTypeName.trim()) {
      setErrorMessage('Vui lòng nhập tên khối!');
      return;
    }

    if (confirmPondTypeName.trim() !== pondTypeName) {
      setErrorMessage('Tên khối không khớp!');
      return;
    }

    setIsLoading(true);
    callApi(
      () => DashboardRequestApi.pondTypeRequest.deletePondTypeRequest(pondTypeId),
      () => {
        onDeleteSuccess();
        setIsDeleteModal(false);
        setConfirmPondTypeName('');
      },
      'Khối đã được xóa thành công!',
      (err) => {
        setIsLoading(false);
        // Xử lý lỗi cụ thể từ server
        if (err?.type === 'BadRequestException' && err?.title === 'Pond still on list') {
          setErrorMessage('Không thể xóa khối này vì vẫn còn ao liên quan!');
        } else {
          setErrorMessage(err?.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        }
        setErrorMessage('Không thể xóa khối này vì vẫn còn ao!');
      }
    );
  }, [confirmPondTypeName,pondTypeId, pondTypeName, callApi, onDeleteSuccess, setIsDeleteModal]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setIsDeleteModal(false);
    setConfirmPondTypeName('');
    setErrorMessage('');
  }, [setIsDeleteModal]);

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
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200 animate-in fade-in">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>

        <header className="text-2xl font-bold text-center text-gray-800 mb-6">
          Xóa Khối Ao
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="confirmPondTypeName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nhập "{pondTypeName}" để xác nhận xóa:
            </label>
            <input
              type="text"
              id="confirmPondTypeName"
              value={confirmPondTypeName}
              onChange={handleInputChange}
              placeholder={pondTypeName}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 transition-all"
              required
              autoFocus
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
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !confirmPondTypeName.trim()}
              className={cl(
                'px-4 py-2 bg-red-600 text-white rounded-md shadow-sm transition-all',
                {
                  'opacity-50 cursor-not-allowed': isLoading || !confirmPondTypeName.trim(),
                  'hover:bg-red-700': !isLoading && confirmPondTypeName.trim(),
                }
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang xóa...
                </span>
              ) : (
                'Xóa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

DeleteModal.propTypes = {
  setIsDeleteModal: PropTypes.func.isRequired,
  pondTypeId: PropTypes.string.isRequired,
  pondTypeName: PropTypes.string.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
};

export default memo(DeleteModal);