import React, { useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const Food = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [foodList, setFoodList] = useState([]);
  const [medicineList, setMedicineList] = useState([]);
  const [inputData, setInputData] = useState({ name: "", type: "" });
  const [editIndex, setEditIndex] = useState(null);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setInputData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle add or update
  const handleAddOrUpdate = useCallback(() => {
    if (!inputData.name || !inputData.type) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const listUpdater = activeTab === "tab1" ? setFoodList : setMedicineList;
    if (editIndex !== null) {
      listUpdater((prev) => {
        const updatedList = [...prev];
        updatedList[editIndex] = inputData;
        return updatedList;
      });
      toast.success("Cập nhật thành công!");
    } else {
      listUpdater((prev) => [...prev, inputData]);
      toast.success("Thêm thành công!");
    }

    setInputData({ name: "", type: "" });
    setEditIndex(null);
  }, [activeTab, inputData, editIndex]);

  // Handle delete
  const handleDelete = useCallback((index) => {
    const listUpdater = activeTab === "tab1" ? setFoodList : setMedicineList;
    listUpdater((prev) => prev.filter((_, i) => i !== index));
    toast.success("Xóa thành công!");
  }, [activeTab]);

  // Handle edit
  const handleEdit = useCallback((index) => {
    const currentList = activeTab === "tab1" ? foodList : medicineList;
    setInputData(currentList[index]);
    setEditIndex(index);
  }, [activeTab, foodList, medicineList]);

  const tabs = [
    { id: "tab1", label: "Thức ăn" },
    { id: "tab2", label: "Thuốc" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex justify-center border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-semibold transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="mb-6 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nhập tên"
              value={inputData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <input
              type="text"
              name="type"
              placeholder="Nhập loại"
              value={inputData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={handleAddOrUpdate}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
            >
              {editIndex !== null ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {activeTab === "tab1" ? "Danh sách thức ăn" : "Danh sách thuốc"}
            </h3>
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs sm:text-sm uppercase tracking-wide">
                  <th className="py-3 px-4 text-left">STT</th>
                  <th className="py-3 px-4 text-left">Tên</th>
                  <th className="py-3 px-4 text-left">Loại</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "tab1" ? foodList : medicineList).map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-xs">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-xs">{item.type}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition-colors"
                          aria-label="Edit item"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition-colors"
                          aria-label="Delete item"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(activeTab === "tab1" ? foodList : medicineList).length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500 text-sm">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Food;