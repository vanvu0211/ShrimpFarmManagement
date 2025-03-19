import { useState, useCallback, useRef, useEffect } from 'react';
import { ShrimpRequestApi } from '../../services/api';
import { MedicineRequestApi } from '../../services/api';
import { DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading';

const TreatmentTab = () => {
  const farmId = Number(localStorage.getItem('farmId'));
  const callApi = useCallApi();
  const dateInputRef = useRef(null);

  const [formData, setFormData] = useState({
    pondId: '',
    treatmentDate: '',
  });
  const [pondOptions, setPondOptions] = useState([]);
  const [pondTypeOptions, setPondTypeOptions] = useState([]);
  const [pondFindOptions, setPondFindOptions] = useState([]);
  const [selectedFindPond, setSelectedFindPond] = useState('');
  const [selectedFindPondType, setSelectedFindPondType] = useState('');
  const [pondTypeFindOptions, setPondTypeFindOptions] = useState([]);
  const [selectedPondType, setSelectedPondType] = useState('');
  const [selectedPond, setSelectedPond] = useState('');
  const [treatmentList, setTreatmentList] = useState([{ id: Date.now(), name: '', amount: 0 }]);
  const [medicines, setMedicines] = useState([]);
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
        setPondOptions([]);
      },
      null,
      (err) => console.error('Failed to fetch pondTypes:', err)
    );
  }, [callApi, farmId]);

  const fetchMedicines = useCallback(() => {
    callApi(
      [MedicineRequestApi.medicineRequest.getAllMedicineByFarmId(farmId)],
      (res) => setMedicines(res[0].flat()),
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

  const handleRemoveTreatmentItem = useCallback(
    (id) => {
      if (treatmentList.length === 1) {
        toast.error('Phải có ít nhất một mục thuốc!');
        return;
      }
      const newList = treatmentList.filter((item) => item.id !== id);
      setTreatmentList(newList);
    },
    [treatmentList]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.pondId || !formData.treatmentDate || treatmentList.some((item) => !item.name || !item.amount)) {
        toast.error('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      setIsLoading(true);
      const submitData = {
        pondId: formData.pondId,
        feedingDate: formData.treatmentDate, // API yêu cầu feedingDate
        medicines: treatmentList.map(({ id, ...rest }) => rest),
      };

      callApi(
        [ShrimpRequestApi.ShrimpRequest.feedingMedicine(submitData)],
        () => {
          setIsLoading(false);
          toast.success('Thêm lịch xử lý thuốc thành công!');
          setFormData({ pondId: '', treatmentDate: '' });
          setTreatmentList([{ id: Date.now(), name: '', amount: 0 }]);
          setSelectedPond('');
          setSelectedPondType('');
        },
        (err) => {
          setIsLoading(false);
          toast.error(err?.response?.data?.title || 'Đã có lỗi xảy ra, vui lòng thử lại!');
        }
      );
    },
    [formData, treatmentList, callApi]
  );

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

  useEffect(() => {
    fetchPondTypes();
    fetchMedicines();
  }, [fetchPondTypes, fetchMedicines]);

  useEffect(() => {
    if (selectedPondType) fetchPonds();
    if (selectedFindPondType) fetchFindPonds();
  }, [selectedPondType, selectedFindPondType, fetchPonds, fetchFindPonds]);

  return (
    <main className="w-full mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 transition-all duration-300">
      <section className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Thêm lịch xử lý thuốc</h2>
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
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="treatmentDate">
                Ngày xử lý thuốc
              </label>
              <input
                type="date"
                id="treatmentDate"
                ref={dateInputRef}
                value={formData.treatmentDate}
                onChange={handleInputChange('treatmentDate')}
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            {treatmentList.map((item) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <select
                  value={item.name}
                  onChange={(e) => {
                    const newList = treatmentList.map((treatment) =>
                      treatment.id === item.id ? { ...treatment, name: e.target.value } : treatment
                    );
                    setTreatmentList(newList);
                  }}
                  className="col-span-1 sm:col-span-1 w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                  disabled={isLoading}
                >
                  <option value="">Chọn thuốc</option>
                  {medicines.map((medicine) => (
                    <option key={medicine.medicineId} value={medicine.name}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => {
                    const newList = treatmentList.map((treatment) =>
                      treatment.id === item.id ? { ...treatment, amount: Number(e.target.value) } : treatment
                    );
                    setTreatmentList(newList);
                  }}
                  placeholder="Khối lượng (kg)"
                  className="col-span-1 sm:col-span-1 w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                  disabled={isLoading}
                />
                <div className="col-span-1 sm:col-span-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTreatmentList([...treatmentList, { id: Date.now(), name: '', amount: 0 }])}
                    className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTreatmentItem(item.id)}
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
            {isLoading ? 'Đang xử lý...' : 'Thêm lịch xử lý thuốc'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">
          Truy xuất lịch sử xử lý thuốc
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
                value={formData.treatmentDate}
                onChange={handleInputChange('treatmentDate')}
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
                    <th className="p-3 text-sm">Tên thuốc</th>
                    <th className="p-3 text-sm">Khối lượng (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.flatMap((record, index) =>
                    record.medicines.map((medicine, medIndex) => (
                      <tr
                        key={`${record.id || index}-${medIndex}`}
                        className="border-t hover:bg-teal-50 transition-all duration-150"
                      >
                        <td className="p-3 text-sm">{index + 1}</td>
                        <td className="p-3 text-sm">{medicine.name}</td>
                        <td className="p-3 text-sm">{medicine.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* {isLoading && <Loading />} */}
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