import { useState, useCallback, useRef, useEffect } from 'react';
import { ShrimpRequestApi } from '../../services/api';
import { DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading';

const ShrimpTab = () => {
  const farmId = Number(localStorage.getItem('farmId'));
  const callApi = useCallApi();
  const dateInputRef = useRef(null);

  const [formData, setFormData] = useState({
    pondId: '',
    updateDate: '',
  });
  const [pondOptions, setPondOptions] = useState([]);
  const [pondTypeOptions, setPondTypeOptions] = useState([]);
  const [pondFindOptions, setPondFindOptions] = useState([]);
  const [selectedFindPond, setSelectedFindPond] = useState('');
  const [selectedFindPondType, setSelectedFindPondType] = useState('');
  const [pondTypeFindOptions, setPondTypeFindOptions] = useState([]);
  const [selectedPondType, setSelectedPondType] = useState('');
  const [selectedPond, setSelectedPond] = useState('');
  const [sizeValue, setSizeValue] = useState(0);
  const [lossValue, setLossValue] = useState(0);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        setPondTypeFindOptions(options);
      },
      null,
      (err) => console.error('Failed to fetch pondTypes:', err)
    );
  }, [callApi, farmId]);

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

  const fetchFindPonds = useCallback(() => {
    if (!selectedFindPondType) return;
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByPondTypeIdAndFarmId(selectedFindPondType, farmId)],
      (res) => {
        const ponds = res[0];
        const options = ponds.map((pond) => ({
          value: pond.pondId,
          label: pond.pondName,
        }));
        setPondFindOptions(options);
      },
      null,
      (err) => console.error('Failed to fetch ponds:', err)
    );
  }, [callApi, selectedFindPondType, farmId]);

  const handlePondTypeChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedPondType(value);
    setSelectedPond('');
    setFormData((prev) => ({ ...prev, pondId: '' }));
  }, []);

  const handlePondChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedPond(value);
    setFormData((prev) => ({ ...prev, pondId: value }));
  }, []);

  const handleFindPondChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedFindPond(value);
    setFormData((prev) => ({ ...prev, pondId: value }));
  }, []);

  const handleFindPondTypeChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedFindPondType(value);
    setFormData((prev) => ({ ...prev, pondId: '' }));
  }, []);

  const handleInputChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log('Form submitted');
      if (!formData.pondId || !formData.updateDate) {
        toast.error('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      setIsLoading(true);
      const formattedUpdateDate = new Date(formData.updateDate).toISOString();
      const lossData = {
        pondId: formData.pondId,
        lossValue,
        updateDate: formattedUpdateDate,
      };
      const sizeData = {
        pondId: formData.pondId,
        sizeValue,
        updateDate: formattedUpdateDate,
      };
      console.log('Submitting:', { lossData, sizeData });

      callApi(
        [
          Promise.all([
            ShrimpRequestApi.ShrimpRequest.updateLossShrimp(lossData),
            ShrimpRequestApi.ShrimpRequest.updateSizeShrimp(sizeData),
          ]),
        ],
        (res) => {
          console.log('API response:', res);
          setIsLoading(false);
          toast.success('Cập nhật thông tin tôm thành công!');
          setFormData({ pondId: '', updateDate: '' });
          setSizeValue(0);
          setLossValue(0);
          setSelectedPond('');
          setSelectedPondType('');
        },
        (err) => {
          console.error('API error:', err);
          setIsLoading(false);
          toast.error(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        }
      );
    },
    [formData, sizeValue, lossValue, callApi]
  );

  const handleHistorySearch = useCallback(() => {
    if (!formData.pondId || !formData.updateDate) {
      toast.error('Vui lòng chọn ao và ngày!');
      return;
    }

    setIsLoading(true);
    callApi(
      [
        Promise.all([
          ShrimpRequestApi.ShrimpRequest.getLossShrimp(formData.pondId, formData.updateDate),
          ShrimpRequestApi.ShrimpRequest.getSizeShrimp(formData.pondId, formData.updateDate),
        ]),
      ],
      (res) => {
        const [lossData, sizeData] = res[0];
        console.log('Loss Data:', lossData);
        console.log('Size Data:', sizeData);

        // Gộp dữ liệu theo updateDate
        const mergedData = {};
        lossData.forEach((loss) => {
          mergedData[loss.updateDate] = { ...mergedData[loss.updateDate], lossValue: loss.lossValue };
        });
        sizeData.forEach((size) => {
          mergedData[size.updateDate] = { ...mergedData[size.updateDate], sizeValue: size.sizeValue };
        });

        const history = Object.keys(mergedData).map((date) => ({
          updateDate: date,
          sizeValue: mergedData[date].sizeValue || 0,
          lossValue: mergedData[date].lossValue || 0,
        }));

        console.log('Merged History:', history);
        setIsLoading(false);
        setHistoryData(history);
      },
      (err) => {
        console.error('API error:', err);
        setIsLoading(false);
        toast.error('Không tìm thấy lịch sử!');
        setHistoryData([]);
      }
    );
  }, [callApi, formData]);

  useEffect(() => {
    fetchPondTypes();
  }, [fetchPondTypes]);

  useEffect(() => {
    if (selectedPondType) fetchPonds();
    if (selectedFindPondType) fetchFindPonds();
  }, [selectedPondType, selectedFindPondType, fetchPonds, fetchFindPonds]);

  return (
    <main className="w-full mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 transition-all duration-300">
      <section className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">
          Cập nhật thông tin tôm
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="pondType">
                Loại ao
              </label>
              <select
                id="pondType"
                value={selectedPondType}
                onChange={handlePondTypeChange}
                disabled={isLoading}
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
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
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
              >
                <option value="">Chọn tên ao</option>
                {pondOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="updateDate">
                Ngày cập nhật
              </label>
              <input
                type="date"
                id="updateDate"
                ref={dateInputRef}
                value={formData.updateDate}
                onChange={handleInputChange('updateDate')}
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="lossValue">
                Số lượng tôm hao (kg)
              </label>
              <input
                id="lossValue"
                type="number"
                value={lossValue}
                onChange={(e) => setLossValue(Number(e.target.value))}
                placeholder="Nhập số lượng tôm hao"
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="sizeValue">
                Kích thước tôm (mm)
              </label>
              <input
                id="sizeValue"
                type="range"
                min="0"
                max="100"
                value={sizeValue}
                onChange={(e) => setSizeValue(Number(e.target.value))}
                className="w-full"
                disabled={isLoading}
              />
              <span className="text-teal-600 text-sm">{sizeValue} mm</span>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Cập nhật thông tin tôm'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">
          Truy xuất lịch sử thông tin tôm
        </h2>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-teal-800 font-semibold mb-2">Loại ao</label>
              <select
                value={selectedFindPondType}
                onChange={handleFindPondTypeChange}
                disabled={isLoading}
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
              >
                <option value="">Chọn loại ao</option>
                {pondTypeFindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-teal-800 font-semibold mb-2">Tên ao</label>
              <select
                value={selectedFindPond}
                onChange={handleFindPondChange}
                disabled={isLoading}
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
              >
                <option value="">Chọn tên ao</option>
                {pondFindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-teal-800 font-semibold mb-2">Ngày</label>
              <input
                type="date"
                value={formData.updateDate}
                onChange={handleInputChange('updateDate')}
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            onClick={handleHistorySearch}
            className={`w-full px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          {historyData.length === 0 ? (
            <p className="text-teal-600 text-center py-4">Không có dữ liệu lịch sử</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full min-w-[300px] text-left">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="p-3 text-sm">STT</th>
                    <th className="p-3 text-sm">Kích thước tôm (mm)</th>
                    <th className="p-3 text-sm">Số lượng tôm hao (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((record, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-teal-50 transition-all duration-150"
                    >
                      <td className="p-3 text-sm">{index + 1}</td>
                      <td className="p-3 text-sm">{record.sizeValue || '-'}</td>
                      <td className="p-3 text-sm">{record.lossValue || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {isLoading && <Loading />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
    </main>
  );
};

export default ShrimpTab;