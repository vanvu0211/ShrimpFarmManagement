import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShrimpRequestApi } from '../../services/api';
import { FoodRequestApi } from '../../services/api';
import { DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading';

const FeedingTab = () => {
  const farmId = Number(localStorage.getItem('farmId'));
  const callApi = useCallApi();
  const dateInputRef = useRef(null);
  const location = useLocation();

  const [formData, setFormData] = useState({
    pondId: '',
    feedingDate: '',
  });
  const [pondOptions, setPondOptions] = useState([]);
  const [pondTypeOptions, setPondTypeOptions] = useState([]);
  const [pondFindOptions, setPondFindOptions] = useState([]);
  const [selectedFindPond, setSelectedFindPond] = useState('');
  const [selectedFindPondType, setSelectedFindPondType] = useState('');
  const [pondTypeFindOptions, setPondTypeFindOptions] = useState([]);
  const [selectedPondType, setSelectedPondType] = useState('');
  const [selectedPond, setSelectedPond] = useState('');
  const [feedingList, setFeedingList] = useState([{ id: Date.now(), name: '', amount: 0 }]);
  const [foods, setFoods] = useState([]);
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
        setPondOptions([]);
        setPondTypeFindOptions(options);
      },
      null,
      (err) => console.error('Failed to fetch pondTypes:', err)
    );
  }, [callApi, farmId]);

  const fetchFoods = useCallback(() => {
    callApi(
      [FoodRequestApi.foodRequest.getAllFoodByFarmId(farmId)],
      (res) => setFoods(res[0].flat()),
      (err) => console.error(err)
    );
  }, [callApi, farmId]);

  const fetchPonds = useCallback(() => {
    if (!selectedPondType) return;
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByPondTypeIdAndFarmId(selectedPondType, farmId)],
      (res) => {
        const ponds = res[0];
        const options = ponds
          // .filter((pond) => pond.pondTypeId === Number(selectedPondType))
          .map((pond) => ({
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
        const options = ponds
          // .filter((pond) => pond.pondTypeId === Number(selectedFindPondType))
          .map((pond) => ({
            value: pond.pondId,
            label: pond.pondName,
          }));
        setPondFindOptions(options);
      },
      null,
      (err) => console.error('Failed to fetch ponds:', err)
    );
  }, [callApi, selectedFindPondType, farmId]);

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
            setFormData((prev) => ({ ...prev, pondId: selectedPondOption.value }));
          }
        },
        null,
        (err) => console.error('Failed to fetch ponds:', err)
      );
    },
    [callApi, farmId]
  );

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

  const handleRemoveFeedingItem = useCallback(
    (id) => {
      if (feedingList.length === 1) {
        toast.error('Phải có ít nhất một mục thức ăn!');
        return;
      }
      const newList = feedingList.filter((item) => item.id !== id);
      setFeedingList(newList);
    },
    [feedingList]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.pondId || !formData.feedingDate || feedingList.some((item) => !item.name || !item.amount)) {
        toast.error('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      setIsLoading(true);
      const submitData = {
        pondId: formData.pondId,
        feedingDate: formData.feedingDate,
        foods: feedingList.map(({ id, ...rest }) => rest),
      };

      callApi(
        [ShrimpRequestApi.ShrimpRequest.feedingFood(submitData)],
        () => {
          setIsLoading(false);
          toast.success('Thêm lịch cho ăn thành công!');
          setFormData({ pondId: '', feedingDate: '' });
          setFeedingList([{ id: Date.now(), name: '', amount: 0 }]);
          setSelectedPond('');
          setSelectedPondType('');
        },
        (err) => {
          setIsLoading(false);
          toast.error(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        }
      );
    },
    [formData, feedingList, callApi]
  );

  const handleHistorySearch = useCallback(() => {
    if (!formData.pondId || !formData.feedingDate) {
      toast.error('Vui lòng chọn ao và ngày!');
      return;
    }

    setIsLoading(true);
    callApi(
      [ShrimpRequestApi.ShrimpRequest.getFeedingFood(formData.pondId, formData.feedingDate)],
      (res) => {
        setIsLoading(false);
        setHistoryData(Array.isArray(res[0]) ? res[0] : []);
      },
      (err) => {
        setIsLoading(false);
        toast.error('Không tìm thấy lịch sử!');
        setHistoryData([]);
      }
    );
  }, [callApi, formData]);

  useEffect(() => {
    fetchPondTypes();
    fetchFoods();
  }, [fetchPondTypes, fetchFoods]);

  useEffect(() => {
    if (selectedPondType) fetchPonds();
    if (selectedFindPondType) fetchFindPonds();
  }, [selectedPondType, selectedFindPondType, fetchPonds, fetchFindPonds]);

  useEffect(() => {
    if (location.state?.pondId && location.state?.pondTypeId && pondTypeOptions.length > 0) {
      const { pondId, pondTypeId } = location.state;
      setSelectedPondType(pondTypeId);
      setFormData((prev) => ({ ...prev, pondId }));
      fetchPondsForPondType(pondTypeId, pondId);
    }
  }, [location.state, pondTypeOptions, fetchPondsForPondType]);

  return (
    <main className="w-full mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 transition-all duration-300">
      <section className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Thêm lịch cho ăn</h2>
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
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="feedingDate">
                Ngày cho ăn
              </label>
              <input
                type="date"
                id="feedingDate"
                ref={dateInputRef}
                value={formData.feedingDate}
                onChange={handleInputChange('feedingDate')}
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            {feedingList.map((item) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <select
                  value={item.name}
                  onChange={(e) => {
                    const newList = feedingList.map((feeding) =>
                      feeding.id === item.id ? { ...feeding, name: e.target.value } : feeding
                    );
                    setFeedingList(newList);
                  }}
                  className="col-span-1 sm:col-span-1 w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                  disabled={isLoading}
                >
                  <option value="">Chọn thức ăn</option>
                  {foods.map((food) => (
                    <option key={food.foodId} value={food.name}>
                      {food.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => {
                    const newList = feedingList.map((feeding) =>
                      feeding.id === item.id ? { ...feeding, amount: Number(e.target.value) } : feeding
                    );
                    setFeedingList(newList);
                  }}
                  placeholder="Khối lượng (kg)"
                  className="col-span-1 sm:col-span-1 w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                  disabled={isLoading}
                />
                <div className="col-span-1 sm:col-span-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedingList([...feedingList, { id: Date.now(), name: '', amount: 0 }])}
                    className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeedingItem(item.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className={`w-full px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Thêm lịch cho ăn'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">
          Truy xuất lịch sử cho ăn
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
                value={formData.feedingDate}
                onChange={handleInputChange('feedingDate')}
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
                    <th className="p-3 text-sm">Thức ăn</th>
                    <th className="p-3 text-sm">Khối lượng (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.flatMap((record, index) =>
                    record.foods.map((food, foodIndex) => (
                      <tr
                        key={`${record.id || index}-${foodIndex}`}
                        className="border-t hover:bg-teal-50 transition-all duration-150"
                      >
                        <td className="p-3 text-sm">{index + 1}</td>
                        <td className="p-3 text-sm">{food.name}</td>
                        <td className="p-3 text-sm">{food.amount}</td>
                      </tr>
                    ))
                  )}
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

export default FeedingTab;