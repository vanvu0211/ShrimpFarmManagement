import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from "react-toastify";
import Select from 'react-select';
import { components } from 'react-select'; // Để tùy chỉnh giao diện

// Tùy chỉnh Option để hiển thị checkbox
const Option = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null} // Không cần xử lý vì react-select tự quản lý
      />
      <label className="ml-2">{props.label}</label>
    </components.Option>
  );
};

const MachinesManager = () => {
  const [machines, setMachines] = useState([]);
  const [newMachine, setNewMachine] = useState({ id: '', name: '', pond: [] });
  const [editingMachine, setEditingMachine] = useState(null);
  const ponds = [
    { value: 'Ao 1', label: 'Ao 1' },
    { value: 'Ao 2', label: 'Ao 2' },
    { value: 'Ao 3', label: 'Ao 3' },
    { value: 'Ao 4', label: 'Ao 4' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMachine(prev => ({ ...prev, [name]: value }));
  };

  const handlePondChange = (selectedOptions) => {
    const selectedPonds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setNewMachine(prev => ({ ...prev, pond: selectedPonds }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingMachine(prev => ({ ...prev, [name]: value }));
  };

  const handleEditPondChange = (selectedOptions) => {
    const selectedPonds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setEditingMachine(prev => ({ ...prev, pond: selectedPonds }));
  };

  const handleAddMachine = (e) => {
    e.preventDefault();
    if (!newMachine.id || !newMachine.name) {
      alert('Vui lòng nhập mã máy và tên máy!');
      return;
    }
    setMachines(prev => [...prev, newMachine]);
    setNewMachine({ id: '', name: '', pond: [] });
  };

  const handleDeleteMachine = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa máy này?')) {
      setMachines(prev => prev.filter(machine => machine.id !== id));
    }
  };

  const handleEditMachine = (machine) => {
    setEditingMachine({ ...machine, pond: machine.pond || [] });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setMachines(prev => prev.map(machine => 
      machine.id === editingMachine.id ? editingMachine : machine
    ));
    setEditingMachine(null);
  };

  const handleCancelEdit = () => {
    setEditingMachine(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F4F7]">
      <aside className="h-full">
        <Sidebar />
      </aside>
      <div className="grow pt-5">
        <main className="p-6 max-w-4xl mx-auto">
          {/* Form thêm máy mới */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thêm máy mới</h2>
            <form onSubmit={handleAddMachine} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <label className="w-24 font-medium text-gray-700">Mã máy:</label>
                <input
                  type="text"
                  name="id"
                  value={newMachine.id}
                  onChange={handleInputChange}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="w-24 font-medium text-gray-700">Tên máy:</label>
                <input
                  type="text"
                  name="name"
                  value={newMachine.name}
                  onChange={handleInputChange}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mb-4">
                <label className="w-24 font-medium text-gray-700">Ao lắp đặt:</label>
                <div className="flex-1">
                  <Select
                    isMulti
                    options={ponds}
                    value={ponds.filter(pond => newMachine.pond.includes(pond.value))}
                    onChange={handlePondChange}
                    placeholder="Chọn ao..."
                    components={{ Option }} // Sử dụng Option tùy chỉnh
                    closeMenuOnSelect={false} // Giữ menu mở khi chọn nhiều
                    hideSelectedOptions={false} // Hiển thị các tùy chọn đã chọn trong danh sách
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Thêm máy
              </button>
            </form>
          </section>

          {/* Danh sách máy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Danh sách máy</h2>
            {machines.length === 0 ? (
              <p className="text-gray-500">Chưa có máy nào trong danh sách</p>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="p-3 text-left">Mã máy</th>
                      <th className="p-3 text-left">Tên máy</th>
                      <th className="p-3 text-left">Ao</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.map((machine) => (
                      <tr key={machine.id} className="border-t hover:bg-gray-50">
                        {editingMachine && editingMachine.id === machine.id ? (
                          <>
                            <td className="p-3">
                              <input
                                value={editingMachine.id}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                name="name"
                                value={editingMachine.name}
                                onChange={handleEditChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-3">
                              <Select
                                isMulti
                                options={ponds}
                                value={ponds.filter(pond => editingMachine.pond.includes(pond.value))}
                                onChange={handleEditPondChange}
                                placeholder="Chọn ao..."
                                components={{ Option }} // Sử dụng Option tùy chỉnh
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                              />
                            </td>
                            <td className="p-3 flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition"
                              >
                                Hủy
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3">{machine.id}</td>
                            <td className="p-3">{machine.name}</td>
                            <td className="p-3">{machine.pond.length > 0 ? machine.pond.join(', ') : 'Chưa chọn'}</td>
                            <td className="p-3 flex gap-2">
                              <button
                                onClick={() => handleEditMachine(machine)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteMachine(machine.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
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
      </div>
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

export default MachinesManager;