import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { QRCodeCanvas } from 'qrcode.react';
import { FaSearch } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AccessRequestApi } from '../../services/api'; // Import API
import useCallApi from '../../hooks/useCallApi';
import cl from 'classnames';
import PropTypes from 'prop-types';

const Access = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [seedOptions, setSeedOptions] = useState([]);
  const [harvestTimeOptions, setHarvestTimeOptions] = useState([]);
  const [selectedLot, setSelectedLot] = useState('');
  const [selectedHarvestTime, setSelectedHarvestTime] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const qrCodeRef = useRef(null);
  const callApi = useCallApi();
  const [formData, setFormData] = useState({
    seedId: '',
    harvestTime: '0',
  });

  const farmId = Number(localStorage.getItem('farmId')) || 0; // Default to 0 if not found

  // Fetch lot options
  const fetchLotOptions = useCallback(async () => {
    callApi(
      [AccessRequestApi.AccessRequest.getSeedIdList(farmId)],
      (res) => {
        console.log(res)
        const seedOptions = res[0] || [];
        setSeedOptions(
          seedOptions.map((seed) => ({
            value: seed.seedId,
            label: seed.seedId,
          }))
        );
      },
      null,
      (err) => {
        console.error('Error fetching ponds:', err);
      }

    )
  }, [farmId, callApi]);

  // Fetch harvest time options
  const fetchHarvestTimes = useCallback(async () => {
    callApi(
      [AccessRequestApi.AccessRequest.getTimeHarvestList(farmId)],
      (res) => {
        const timeOptions = res[0] || [];
        setHarvestTimeOptions(
          timeOptions.map((seed) => ({
            value: seed.harvestTime,
            label: seed.harvestTime,
          }))
        );
      },
      null,
      (err) => {
        console.error('Error fetching ponds:', err);
      }

    )
  }, [farmId, callApi]);

  useEffect(() => {
    fetchLotOptions();
    fetchHarvestTimes();
  }, [fetchLotOptions, fetchHarvestTimes]);

  // Fetch traceability data
  const fetchData = useCallback(async () => {
    if (!selectedLot || !selectedHarvestTime) {
      toast.warning('Vui lòng chọn cả lô và lần thu hoạch!');
      return;
    }

    setIsLoading(true);
    callApi(
      [AccessRequestApi.AccessRequest.getAccessRequestBySeedId(selectedLot,selectedHarvestTime,farmId)],
      (res)=>{
        setData(res[0]);
        setIsLoading(false);
      }
    )
   
  }, [selectedLot, selectedHarvestTime, farmId, callApi]);

  // Generate QR code content
  const generateQRCodeData = useCallback(() => {
    if (!data) return '';
    return [
      `Mã lô: ${data.seedId}`,
      `Mã ao: ${data.harvestPondId}`,
      `Lần thu hoạch: ${data.harvestTime}`,
      `Số lượng: ${data.totalAmount} kg`,
      `Size tôm: ${data.size} cm`,
      `Giấy chứng nhận: ${data.certificates.length} giấy`,
      `Số ngày nuôi: ${data.daysOfRearing}`,
      `Trang trại: ${data.farmName}`,
      `Địa chỉ: ${data.address}`,
    ].join('\n');
  }, [data]);

  // Download QR code
  const downloadQRCode = useCallback(() => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (!canvas) return;
    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURI;
    link.download = `QRCode_${selectedLot}_${selectedHarvestTime}.png`;
    link.click();
  }, [selectedLot, selectedHarvestTime]);

  // Download certificate as PDF
  const downloadCertificateAsPDF = useCallback((base64, index) => {
    const pdf = new jsPDF();
    pdf.addImage(base64, 'JPEG', 10, 10, 180, 160);
    pdf.save(`Certificate_${selectedLot}_${selectedHarvestTime}_${index + 1}.pdf`);
  }, [selectedLot, selectedHarvestTime]);

  // Handle input changes
  const handleInputChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setSelectedLot(field === 'seedId' ? e.target.value : selectedLot);
      setSelectedHarvestTime(field === 'harvestTime' ? e.target.value : selectedHarvestTime);
      setData(null); // Reset data when selection changes
      setShowQRCode(false);
    },
    [selectedLot, selectedHarvestTime]
  );

  const isFormValid = useCallback(() => {
    const { seedId, harvestTime } = formData;
    return seedId && harvestTime !== '0';
  }, [formData]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isFormValid()) {
        fetchData();
      }
    },
    [fetchData, isFormValid]
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800">Truy Xuất Nguồn Gốc</h1>

        {/* Selection Filters */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="mb-4 sm:mb-6">
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="seedId">
                Chọn lô
              </label>
              <select
                id="seedId"
                value={formData.seedId}
                onChange={handleInputChange('seedId')}
                disabled={isLoading}
                required
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
              >
                <option value="">Chọn lô</option>
                {seedOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="harvestTime">
                Chọn lần thu hoạch
              </label>
              <select
                id="harvestTime"
                value={formData.harvestTime}
                onChange={handleInputChange('harvestTime')}
                disabled={isLoading}
                required
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
              >
                <option value="0">Chọn lần thu hoạch</option>
                {harvestTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                'Tìm kiếm'
              )}
            </button>
          </div>
        </form>

        {/* Data Display */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : data ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Mã lô',
                    'Mã ao',
                    'Lần thu hoạch',
                    'Số lượng (kg)',
                    'Size tôm (cm)',
                    'Giấy chứng nhận',
                    'Số ngày nuôi',
                    'Trang trại',
                    'Địa chỉ',
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.seedId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.harvestPondId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.harvestTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.size}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {data.certificates.map((base64, index) => (
                      <div key={index} className="mb-2">
                        <button
                          onClick={() => downloadCertificateAsPDF(base64, index)}
                          className="text-blue-600 hover:underline"
                        >
                          Tải giấy chứng nhận {index + 1}
                        </button>
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.daysOfRearing}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.farmName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{data.address}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">Vui lòng chọn mã lô và lần thu hoạch để xem thông tin.</p>
        )}

        {/* QR Code Section */}
        {data && (
          <div className="flex flex-col items-center mt-6">
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
            >
              {showQRCode ? 'Ẩn QR' : 'Xuất QR'}
            </button>
            {showQRCode && (
              <div className="mt-4 p-4 bg-white shadow-lg rounded-lg cursor-pointer" onClick={downloadQRCode}>
                <QRCodeCanvas ref={qrCodeRef} value={generateQRCodeData()} size={200} />
                <p className="text-center text-sm text-gray-600 mt-2">Nhấn để tải QR</p>
              </div>
            )}
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
        />
      </main>
    </div>
  );
};

Access.propTypes = {};

export default memo(Access);