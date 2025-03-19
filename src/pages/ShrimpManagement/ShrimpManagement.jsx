import { useState, useCallback, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { ShrimpRequestApi } from '../../services/api';
import { FoodRequestApi } from '../../services/api';
import { DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FeedingTab from '../../components/FeedingTab/FeedingTab';
import TreatmentTab from '../../components/TreatmentTab';

const ShrimpManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pondTypes, setPondTypes] = useState([]);
  const [pondOptions, setPondOptions] = useState([]);
  const [selectedPondType, setSelectedPondType] = useState({});
  const [selectedPond, setSelectedPond] = useState({});
  const [foods, setFoods] = useState([]);
  const [feedingList, setFeedingList] = useState([{ name: '', amount: 0 }]);
  const [medicineList, setMedicineList] = useState([{ name: '', amount: 0 }]);
  const [feedingDate, setFeedingDate] = useState('');
  const [sizeValue, setSizeValue] = useState(0);
  const [lossValue, setLossValue] = useState(0);
  const [updateDate, setUpdateDate] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const callApi = useCallApi();
  const farmId = Number(localStorage.getItem('farmId'));

  useEffect(() => {
    fetchPondTypes();
    fetchFoods();
  }, []);

  const fetchPondTypes = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondTypeRequest.getPondTypeRequestByFamrId(farmId)],
      (res) => {
        const pondTypes = res[0];
        const options = pondTypes.map((pondType) => ({
          value: pondType.pondTypeId,
          label: pondType.pondTypeName,
        }));
        setPondTypes([...options]);
        if (options.length > 0) setSelectedPondType(options[0]);
      },
      null,
      (err) => console.error('Failed to fetch pondTypes:', err)
    );
  }, [callApi, farmId]);

  const fetchPonds = useCallback(() => {
    if (!selectedPondType.value) return;
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByPondTypeIdAndFarmId(selectedPondType.value, farmId)],
      (res) => {
        const ponds = res[0];
        const options = ponds
          .filter((pond) => pond.pondTypeId === selectedPondType.value)
          .map((pond) => ({
            value: pond.pondId,
            label: pond.pondName,
          }));
        setPondOptions([...options]);
        if (options.length > 0) setSelectedPond(options[0]);
      },
      null,
      (err) => console.error('Failed to fetch ponds:', err)
    );
  }, [callApi, selectedPondType, farmId]);

  const fetchFoods = useCallback(() => {
    callApi(
      [FoodRequestApi.foodRequest.getAllFoodByFarmId(farmId)],
      (res) => {
        setFoods(res[0].flat());
      },
      (err) => console.error(err)
    );
  }, [callApi, farmId]);

  useEffect(() => {
    fetchPonds();
  }, [selectedPondType]);

  const handleFeedingSubmit = useCallback((e) => {
    e.preventDefault();
    if (!selectedPond.value || !feedingDate || feedingList.some(item => !item.name || !item.amount)) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    const data = {
      pondId: selectedPond.value,
      foods: feedingList,
      feedlingDate: feedingDate
    };
    
    setIsLoading(true);
    callApi(
      [ShrimpRequestApi.ShrimpRequest.feedingFood(data)],
      () => {
        setIsLoading(false);
        toast.success('Thêm lịch cho ăn thành công!');
        setFeedingList([{ name: '', amount: 0 }]);
        setFeedingDate('');
      },
      (err) => {
        setIsLoading(false);
        toast.error('Có lỗi xảy ra khi thêm lịch cho ăn!');
      }
    );
  }, [callApi, selectedPond, feedingDate, feedingList]);

  const handleMedicineSubmit = useCallback((e) => {
    e.preventDefault();
    if (!selectedPond.value || !feedingDate || medicineList.some(item => !item.name || !item.amount)) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    const data = {
      pondId: selectedPond.value,
      medicines: medicineList,
      feedlingDate: feedingDate
    };
    
    setIsLoading(true);
    callApi(
      [ShrimpRequestApi.ShrimpRequest.feedingMedicine(data)],
      () => {
        setIsLoading(false);
        toast.success('Thêm lịch điều trị thành công!');
        setMedicineList([{ name: '', amount: 0 }]);
        setFeedingDate('');
      },
      (err) => {
        setIsLoading(false);
        toast.error('Có lỗi xảy ra khi thêm lịch điều trị!');
      }
    );
  }, [callApi, selectedPond, feedingDate, medicineList]);

  const handleShrimpInfoSubmit = useCallback((e) => {
    e.preventDefault();
    if (!selectedPond.value || !updateDate) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    const lossData = {
      pondId: selectedPond.value,
      lossValue,
      updateDate
    };
    
    const sizeData = {
      pondId: selectedPond.value,
      sizeValue,
      updateDate
    };
    
    setIsLoading(true);
    callApi(
      [
        ShrimpRequestApi.ShrimpRequest.updateLossShrimp(lossData),
        ShrimpRequestApi.ShrimpRequest.updateSizeShrimp(sizeData)
      ],
      () => {
        setIsLoading(false);
        toast.success('Cập nhật thông tin tôm thành công!');
        setLossValue(0);
        setSizeValue(0);
        setUpdateDate('');
      },
      (err) => {
        setIsLoading(false);
        toast.error('Có lỗi xảy ra khi cập nhật thông tin tôm!');
      }
    );
  }, [callApi, selectedPond, lossValue, sizeValue, updateDate]);

  const handleHistorySearch = useCallback((type) => {
    if (!selectedPond.value || !feedingDate) {
      toast.error('Vui lòng chọn ao và ngày!');
      return;
    }
    
    setIsLoading(true);
    let apiCall;
    switch(type) {
      case 'feeding':
        apiCall = ShrimpRequestApi.ShrimpRequest.getFeedingFood(selectedPond.value, feedingDate);
        break;
      case 'medicine':
        apiCall = ShrimpRequestApi.ShrimpRequest.getFeedingMedicine(selectedPond.value, feedingDate);
        break;
      case 'shrimp':
        apiCall = Promise.all([
          ShrimpRequestApi.ShrimpRequest.getLossShrimp(selectedPond.value, feedingDate),
          ShrimpRequestApi.ShrimpRequest.getSizeShrimp(selectedPond.value, feedingDate)
        ]);
        break;
    }
    
    callApi(
      [apiCall],
      (res) => {
        setIsLoading(false);
        setHistoryData(type === 'shrimp' ? res.flat() : res[0]);
      },
      (err) => {
        setIsLoading(false);
        toast.error('Không tìm thấy lịch sử!');
      }
    );
  }, [callApi, selectedPond, feedingDate]);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );

  const tabs = [
    {
      title: 'Cho ăn',
      content: (
     <FeedingTab/>
      ),
    },
    {
      title: 'Điều trị',
      content: (
       <TreatmentTab/>
      ),
    },
    {
      title: 'Thông tin tôm',
      content: (
        <main className="p-4 sm:p-6 max-w-full sm:max-w-4xl mx-auto">
          <section className="mb-6 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Cập nhật thông tin tôm</h2>
            <form onSubmit={handleShrimpInfoSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={selectedPondType.value || ''}
                  onChange={(e) => setSelectedPondType(pondTypes.find(pt => pt.value === Number(e.target.value)))}
                  className="p-2 border rounded-lg"
                >
                  {pondTypes.map(pt => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
                <select
                  value={selectedPond.value || ''}
                  onChange={(e) => setSelectedPond(pondOptions.find(p => p.value === e.target.value))}
                  className="p-2 border rounded-lg"
                >
                  {pondOptions.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sizeValue}
                  onChange={(e) => setSizeValue(Number(e.target.value))}
                  className="w-full"
                />
                <span>{sizeValue} mm</span>
                <input
                  type="number"
                  value={lossValue}
                  onChange={(e) => setLossValue(Number(e.target.value))}
                  placeholder="Số lượng tôm hao"
                  className="p-2 border rounded-lg"
                />
                <input
                  type="datetime-local"
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  className="p-2 border rounded-lg"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg">
                Cập nhật
              </button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Truy xuất thông tin tôm</h2>
            <div className="flex gap-4 mb-4">
              <select
                value={selectedPond.value || ''}
                onChange={(e) => setSelectedPond(pondOptions.find(p => p.value === e.target.value))}
                className="p-2 border rounded-lg"
              >
                {pondOptions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
              </select>
              <input
                type="date"
                value={feedingDate}
                onChange={(e) => setFeedingDate(e.target.value)}
                className="p-2 border rounded-lg"
              />
              <button
                onClick={() => handleHistorySearch('shrimp')}
                className="bg-blue-600 text-white p-2 rounded-lg"
              >
                Tìm kiếm
              </button>
            </div>
            <div>{JSON.stringify(historyData)}</div>
          </section>
        </main>
      ),
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row h-screen overflow-hidden bg-gray-100">
      <aside className="w-full sm:w-auto sm:h-full shrink-0">
        <Sidebar />
      </aside>
      <div className="flex-1 pt-0 sm:pt-5 overflow-y-auto">
        <main className="p-4 sm:p-5 h-full">
          <div className="flex flex-col sm:flex-row border-b border-gray-300 max-w-full sm:max-w-4xl mx-auto bg-white rounded-t-xl shadow-md">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                } flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center border-b-2 font-medium text-base sm:text-lg transition-all duration-200`}
                onClick={() => setActiveTab(index)}
              >
                {tab.title}
              </button>
            ))}
          </div>
          {tabs[activeTab].content}
        </main>
      </div>
      {isLoading && <LoadingSpinner />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default ShrimpManagement;