import { useState, useCallback, memo, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';
import PropTypes from 'prop-types';

const DeleteCard = ({ setIsDeleteCard, pondId, onDeleteCardSuccess }) => {
  const [confirmPondId, setConfirmPondId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const callApi = useCallApi();

  // Memoized handlers
  const handleClose = useCallback(() => {
    setIsDeleteCard(false);
    setConfirmPondId('');
    setErrorMessage('');
  }, [setIsDeleteCard]);

  const handleOutsideClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleInputChange = useCallback((e) => {
    setConfirmPondId(e.target.value.trim());
    setErrorMessage('');
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!confirmPondId) {
      setErrorMessage('Vui lòng nhập ID!');
      return;
    }

    if (confirmPondId !== pondId) {
      setErrorMessage('ID không khớp!');
      return;
    }

    setIsLoading(true);
    callApi(
      () => DashboardRequestApi.pondRequest.deletePondRequest(pondId),
      (res) => {
        onDeleteCardSuccess();
        handleClose();
      },
      'Pond đã được xóa thành công!',
      (err) => {
        setIsLoading(false);
        setErrorMessage(err?.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        console.error('Delete Pond Error:', err);
      }
    );
  }, [confirmPondId, pondId, callApi, onDeleteCardSuccess, handleClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300"
      onClick={handleOutsideClick}
    >
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200 animate-in fade-in zoom-in">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <IoCloseSharp className="w-6 h-6" />
        </button>

        <header className="text-2xl font-bold text-center text-gray-800 mb-6">
          Xác nhận xóa Pond
        </header>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="confirmPondId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nhập ID "{pondId}" để xác nhận:
            </label>
            <input
              type="text"
              id="confirmPondId"
              value={confirmPondId}
              onChange={handleInputChange}
              placeholder={pondId}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 transition-all"
              autoFocus
            />
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600 animate-shake">{errorMessage}</p>
            )}
          </div>

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
              disabled={isLoading || !confirmPondId}
              className={cl(
                'px-4 py-2 bg-red-600 text-white rounded-md shadow-sm transition-all',
                {
                  'opacity-50 cursor-not-allowed': isLoading || !confirmPondId,
                  'hover:bg-red-700': !isLoading && confirmPondId
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

DeleteCard.propTypes = {
  setIsDeleteCard: PropTypes.func.isRequired,
  pondId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDeleteCardSuccess: PropTypes.func.isRequired,
};

export default memo(DeleteCard);