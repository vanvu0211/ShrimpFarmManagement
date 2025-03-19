import { useState, useCallback, useRef, useEffect } from 'react';
import { ShrimpRequestApi } from '../../services/api';
import { MedicineRequestApi } from '../../services/api';
import { DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

const TreatmentTab = () => {
  const farmId = Number(localStorage.getItem('farmId'));
  const callApi = useCallApi();
  const dateInputRef = useRef(null);

  const [formData, setFormData] = useState({
    pondId: '',
    treatmentDate: ''
  });
  const [pondOptions, setPondOptions] = useState([]);
  const [pondTypeOptions, setPondTypeOptions] = useState([]);
  const [pondFindOptions, setPondFindOptions] = useState([]);
  const [selectedFindPond, setSelectedFindPond] = useState(null);
  const [selectedFindPondType, setSelectedFindPondType] = useState(null);

  const [pondTypeFindOptions, setPondTypeFindOptions] = useState([]);
  const [selectedPondType, setSelectedPondType] = useState(null);
  const [selectedPond, setSelectedPond] = useState(null);
  const [treatmentList, setTreatmentList] = useState([{ name: '', amount: 0 }]);
  const [medicines, setMedicines] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPondTypes();
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (selectedPondType || selectedFindPondType) {
      fetchPonds();
      fetchFindPonds();
    }
  }, [selectedPondType, selectedFindPondType]);

  const fetchMedicines = useCallback(() => {
    callApi(
      [MedicineRequestApi.medicineRequest.getAllMedicineByFarmId(farmId)],
      (res) => setMedicines(res[0].flat()),
      (err) => console.error(err)
    );
  }, [callApi, farmId]);

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

  const fetchFindPonds = useCallback(() => {
    if (!selectedFindPondType?.value) return;
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByPondTypeIdAndFarmId(selectedFindPondType.value, farmId)],
      (res) => {
        const ponds = res[0];
        const options = ponds
          .filter((pond) => pond.pondTypeId === selectedFindPondType.value)
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

  const fetchPonds = useCallback(() => {
    if (!selectedPondType?.value) return;
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
        setPondOptions(options);
      },
      null,
      (err) => console.error('Failed to fetch ponds:', err)
    );
  }, [callApi, selectedPondType, farmId]);

  const handlePondTypeChange = (selectedOption) => {
    setSelectedPondType(selectedOption);
    setSelectedPond(null);
    setFormData(prev => ({ ...prev, pondId: '' }));
  };

  const handlePondChange = (selectedOption) => {
    setSelectedPond(selectedOption);
    setFormData(prev => ({ ...prev, pondId: selectedOption?.value || '' }));
  };

  const handleFindPondChange = (selectedOption) => {
    setSelectedFindPond(selectedOption);
    setFormData(prev => ({ ...prev, pondId: selectedOption?.value || '' }));
  };

  const handleFindPondTypeChange = (selectedOption) => {
    setSelectedFindPondType(selectedOption);
    setFormData(prev => ({ ...prev, pondId: selectedOption?.value || '' }));
  };

  const handleInputChange = useCallback((field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleRemoveTreatmentItem = (index) => {
    if (treatmentList.length === 1) {
      toast.error('Phải có ít nhất một mục thuốc!');
      return;
    }
    const newList = treatmentList.filter((_, i) => i !== index);
    setTreatmentList(newList);
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!formData.pondId || !formData.treatmentDate || treatmentList.some(item => !item.name || !item.amount)) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsLoading(true);
    const submitData = {
      pondId: formData.pondId,
      feedingDate: formData.treatmentDate, // API yêu cầu feedingDate thay vì treatmentDate
      medicines: treatmentList // Thay foods bằng medicines để phù hợp với API
    };

    callApi(
      [ShrimpRequestApi.ShrimpRequest.feedingMedicine(submitData)],
      () => {
        setIsLoading(false);
        toast.success('Lịch xử lý thuốc đã được tạo thành công!');
        setFormData({ pondId: '', treatmentDate: '' });
        setTreatmentList([{ name: '', amount: 0 }]);
        setSelectedPond(null);
        setSelectedPondType(null);
      },
      (err) => {
        setIsLoading(false);
        toast.error(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
      }
    );
  }, [formData, treatmentList, callApi]);

  const handleHistorySearch = useCallback(() => {
    if (!formData.pondId || !formData.treatmentDate) {
      toast.error('Vui lòng chọn ao và ngày!');
      return;
    }

    setIsLoading(true);
    callApi(
      [ShrimpRequestApi.ShrimpRequest.getFeedingMedicine(formData.pondId, formData.treatmentDate)],
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

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Thêm lịch xử lý thuốc</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Loại ao:</label>
              <Select
                options={pondTypeOptions}
                onChange={handlePondTypeChange}
                placeholder="Chọn loại ao"
                value={selectedPondType}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.5rem',
                    borderColor: '#E5E7EB',
                    padding: '0.25rem',
                    '&:hover': { borderColor: '#93C5FD' }
                  })
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Tên ao:</label>
              <Select
                options={pondOptions}
                onChange={handlePondChange}
                placeholder="Chọn tên ao"
                value={selectedPond}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.5rem',
                    borderColor: '#E5E7EB',
                    padding: '0.25rem',
                    '&:hover': { borderColor: '#93C5FD' }
                  })
                }}
              />
            </div>
            <div className="relative">
              <label htmlFor="treatmentDate" className="block text-base font-medium text-gray-700 mb-2">
                Ngày xử lý thuốc
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="treatmentDate"
                  ref={dateInputRef}
                  value={formData.treatmentDate}
                  onChange={handleInputChange('treatmentDate')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 text-lg"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {treatmentList.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <select
                  value={item.name}
                  onChange={(e) => {
                    const newList = [...treatmentList];
                    newList[index].name = e.target.value;
                    setTreatmentList(newList);
                  }}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">Chọn thuốc</option>
                  {medicines.map(medicine => (
                    <option key={medicine.medicineId} value={medicine.name}>{medicine.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => {
                    const newList = [...treatmentList];
                    newList[index].amount = Number(e.target.value);
                    setTreatmentList(newList);
                  }}
                  placeholder="Khối lượng"
                  className="w-full sm:w-32 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTreatmentList([...treatmentList, { name: '', amount: 0 }])}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTreatmentItem(index)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Thêm lịch xử lý thuốc'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Truy xuất lịch sử xử lý thuốc</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Loại ao:</label>
              <Select
                options={pondTypeFindOptions}
                onChange={handleFindPondTypeChange}
                placeholder="Chọn loại ao"
                value={selectedFindPondType}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.5rem',
                    borderColor: '#E5E7EB',
                    padding: '0.25rem',
                    '&:hover': { borderColor: '#93C5FD' }
                  })
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Tên ao:</label>
              <Select
                options={pondFindOptions}
                onChange={handleFindPondChange}
                placeholder="Chọn tên ao"
                value={selectedFindPond}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.5rem',
                    borderColor: '#E5E7EB',
                    padding: '0.25rem',
                    '&:hover': { borderColor: '#93C5FD' }
                  })
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Ngày:</label>
              <input
                type="date"
                value={formData.treatmentDate}
                onChange={handleInputChange('treatmentDate')}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleHistorySearch}
              className="w-full bg-green-600 mb-4 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Tìm kiếm
            </button>
          </div>
          {/* Hiển thị dữ liệu lịch sử dưới dạng bảng */}
          {historyData.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Không có dữ liệu lịch sử</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-base">STT</th>
                    <th className="p-3 text-base">Tên thuốc</th>
                    <th className="p-3 text-base">Khối lượng (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.flatMap((record, index) =>
                    record.medicines.map((medicine, medIndex) => (
                      <tr
                        key={`${index}-${medIndex}`}
                        className="border-t hover:bg-gray-100 transition-all duration-150"
                      >
                        <td className="p-3 text-base">{index + 1}</td>
                        <td className="p-3 text-base">{medicine.name}</td>
                        <td className="p-3 text-base">{medicine.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {isLoading && <LoadingSpinner />}
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

export default TreatmentTab;