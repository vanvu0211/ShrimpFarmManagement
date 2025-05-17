import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AccessRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import Loading from '../../components/Loading';
import Footer from '../../components/Footer/Footer';

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

  const farmId = Number(localStorage.getItem('farmId')) || 0;

  // Fetch lot options
  const fetchLotOptions = useCallback(async () => {
    callApi(
      [AccessRequestApi.AccessRequest.getSeedIdList(farmId)],
      (res) => {
        const seedOptions = res[0] || [];
        setSeedOptions(
          seedOptions.map((seed) => ({
            value: seed.seedId,
            label: seed.seedId,
          }))
        );
      },
      null,
      (err) => console.error('Error fetching seeds:', err)
    );
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
      (err) => console.error('Error fetching harvest times:', err)
    );
  }, [farmId, callApi]);

  useEffect(() => {
    fetchLotOptions();
    fetchHarvestTimes();
  }, [fetchLotOptions, fetchHarvestTimes]);

  // Fetch traceability data
  const fetchData = useCallback(async () => {
    if (!selectedLot || !selectedHarvestTime) {
      toast.error('Vui lòng chọn cả lô và lần thu hoạch!');
      return;
    }

    setIsLoading(true);
    callApi(
      [AccessRequestApi.AccessRequest.getAccessRequestBySeedId(selectedLot, selectedHarvestTime, farmId)],
      (res) => {
        setData(res[0]);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        toast.error('Không tìm thấy thông tin!');
        setData(null);
      }
    );
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
    if (!canvas) {
      console.error('Không tìm thấy canvas QR code');
      return;
    }
    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURI;
    link.download = `QRCode_${selectedLot}_${selectedHarvestTime}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      setData(null);
      setShowQRCode(false);
    },
    [selectedLot, selectedHarvestTime]
  );

  // Validate form
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
    <div className="flex min-h-screen bg-gradient-to-br from-teal-100 to-gray-100/40 flex-col">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <main className="flex-1 mt-16 sm:mt-0 mx-auto  p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <section className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Truy Xuất Nguồn Gốc</h2>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-teal-800 font-semibold mb-2" htmlFor="seedId">
                      Chọn lô
                    </label>
                    <select
                      id="seedId"
                      value={formData.seedId}
                      onChange={handleInputChange('seedId')}
                      disabled={isLoading}
                      required
                      className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm disabled:opacity-50"
                    >
                      <option value="">Chọn lô</option>
                      {seedOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-teal-800 font-semibold mb-2" htmlFor="harvestTime">
                      Chọn lần thu hoạch
                    </label>
                    <select
                      id="harvestTime"
                      value={formData.harvestTime}
                      onChange={handleInputChange('harvestTime')}
                      disabled={isLoading}
                      required
                      className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm disabled:opacity-50"
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

                <button
                  type="submit"
                  className={`w-full px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 ${
                    isLoading || !isFormValid() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'
                  }`}
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? 'Đang tìm...' : 'Tìm kiếm thông tin'}
                </button>
              </form>

              {/* Data Display */}
              {data && (
                <div className="mt-6 space-y-6 overflow-y-auto sm:overflow-y-auto">
                  {/* Liệt kê thông tin */}
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-700 mb-2">Thông tin truy xuất</h3>
                    <p>
                      <strong>Mã lô:</strong> {data.seedId}
                    </p>
                    <p>
                      <strong>Mã ao:</strong> {data.harvestPondId}
                    </p>
                    <p>
                      <strong>Lần thu hoạch:</strong> {data.harvestTime}
                    </p>
                    <p>
                      <strong>Số lượng:</strong> {data.totalAmount} kg
                    </p>
                    <p>
                      <strong>Size tôm:</strong> {data.size} cm
                    </p>
                    <p>
                      <strong>Số ngày nuôi:</strong> {data.daysOfRearing}
                    </p>
                    <p>
                      <strong>Trang trại:</strong> {data.farmName}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {data.address}
                    </p>
                  </div>

                  {/* Certificates */}
                  {data.certificates?.length > 0 && (
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-teal-700 mb-2">Chứng nhận</h3>
                      <ul className="list-disc pl-5">
                        {data.certificates.map((base64, index) => (
                          <li key={index}>
                            Giấy chứng nhận {index + 1} -{' '}
                            <button
                              onClick={() => downloadCertificateAsPDF(base64, index)}
                              className="text-blue-700 underline hover:text-blue-900"
                            >
                              Tải xuống
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* QR Code Section */}
                  <div className="bg-teal-50 p-4 rounded-lg flex flex-col items-center">
                    <button
                      onClick={() => setShowQRCode(!showQRCode)}
                      className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors"
                    >
                      {showQRCode ? 'Ẩn QR' : 'Xuất QR'}
                    </button>
                    {showQRCode && (
                      <div className="mt-4">
                        <QRCodeCanvas ref={qrCodeRef} value={generateQRCodeData()} size={200} />
                        <p
                          className="text-center text-sm text-teal-600 mt-2 cursor-pointer hover:underline"
                          onClick={downloadQRCode}
                        >
                          Nhấn để tải QR
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!data && !isLoading && (
                <p className="text-teal-600 text-center py-4">
                  Vui lòng chọn mã lô và lần thu hoạch để xem thông tin
                </p>
              )}
            </div>
          </section>

          {isLoading && <Loading />}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default memo(Access);