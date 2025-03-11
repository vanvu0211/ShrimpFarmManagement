import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar'; // Giả sử bạn có component Sidebar
import Select from 'react-select';
import { components } from 'react-select'; // Để tùy chỉnh giao diện
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Tùy chỉnh Option để hiển thị checkbox trong Select
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
  // Danh sách 5 loại máy cố định
  const machineTypes = [
    { id: 'oxyFan', name: 'Máy quạt oxy', ponds: [] },
    { id: 'filter', name: 'Máy lọc phân', ponds: [] },
    { id: 'fan1', name: 'Máy quạt 1', ponds: [] },
    { id: 'fan2', name: 'Máy quạt 2', ponds: [] },
    { id: 'fan3', name: 'Máy quạt 3', ponds: [] },
  ];

  // Danh sách ao cố định
  const pondsOptions = [
    { value: 'Ao 1', label: 'Ao 1' },
    { value: 'Ao 2', label: 'Ao 2' },
    { value: 'Ao 3', label: 'Ao 3' },
    { value: 'Ao 4', label: 'Ao 4' },
    { value: 'Ao 5', label: 'Ao 5' },
    { value: 'Ao 5', label: 'Ao 5' },
    { value: 'Ao 5', label: 'Ao 5' },
    { value: 'Ao 5', label: 'Ao 5' },
    { value: 'Ao 5', label: 'Ao 5' },
    { value: 'Ao 5', label: 'Ao 5' },
  ];

  // Trạng thái quản lý danh sách máy, máy được chọn và ao tạm thời
  const [machines, setMachines] = useState(machineTypes);
  const [selectedMachine, setSelectedMachine] = useState(null); // Máy được chọn để mở modal
  const [tempPonds, setTempPonds] = useState([]); // Lưu tạm thời các ao được chọn trong modal

  // Xử lý khi click vào một máy
  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setTempPonds(machine.ponds); // Khởi tạo tempPonds với danh sách ao hiện tại của máy
  };

  // Xử lý khi chọn ao trong modal (chỉ lưu tạm thời)
  const handlePondChange = (selectedOptions) => {
    const selectedPonds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setTempPonds(selectedPonds); // Cập nhật danh sách ao tạm thời
  };

  // Xử lý khi nhấn nút "Lưu" để áp dụng thay đổi
  const handleSave = () => {
    setMachines(prevMachines =>
      prevMachines.map(machine =>
        machine.id === selectedMachine.id ? { ...machine, ponds: tempPonds } : machine
      )
    );
    toast.success(`Đã gắn ${tempPonds.join(', ')} cho ${selectedMachine.name}!`);
    setSelectedMachine(null); // Đóng modal sau khi lưu
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F4F7]">
      <aside className="h-full">
        <Sidebar />
      </aside>
      <div className="grow pt-5 overflow-y-auto">
        <main className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý máy móc ao tôm</h1>

          {/* Danh sách máy hiển thị dưới dạng hình khối */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {machines.map((machine) => (
              <div
                key={machine.id}
                onClick={() => handleMachineClick(machine)}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col items-center justify-center h-64 w-full"
              >
                <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-semibold text-lg">Máy</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 text-center">{machine.name}</h3>
                <p className="text-base text-gray-600 mt-2 text-center">
                  Ao: {machine.ponds.length > 0 ? machine.ponds.join(', ') : 'Chưa gắn'}
                </p>
              </div>
            ))}
          </div>

          {/* Modal chỉ hiển thị phần chọn ao */}
          {selectedMachine && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg flex flex-col h-[400px]">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Gắn ao cho {selectedMachine.name}
              </h2>
              <div className="flex-grow">
                <Select
                  isMulti
                  options={pondsOptions}
                  value={pondsOptions.filter(pond => tempPonds.includes(pond.value))}
                  onChange={handlePondChange}
                  placeholder="Chọn ao..."
                  components={{ Option }}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  className="mb-4"
                />
              </div>
              <div className="pt-4 border-t flex justify-end gap-4">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setSelectedMachine(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
          )}
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