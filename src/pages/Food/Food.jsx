import { useState, useCallback, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FoodRequestApi } from '../../services/api';
import { MedicineRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      (res) => {
        setFoods(res[0].flat());
      },
      (err) => {
        console.error(err);
      }
    );
  }, [callApi,farmId]);

  const fetchTreatments = useCallback(() => {
    callApi(
      [MedicineRequestApi.medicineRequest.getAllMedicineByFarmId(farmId)],
      (res) => {
        setTreatments(res[0].flat());
      },
      (err) => {
        toast.error('Không thể tải danh sách thuốc!');
        console.error(err);
      }
    );
  }, [callApi,farmId]);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );

  const handleAddFood = useCallback(
    (e) => {
      e.preventDefault();
      if (!newFood.trim()) {
        toast.error('Tên thức ăn không được để trống!');
        return;
      }
      const data = 
      {   farmId:farmId,
          name: newFood.trim() ,
      };
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
    [newFood, callApi, foods]
  );

  const handleAddMedicine = useCallback(
    (e) => {
      e.preventDefault();
      if (!newTreatment.trim()) {
        toast.error('Tên thuốc không được để trống!');
        return;
      }
      const data = 
      { name: newTreatment.trim(),
        farmId:farmId };
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
    [newTreatment, callApi, treatments]
  );

  const handleDeleteFood = useCallback(
    (foodId,foodName) => {
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
    (treatmentId,treatmentName) => {
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
    [callApi, treatments,username,farmName]
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
      const data = 
      { foodId : editingFood.foodId,
        newName: editingFood.name.trim() ,
      };
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
      const data = { medicineId: editingTreatment.medicineId, 
        newName: editingTreatment.name.trim(),
       };
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
        <main className="p-4 sm:p-6 max-w-full sm:max-w-4xl mx-auto">
          <section className="mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Thêm thức ăn mới</h2>
            <form onSubmit={handleAddFood} className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label className="w-full sm:w-24 font-medium text-gray-700 shrink-0">Tên thức ăn:</label>
                <input
                  type="text"
                  name="name"
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm thức ăn'}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Danh sách thức ăn</h2>
            {foods.length === 0 ? (
              <p className="text-gray-600">Chưa có thức ăn nào trong danh sách</p>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 bg-blue-600 text-white z-10">
                    <tr>
                      <th className="p-2 sm:p-3 text-left text-sm sm:text-base">STT</th>
                      <th className="p-2 sm:p-3 text-left text-sm sm:text-base">Tên thức ăn</th>
                      <th className="p-2 sm:p-3 text-left text-sm sm:text-base">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food, index) => (
                      <tr
                        key={food.name + index}
                        className="border-t hover:bg-gray-100 transition-all duration-150"
                      >
                        <td className="p-2 sm:p-3 text-sm sm:text-base">{index + 1}</td>
                        {editingFood && editingFood.foodId === food.foodId ? (
                          <>
                            <td className="p-2 sm:p-3">
                              <input
                                type="text"
                                name="name"
                                value={editingFood.name}
                                onChange={(e) => handleEditChange(e, 'foods')}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                              />
                            </td>
                            <td className="p-2 sm:p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={(e) => handleEditFood(e, food.name)}
                                className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                onClick={() => handleCancelEdit('foods')}
                                className="bg-gray-600 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                              >
                                Hủy
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 sm:p-3 text-sm sm:text-base">{food.name}</td>
                            <td className="p-2 sm:p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleEditItem('foods', food)}
                                className="bg-amber-500 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteFood(food.foodId, food.name)}
                                className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
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
        <main className="p-4 sm:p-6 max-w-full sm:max-w-4xl mx-auto">
          <section className="mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Thêm thuốc mới</h2>
            <form onSubmit={handleAddMedicine} className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <label className="w-full sm:w-24 font-medium text-gray-700 shrink-0">Tên thuốc:</label>
                <input
                  type="text"
                  name="name"
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm thuốc'}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Danh sách thuốc</h2>
            {treatments.length === 0 ? (
              <p className="text-gray-600">Chưa có thuốc nào trong danh sách</p>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="sticky top-0 bg-blue-600 text-white z-10">
                    <tr>
                      <th className="p-2 sm:p-3 text-left text-sm sm:text-base">STT</th>
                      <th className="p-2 sm:p-3 text-left text-sm sm:text-base">Tên thuốc</th>
                      <th className="p-2 sm:p-3 text-left text-sm sm:text-base">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatments.map((treatment, index) => (
                      <tr
                        key={treatment.name + index}
                        className="border-t hover:bg-gray-100 transition-all duration-150"
                      >
                        <td className="p-2 sm:p-3 text-sm sm:text-base">{index + 1}</td>
                        {editingTreatment && editingTreatment.medicineId === treatment.medicineId ? (
                          <>
                            <td className="p-2 sm:p-3">
                              <input
                                type="text"
                                name="name"
                                value={editingTreatment.name}
                                onChange={(e) => handleEditChange(e, 'treatments')}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
                              />
                            </td>
                            <td className="p-2 sm:p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={(e) => handleEditMedicine(e, treatment.name)}
                                className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                onClick={() => handleCancelEdit('treatments')}
                                className="bg-gray-600 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                              >
                                Hủy
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 sm:p-3 text-sm sm:text-base">{treatment.name}</td>
                            <td className="p-2 sm:p-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleEditItem('treatments', treatment)}
                                className="bg-amber-500 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-amber-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteMedicine(treatment.medicineId,treatment.name)}
                                className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
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

export default Food;