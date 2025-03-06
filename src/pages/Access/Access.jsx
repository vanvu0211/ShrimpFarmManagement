import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { FaSearch } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';

const Access = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [lotOptions, setLotOptions] = useState([]);
  const [harvestTimeOptions, setHarvestTimeOptions] = useState([]);
  const [selectedLot, setSelectedLot] = useState('');
  const [selectedHarvestTime, setSelectedHarvestTime] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const qrCodeRef = useRef(null);

  // API base URL
  const API_BASE_URL = 'https://shrimppond.runasp.net/api/Traceability';

  // Fetch lot options
  const fetchLotOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetSeedId?pageSize=200&pageNumber=1`);
      setLotOptions(response.data.map(lot => ({ value: lot.seedId, label: lot.seedId })));
    } catch (error) {
      console.error('Error fetching lot options:', error);
      toast.error('Không thể tải danh sách lô!');
    }
  }, []);

  // Fetch harvest time options
  const fetchHarvestTimes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetTimeHarvest?pageSize=200&pageNumber=1`);
      setHarvestTimeOptions(response.data.map(time => ({ value: time.harvestTime, label: time.harvestTime })));
    } catch (error) {
      console.error('Error fetching harvest times:', error);
      toast.error('Không thể tải danh sách lần thu hoạch!');
    }
  }, []);

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
    try {
      const response = await axios.get(
        `${API_BASE_URL}?SeedId=${selectedLot}&HarvestTime=${selectedHarvestTime}&pageSize=200&pageNumber=1`
      );
      if (!response.data || Object.keys(response.data).length === 0) {
        toast.warning('Không tìm thấy dữ liệu thu hoạch!');
        setData(null);
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching traceability data:', error);
      toast.error('Đã có lỗi xảy ra khi tải dữ liệu!');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLot, selectedHarvestTime]);

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

  // Handle select changes
  const handleSelectChange = useCallback((setter) => (e) => {
    setter(e.target.value);
    setData(null); // Reset data when selection changes
    setShowQRCode(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800">Truy Xuất Nguồn Gốc</h1>

        {/* Selection Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lô</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-200"
              value={selectedLot}
              onChange={handleSelectChange(setSelectedLot)}
              disabled={isLoading}
            >
              <option value="">Chọn lô</option>
              {lotOptions.map((lot) => (
                <option key={lot.value} value={lot.value}>
                  {lot.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn lần thu hoạch</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-200"
              value={selectedHarvestTime}
              onChange={handleSelectChange(setSelectedHarvestTime)}
              disabled={isLoading}
            >
              <option value="">Chọn lần thu hoạch</option>
              {harvestTimeOptions.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              disabled={isLoading}
              aria-label="Search"
            >
              <FaSearch className="w-5 h-5" />
            </button>
          </div>
        </div>

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
                  {['Mã lô', 'Mã ao', 'Lần thu hoạch', 'Số lượng (kg)', 'Size tôm (cm)', 'Giấy chứng nhận', 'Số ngày nuôi', 'Trang trại', 'Địa chỉ'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

Access.propTypes = {
  // Không cần props ở đây vì component không nhận props từ bên ngoài
};

export default memo(Access);