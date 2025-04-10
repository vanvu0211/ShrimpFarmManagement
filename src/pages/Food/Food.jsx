import { useState, useCallback, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FoodRequestApi } from '../../services/api';
import { MedicineRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../components/Loading'; // Giả sử bạn có component Loading tương tự

const Food = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [foods, setFoods] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [newFood, setNewFood] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [editingFood, setEditingFood] = useState(null);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const callApi = useCallApi();
  const farmName = localStorage.getItem('farmName') || '';
  const username = localStorage.getItem('username') || '';
  const farmId = Number(localStorage.getItem('farmId'));

  useEffect(() => {
    fetchFoods();
    fetchTreatments();
  }, []);

  const fetchFoods = useCallback(() => {
    callApi(
      [FoodRequestApi.foodRequest.getAllFoodByFarmId(farmId)],
      (res) => setFoods(res[0].flat()),
      (err) => console.error(err)
    );  
  }, [callApi, farmId]);

  const fetchTreatments = useCallback(() => {
    callApi(
      [MedicineRequestApi.medicineRequest.getAllMedicineByFarmId(farmId)],
      (res) => setTreatments(res[0].flat()),
      (err) => {
        toast.error('Không thể tải danh sách thuốc!');
        console.error(err);
      }
    );
  }, [callApi, farmId]);

  const handleAddFood = useCallback(
    (e) => {
      e.preventDefault();
      if (!newFood.trim()) {
        toast.error('Tên thức ăn không được để trống!');
        return;
      }
      const data = { farmId, name: newFood.trim() };
      setIsLoading(true);
      callApi(
        [FoodRequestApi.foodRequest.createFood(data)],
        (res) => {
          setIsLoading(false);
          if (res && res[0] && res[0].name) {
            toast.success('Thêm thức ăn thành công!');
            setFoods([...foods, res[0]]);
            setNewFood('');
          } else {
            toast.error('Thức ăn đã tồn tại!');
          }
        },
        (err) => {
          setIsLoading(false);
          toast.error(
            err?.response?.data?.title === 'Food already exist'
              ? 'Thức ăn đã tồn tại!'
              : 'Có lỗi xảy ra khi thêm thức ăn!'
          );
        }
      );
    },
    [newFood, callApi, foods, farmId]
  );

  const handleAddMedicine = useCallback(
    (e) => {
      e.preventDefault();
      if (!newTreatment.trim()) {
        toast.error('Tên thuốc không được để trống!');
        return;
      }
      const data = { name: newTreatment.trim(), farmId };
      setIsLoading(true);
      callApi(
        [MedicineRequestApi.medicineRequest.createMedicine(data)],
        (res) => {
          setIsLoading(false);
          if (res && res[0] && res[0].name) {
            toast.success('Thêm thuốc thành công!');
            setTreatments([...treatments, res[0]]);
            setNewTreatment('');
          } else {
            toast.error('Thuốc đã tồn tại!');
          }
        },
        (err) => {
          setIsLoading(false);
          toast.error(
            err?.response?.data?.title === 'Medicine already exist'
              ? 'Thuốc đã tồn tại!'
              : 'Có lỗi xảy ra khi thêm thuốc!'
          );
        }
      );
    },
    [newTreatment, callApi, treatments, farmId]
  );

  const handleDeleteFood = useCallback(
    (foodId, foodName) => {
      if (!window.confirm(`Bạn có chắc chắn muốn xóa thức ăn ${foodName}?`)) return;
      setIsLoading(true);
      callApi(
        [FoodRequestApi.foodRequest.deleteFood(foodId)],
        () => {
          setIsLoading(false);
          toast.success('Xóa thức ăn thành công!');
          setFoods(foods.filter((food) => food.name !== foodName));
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi xóa thức ăn!');
        }
      );
    },
    [callApi, foods]
  );

  const handleDeleteMedicine = useCallback(
    (treatmentId, treatmentName) => {
      if (!window.confirm(`Bạn có chắc chắn muốn xóa thuốc ${treatmentName}?`)) return;
      setIsLoading(true);
      callApi(
        [MedicineRequestApi.medicineRequest.deleteMedicine(treatmentId)],
        () => {
          setIsLoading(false);
          toast.success('Xóa thuốc thành công!');
          setTreatments(treatments.filter((treatment) => treatment.name !== treatmentName));
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi xóa thuốc!');
        }
      );
    },
    [callApi, treatments]
  );

  const handleEditItem = (type, item) => {
    if (type === 'foods') setEditingFood({ ...item });
    else setEditingTreatment({ ...item });
  };

  const handleEditChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'foods') setEditingFood((prev) => ({ ...prev, [name]: value }));
    else setEditingTreatment((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFood = useCallback(
    (e, foodName) => {
      e.preventDefault();
      if (!editingFood.name.trim()) {
        toast.error('Tên thức ăn không được để trống!');
        return;
      }
      const data = { foodId: editingFood.foodId, newName: editingFood.name.trim() };
      setIsLoading(true);
      callApi(
        [FoodRequestApi.foodRequest.updateFood(data)],
        (res) => {
          setIsLoading(false);
          toast.success('Cập nhật thức ăn thành công!');
          setFoods((prev) =>
            prev.map((food) => (food.name === foodName ? { ...food, name: editingFood.name.trim() } : food))
          );
          setEditingFood(null);
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi cập nhật thức ăn!');
        }
      );
    },
    [editingFood, callApi]
  );

  const handleEditMedicine = useCallback(
    (e, treatmentName) => {
      e.preventDefault();
      if (!editingTreatment.name.trim()) {
        toast.error('Tên thuốc không được để trống!');
        return;
      }
      const data = { medicineId: editingTreatment.medicineId, newName: editingTreatment.name.trim() };
      setIsLoading(true);
      callApi(
        [MedicineRequestApi.medicineRequest.updateMedicine(data)],
        (res) => {
          setIsLoading(false);
          toast.success('Cập nhật thuốc thành công!');
          setTreatments((prev) =>
            prev.map((treatment) =>
              treatment.name === treatmentName ? { ...treatment, name: editingTreatment.name.trim() } : treatment
            )
          );
          setEditingTreatment(null);
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi cập nhật thuốc!');
        }
      );
    },
    [editingTreatment, callApi]
  );

  const handleCancelEdit = (type) => {
    if (type === 'foods') setEditingFood(null);
    else setEditingTreatment(null);
  };

  const tabs = [
    {
      title: 'Thức ăn',
      content: (
        <main className="w-full mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <section className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Thêm thức ăn mới</h2>
            <form
              onSubmit={handleAddFood}
              className="space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4 sm:mb-6">
                <label className="block text-teal-800 font-semibold mb-2" htmlFor="newFood">
                  Tên thức ăn
                </label>
                <input
                  type="text"
                  id="newFood"
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className={`w-full px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm thức ăn'}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Danh sách thức ăn</h2>
            {foods.length === 0 ? (
              <p className="text-teal-600 text-center">Chưa có thức ăn nào trong danh sách</p>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full min-w-[300px]">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="p-3 text-left text-sm">STT</th>
                      <th className="p-3 text-left text-sm">Tên thức ăn</th>
                      <th className="p-3 text-left text-sm">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food, index) => (
                      <tr key={food.foodId} className="border-t hover:bg-teal-50 transition-all duration-150">
                        <td className="p-3 text-sm">{index + 1}</td>
                        {editingFood && editingFood.foodId === food.foodId ? (
                          <>
                            <td className="p-3">
                              <input
                                type="text"
                                name="name"
                                value={editingFood.name}
                                onChange={(e) => handleEditChange(e, 'foods')}
                                className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm transition-all duration-200"
                              />
                            </td>
                            <td className="p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={(e) => handleEditFood(e, food.name)}
                                className={`bg-teal-600 text-white px-3 py-1 rounded-lg transition-all duration-200 ${
                                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'
                                }`}
                                disabled={isLoading}
                              >
                                {isLoading ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                onClick={() => handleCancelEdit('foods')}
                                className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all duration-200"
                              >
                                Hủy
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm">{food.name}</td>
                            <td className="p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleEditItem('foods', food)}
                                className="bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteFood(food.foodId, food.name)}
                                className={`bg-red-600 text-white px-3 py-1 rounded-lg transition-all duration-200 ${
                                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                                }`}
                                disabled={isLoading}
                              >
                                Xóa
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      ),
    },
    {
      title: 'Điều trị',
      content: (
        <main className="w-full mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <section className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Thêm thuốc mới</h2>
            <form
              onSubmit={handleAddMedicine}
              className="space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4 sm:mb-6">
                <label className="block text-teal-800 font-semibold mb-2" htmlFor="newTreatment">
                  Tên thuốc
                </label>
                <input
                  type="text"
                  id="newTreatment"
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className={`w-full px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md transition-all duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm thuốc'}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-4 sm:mb-6">Danh sách thuốc</h2>
            {treatments.length === 0 ? (
              <p className="text-teal-600 text-center">Chưa có thuốc nào trong danh sách</p>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="w-full min-w-[300px]">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="p-3 text-left text-sm">STT</th>
                      <th className="p-3 text-left text-sm">Tên thuốc</th>
                      <th className="p-3 text-left text-sm">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatments.map((treatment, index) => (
                      <tr key={treatment.medicineId} className="border-t hover:bg-teal-50 transition-all duration-150">
                        <td className="p-3 text-sm">{index + 1}</td>
                        {editingTreatment && editingTreatment.medicineId === treatment.medicineId ? (
                          <>
                            <td className="p-3">
                              <input
                                type="text"
                                name="name"
                                value={editingTreatment.name}
                                onChange={(e) => handleEditChange(e, 'treatments')}
                                className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm transition-all duration-200"
                              />
                            </td>
                            <td className="p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={(e) => handleEditMedicine(e, treatment.name)}
                                className={`bg-teal-600 text-white px-3 py-1 rounded-lg transition-all duration-200 ${
                                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'
                                }`}
                                disabled={isLoading}
                              >
                                {isLoading ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                onClick={() => handleCancelEdit('treatments')}
                                className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all duration-200"
                              >
                                Hủy
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm">{treatment.name}</td>
                            <td className="p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleEditItem('treatments', treatment)}
                                className="bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteMedicine(treatment.medicineId, treatment.name)}
                                className={`bg-red-600 text-white px-3 py-1 rounded-lg transition-all duration-200 ${
                                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                                }`}
                                disabled={isLoading}
                              >
                                Xóa
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      ),
    },
  ];

  return (
    <div className="flex max-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <aside>
        <Sidebar />
      </aside>
      <div className="flex-1  overflow-y-auto no-scrollbar">
        <main className=" p-4 mt-16 sm:mt-0 sm:p-6 lg:p-8">
          {/* <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 sm:mb-8 mx-auto max-w-6xl">
            Quản lý thức ăn và thuốc
          </h1> */}
          <div className="flex flex-row sm:flex-row border-b border-teal-300 max-w-6xl mx-auto bg-white rounded-t-xl shadow-md mb-6">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`flex-1 py-3 px-4 text-center font-medium text-base sm:text-lg transition-all duration-200 ${
                  activeTab === index
                    ? 'border-teal-500 text-teal-600 bg-teal-50 border-b-2'
                    : 'border-transparent text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.title}
              </button>
            ))}
          </div>
          {tabs[activeTab].content}
        </main>
      </div>
      {isLoading && <Loading />}
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

export default Food;