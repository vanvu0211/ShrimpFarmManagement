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

  useEffect(() => {
    fetchFoods();
    fetchTreatments();
  }, []);

  const fetchFoods = useCallback(() => {
    callApi(
      [FoodRequestApi.foodRequest.getAllFood()],
      (res) => {
        setFoods(res[0].flat());
        console.log(res[0]);
      },
      (err) => {
        console.error(err);
      }
    );
  }, [callApi]);

  const fetchTreatments = useCallback(() => {
    callApi(
      [MedicineRequestApi.medicineRequest.getAllMedicine()],
      (res) => {
        setTreatments(res[0].flat());
      },
      (err) => {
        toast.error('Không thể tải danh sách thuốc!');
        console.error(err);
      }
    );
  }, [callApi]);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  );

  const handleAddFood = useCallback(
    (e) => {
      e.preventDefault();
      if (!newFood.trim()) {
        toast.error('Tên thức ăn không được để trống!');
        return;
      }

      const data = {
        type: "Thức ăn",
        name: newFood.trim(),
      };

      setIsLoading(true);
      callApi(
        [FoodRequestApi.foodRequest.createFood(data)],
        (res) => {
          setIsLoading(false);
          console.log(res[0]);
          if (res && res[0] && res[0].name) {
            toast.success('Thêm thức ăn thành công!');
            setFoods([...foods, res[0]]);
            setNewFood('');
          } else {
            toast.error('Thức ăn đã tồn tại!');
            console.error('Invalid response:', res);
          }
        },
        (err) => {
          setIsLoading(false);
          if (err?.response?.data?.type === 'BadRequestException' && err?.response?.data?.title === 'Food already exist') {
            toast.error('Thức ăn đã tồn tại!');
          } else {
            toast.error('Có lỗi xảy ra khi thêm thức ăn!');
            console.error(err);
          }
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

      const data = {
        type: "Thuốc",
        name: newTreatment.trim(),
      };

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
            console.error('Invalid response:', res);
          }
        },
        (err) => {
          setIsLoading(false);
          if (err?.response?.data?.type === 'BadRequestException' && err?.response?.data?.title === 'Medicine already exist') {
            toast.error('Thuốc đã tồn tại!');
          } else {
            toast.error('Có lỗi xảy ra khi thêm thuốc!');
            console.error(err);
          }
        }
      );
    },
    [newTreatment, callApi, treatments]
  );

  const handleDeleteFood = useCallback(
    (foodName) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa thức ăn này?')) {
        return;
      }

      setIsLoading(true);
      callApi(
        [FoodRequestApi.foodRequest.deleteFood(foodName)],
        () => {
          setIsLoading(false);
          toast.success('Xóa thức ăn thành công!');
          setFoods(foods.filter((food) => food.name !== foodName));
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi xóa thức ăn!');
          console.error(err);
        }
      );
    },
    [callApi, foods]
  );

  const handleDeleteMedicine = useCallback(
    (treatmentName) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
        return;
      }

      setIsLoading(true);
      callApi(
        [MedicineRequestApi.medicineRequest.deleteMedicine(treatmentName)],
        () => {
          setIsLoading(false);
          toast.success('Xóa thuốc thành công!');
          setTreatments(treatments.filter((treatment) => treatment.name !== treatmentName));
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi xóa thuốc!');
          console.error(err);
        }
      );
    },
    [callApi, treatments]
  );

  const handleEditItem = (type, item) => {
    if (type === 'foods') {
      setEditingFood({ ...item });
    } else {
      setEditingTreatment({ ...item });
    }
  };

  const handleEditChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'foods') {
      setEditingFood((prev) => ({ ...prev, [name]: value }));
    } else {
      setEditingTreatment((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditFood = useCallback(
    (e, foodName) => {
      e.preventDefault();
      if (!editingFood.name.trim()) {
        toast.error('Tên thức ăn không được để trống!');
        return;
      }

      const data = {
        oldName: foodName,
        newName: editingFood.name.trim(),
      };

      setIsLoading(true);
      callApi(
        [FoodRequestApi.foodRequest.updateFood(data)],
        (res) => {
          setIsLoading(false);
          toast.success('Cập nhật thức ăn thành công!');
          setFoods((prevFoods) =>
            prevFoods.map((food) =>
              food.name === foodName ? { ...food, name: editingFood.name.trim() } : food
            )
          );
          setEditingFood(null);
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi cập nhật thức ăn!');
          console.error(err);
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

      const data = {
        oldName: treatmentName,
        newName: editingTreatment.name.trim(),
      };

      setIsLoading(true);
      callApi(
        [MedicineRequestApi.medicineRequest.updateMedicine(data)],
        (res) => {
          setIsLoading(false);
          toast.success('Cập nhật thuốc thành công!');
          setTreatments((prevTreatments) =>
            prevTreatments.map((treatment) =>
              treatment.name === treatmentName ? { ...treatment, name: editingTreatment.name.trim() } : treatment
            )
          );
          setEditingTreatment(null);
        },
        (err) => {
          setIsLoading(false);
          toast.error('Có lỗi xảy ra khi cập nhật thuốc!');
          console.error(err);
        }
      );
    },
    [editingTreatment, callApi]
  );

  const handleCancelEdit = (type) => {
    if (type === 'foods') {
      setEditingFood(null);
    } else {
      setEditingTreatment(null);
    }
  };

  const tabs = [
    {
      title: 'Thức ăn',
      content: (
        <main className="p-6 max-w-4xl mx-auto">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thêm thức ăn mới</h2>
            <form onSubmit={handleAddFood} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <label className="w-24 font-medium text-gray-700">Tên thức ăn:</label>
                <input
                  type="text"
                  name="name"
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm thức ăn'}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Danh sách thức ăn</h2>
            {foods.length === 0 ? (
              <p className="text-gray-500">Chưa có thức ăn nào trong danh sách</p>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden max-h-[50vh] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-blue-600 text-white z-10">
                    <tr>
                      <th className="p-3 text-left">STT</th>
                      <th className="p-3 text-left">Tên thức ăn</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food, index) => (
                      <tr key={food.name + index} className="border-t hover:bg-gray-50">
                        <td className="p-3">{index + 1}</td>
                        {editingFood && editingFood.foodId === food.foodId ? (
                          <>
                            <td className="p-3">
                              <input
                                type="text"
                                name="name"
                                value={editingFood.name}
                                onChange={(e) => handleEditChange(e, 'foods')}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-3 flex gap-2">
                              <button
                                onClick={(e) => handleEditFood(e, food.name)}
                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                onClick={() => handleCancelEdit('foods')}
                                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition"
                              >
                                Hủy
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3">{food.name}</td>
                            <td className="p-3 flex gap-2">
                              <button
                                onClick={() => handleEditItem('foods', food)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteFood(food.name)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
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
        <main className="p-6 max-w-4xl mx-auto">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thêm thuốc mới</h2>
            <form onSubmit={handleAddMedicine} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <label className="w-24 font-medium text-gray-700">Tên thuốc:</label>
                <input
                  type="text"
                  name="name"
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm thuốc'}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Danh sách thuốc</h2>
            {treatments.length === 0 ? (
              <p className="text-gray-500">Chưa có thuốc nào trong danh sách</p>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden max-h-[50vh] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-blue-600 text-white z-10">
                    <tr>
                      <th className="p-3 text-left">STT</th>
                      <th className="p-3 text-left">Tên thuốc</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatments.map((treatment, index) => (
                      <tr key={treatment.name + index} className="border-t hover:bg-gray-50">
                        <td className="p-3">{index + 1}</td>
                        {editingTreatment && editingTreatment.medicineId === treatment.medicineId ? (
                          <>
                            <td className="p-3">
                              <input
                                type="text"
                                name="name"
                                value={editingTreatment.name}
                                onChange={(e) => handleEditChange(e, 'treatments')}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-3 flex gap-2">
                              <button
                                onClick={(e) => handleEditMedicine(e, treatment.name)}
                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                                disabled={isLoading}
                              >
                                {isLoading ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                onClick={() => handleCancelEdit('treatments')}
                                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition"
                              >
                                Hủy
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3">{treatment.name}</td>
                            <td className="p-3 flex gap-2">
                              <button
                                onClick={() => handleEditItem('treatments', treatment)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteMedicine(treatment.name)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
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
    <div className="flex h-screen overflow-hidden bg-[#F2F4F7]">
      <aside className="h-full">
        <Sidebar />
      </aside>
      <div className="grow pt-5">
        <main className="scroll-y h-[calc(100vh-50px)] p-5">
          <div className="grow pt-5">
            <div className="flex border-b border-gray-200 max-w-4xl mx-auto">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`${
                    activeTab === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex-1 py-2 px-4 text-center border-b-2 font-medium text-lg transition-colors duration-200`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab.title}
                </button>
              ))}
            </div>
            {tabs[activeTab].content}
          </div>
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