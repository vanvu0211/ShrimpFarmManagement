import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardRequestApi, infoRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading';
import Sidebar from '../../components/Sidebar';

const Info = () => {
  const farmId = Number(localStorage.getItem('farmId'));
  const callApi = useCallApi();
  const location = useLocation();

  const [formData, setFormData] = useState({ pondId: '' });
  const [pondTypeOptions, setPondTypeOptions] = useState([]);
  const [pondOptions, setPondOptions] = useState([]);
  const [selectedPondType, setSelectedPondType] = useState('');
  const [selectedPond, setSelectedPond] = useState('');
  const [infoData, setInfoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Lấy danh sách loại ao
  const fetchPondTypes = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondTypeRequest.getPondTypeRequestByFamrId(farmId)],
      (res) => {
        const pondTypes = res[0];
        const options = pondTypes.map((pondType) => ({
          value: pondType.pondTypeId,
          label: pondType.pondTypeName,
        }));
        setPondTypeOptions(options);
      },
      null,
      (err) => console.error('Failed to fetch pondTypes:', err)
    );
  }, [callApi, farmId]);

  // Lấy danh sách ao theo loại ao
  const fetchPonds = useCallback(() => {
    if (!selectedPondType) return;
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByPondTypeIdAndFarmId(selectedPondType, farmId)],
      (res) => {
        const ponds = res[0];
        const options = ponds.map((pond) => ({
          value: pond.pondId,
          label: pond.pondName,
        }));
        setPondOptions(options);
      },
      null,
      (err) => console.error('Failed to fetch ponds:', err)
    );
  }, [callApi, selectedPondType, farmId]);

  // Lấy thông tin chi tiết ao với loading theo %
  const fetchPondInfo = useCallback((pondId) => {
    if (!pondId) {
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    callApi(
      [infoRequestApi.InfoRequest.getInfo(pondId)],
      (res) => {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setInfoData(res[0]);
        }, 300);
      },
      (err) => {
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          toast.error('Không tìm thấy thông tin!');
          setInfoData(null);
        }, 300);
      }
    );
  }, [callApi]);

  // Lấy danh sách ao dựa trên pondTypeId và chọn pondId ban đầu
  const fetchPondsForPondType = useCallback(
    (pondTypeId, initialPondId) => {
      callApi(
        [DashboardRequestApi.pondRequest.getPondRequestByPondTypeIdAndFarmId(pondTypeId, farmId)],
        (res) => {
          const ponds = res[0];
          const options = ponds.map((pond) => ({
            value: pond.pondId,
            label: pond.pondName,
          }));
          setPondOptions(options);
          const selectedPondOption = options.find((option) => option.value === initialPondId);
          if (selectedPondOption) {
            setSelectedPond(selectedPondOption.value);
            setFormData({ pondId: selectedPondOption.value });
            fetchPondInfo(selectedPondOption.value); // Gọi trực tiếp với pondId
          }
        },
        null,
        (err) => console.error('Failed to fetch ponds:', err)
      );
    },
    [callApi, farmId, fetchPondInfo]
  );

  // Khởi tạo ban đầu từ location.state và tự động fetch info
  useEffect(() => {
    fetchPondTypes();
    if (location.state?.pondId && location.state?.pondTypeId && isInitialLoad) {
      const { pondId, pondTypeId } = location.state;
      setSelectedPondType(pondTypeId);
      setFormData({ pondId });
      fetchPondsForPondType(pondTypeId, pondId);
      setIsInitialLoad(false);
    }
  }, [fetchPondTypes, location.state, fetchPondsForPondType, isInitialLoad]);

  // Tải danh sách ao khi loại ao thay đổi
  useEffect(() => {
    if (selectedPondType ) {
      fetchPonds();
    }
  }, [selectedPondType, fetchPonds]);

  // Xử lý thay đổi loại ao
  const handlePondTypeChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedPondType(value);
    setSelectedPond('');
    setFormData({ pondId: '' });
    setInfoData(null);
    setPondOptions([]);
  }, []);

  // Xử lý thay đổi ao
  const handlePondChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedPond(value);
    setFormData({ pondId: value });
    setInfoData(null);
  }, []);

  // Gọi fetchPondInfo khi nhấn nút
  const handleFetchPondInfo = () => {
    fetchPondInfo(formData.pondId);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <aside>
        <Sidebar />
      </aside>
      <main className="flex-1 mt-16 sm:mt-0 mx-auto max-w-6xl max-h-[100vh] p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <section className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Thông tin ao</h2>
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-teal-800 font-semibold mb-2" htmlFor="pondType">
                  Loại ao
                </label>
                <select
                  id="pondType"
                  value={selectedPondType}
                  onChange={handlePondTypeChange}
                  disabled={isLoading}
                  className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm disabled:opacity-50"
                >
                  <option value="">Chọn loại ao</option>
                  {pondTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-teal-800 font-semibold mb-2" htmlFor="pond">
                  Tên ao
                </label>
                <select
                  id="pond"
                  value={selectedPond}
                  onChange={handlePondChange}
                  disabled={isLoading}
                  className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm disabled:opacity-50"
                >
                  <option value="">Chọn tên ao</option>
                  {pondOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleFetchPondInfo}
              className={`w-full px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Đang tìm...' : 'Tìm kiếm thông tin'}
            </button>

            {infoData && (
              <div className="mt-6 space-y-6 overflow-y-auto sm:overflow-y-auto">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-teal-700 mb-2">Thông tin cơ bản</h3>
                  <p><strong>Tên ao:</strong> {infoData.pondName}</p>
                  <p><strong>Độ sâu:</strong> {infoData.deep} (m)</p>
                  <p><strong>Đường kính:</strong> {infoData.diameter} (m)</p>
                  <p><strong>Loại ao:</strong> {infoData.pondTypeName}</p>
                  <p><strong>Trạng thái:</strong> {infoData.status}</p>
                  <p><strong>Tên giống:</strong> {infoData.seedName}</p>
                  <p><strong>Ngày bắt đầu:</strong> {new Date(infoData.startDate).toLocaleDateString()}</p>
                </div>

                {infoData.certificates?.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-700 mb-2">Chứng nhận</h3>
                    <ul className="list-disc pl-5">
                      {infoData.certificates.map((cert, index) => (
                        <li key={index}>
                          {cert.certificateName} -{' '}
                          <a href={`data:image/jpeg;base64,${cert.fileData}`} className="text-blue-700 underline" download={`${cert.certificateName}.jpg`}>
                            Tải xuống
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {infoData.feedingFoods?.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-700 mb-2">Cho ăn</h3>
                    <table className="w-full text-left">
                      <thead className="bg-teal-600 text-white">
                        <tr>
                          <th className="p-3">Ngày</th>
                          <th className="p-3">Tên thức ăn</th>
                          <th className="p-3">Số lượng (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infoData.feedingFoods.map((food, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{new Date(food.feedingDate).toLocaleDateString()}</td>
                            <td className="p-3">{food.foods[0].name}</td>
                            <td className="p-3">{food.foods[0].amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {infoData.feedingMedicines?.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-700 mb-2">Điều trị</h3>
                    <table className="w-full text-left">
                      <thead className="bg-teal-600 text-white">
                        <tr>
                          <th className="p-3">Ngày</th>
                          <th className="p-3">Tên thuốc</th>
                          <th className="p-3">Số lượng (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infoData.feedingMedicines.map((med, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{new Date(med.feedingDate).toLocaleDateString()}</td>
                            <td className="p-3">{med.medicines[0].name}</td>
                            <td className="p-3">{med.medicines[0].amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {infoData.sizeShrimps?.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-700 mb-2">Kích thước tôm</h3>
                    <table className="w-full text-left">
                      <thead className="bg-teal-600 text-white">
                        <tr>
                          <th className="p-3">Ngày cập nhật</th>
                          <th className="p-3">Kích thước (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infoData.sizeShrimps.map((size, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{new Date(size.updateDate).toLocaleDateString()}</td>
                            <td className="p-3">{size.sizeValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {infoData.lossShrimps?.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-700 mb-2">Hao hụt tôm</h3>
                    <table className="w-full text-left">
                      <thead className="bg-teal-600 text-white">
                        <tr>
                          <th className="p-3">Ngày cập nhật</th>
                          <th className="p-3">Số lượng hao hụt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infoData.lossShrimps.map((loss, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{new Date(loss.updateDate).toLocaleDateString()}</td>
                            <td className="p-3">{loss.lossValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {infoData.harvests?.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-700 mb-2">Thu hoạch</h3>
                    <table className="w-full text-left">
                      <thead className="bg-teal-600 text-white">
                        <tr>
                          <th className="p-3">Lần thu hoạch</th>
                          <th className="p-3">Ngày thu hoạch</th>
                          <th className="p-3">Kích thước (cm)</th>
                          <th className="p-3">Số lượng (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {infoData.harvests.map((harvest, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{harvest.harvestTime}</td>
                            <td className="p-3">{new Date(harvest.harvestDate).toLocaleDateString()}</td>
                            <td className="p-3">{harvest.size}</td>
                            <td className="p-3">{harvest.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {!infoData && !isLoading && (
              <p className="text-teal-600 text-center py-4">Vui lòng chọn ao để xem thông tin</p>
            )}
          </div>
        </section>

        {isLoading && <Loading progress={loadingProgress} />}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      </main>
    </div>
  );
};

export default Info;