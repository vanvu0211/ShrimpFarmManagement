import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Select from 'react-select';
import { components } from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
<<<<<<< HEAD
<<<<<<< HEAD
import { MachineRequestApi, DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import useSignalR from '../../hooks/useSignalR';
import { motion } from 'framer-motion';
import Loading from '../../components/Loading'; // Thêm import Loading từ Dashboard
=======
import { MachineRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi'; // Giả sử bạn có hook này để gọi API
>>>>>>> parent of 348f3d2 (update machine pages)
=======
import { MachineRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi'; // Giả sử bạn có hook này để gọi API
>>>>>>> parent of 348f3d2 (update machine pages)

// Tùy chỉnh Option để hiển thị checkbox trong Select
const Option = (props) => (
  <components.Option {...props}>
    <input
      type="checkbox"
      checked={props.isSelected}
      onChange={() => null}
    />
    <label className="ml-2">{props.label}</label>
  </components.Option>
);

const MachinesManager = () => {
<<<<<<< HEAD
<<<<<<< HEAD
  const farmId = Number(localStorage.getItem('farmId'));
  const callApi = useCallApi();
  const [updatedMachineId, setUpdatedMachineId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Đảm bảo state này được dùng cho Loading
=======
  const farmId = Number(localStorage.getItem('farmId')); // Lấy farmId từ localStorage
  const callApi = useCallApi(); // Hook để gọi API
>>>>>>> parent of 348f3d2 (update machine pages)
=======
  const farmId = Number(localStorage.getItem('farmId')); // Lấy farmId từ localStorage
  const callApi = useCallApi(); // Hook để gọi API
>>>>>>> parent of 348f3d2 (update machine pages)

  // Danh sách ao cố định (có thể thay bằng API nếu cần)
  const pondsOptions = [
    { value: 'Ao 1', label: 'Ao 1' },
    { value: 'Ao 2', label: 'Ao 2' },
    { value: 'Ao 3', label: 'Ao 3' },
    { value: 'Ao 4', label: 'Ao 4' },
    { value: 'Ao 5', label: 'Ao 5' },
    { value: 'da8e0204-c035-4e2e-a7ad-da6056122d95', label: 'Ao Test 1' }, // Thêm pondId từ dữ liệu thực tế
    { value: 'e10dd171-ab67-4d7a-b348-d877f37848ee', label: 'Ao Test 2' }, // Thêm pondId từ dữ liệu thực tế
  ];

  // Trạng thái quản lý danh sách máy, máy được chọn và ao tạm thời
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [tempPonds, setTempPonds] = useState([]);
<<<<<<< HEAD
<<<<<<< HEAD
  const [isCreating, setIsCreating] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');

  const machineNameMapping = {
    'Oxi': 'Máy quạt oxi',
    'Waste_separator': 'Máy lọc phân',
    'Fan1': 'Máy quạt 1',
    'Fan2': 'Máy quạt 2',
    'Fan3': 'Máy quạt 3',
  };

  const handleMachineStatusChanged = useCallback((data) => {
    console.log('SignalR data:', data);
    const mappedMachineName = machineNameMapping[data.Name] || data.Name;
    setMachines((prevMachines) => {
      const updatedMachines = prevMachines.map((machine) => {
        if (machine.name === mappedMachineName) {
          return { ...machine, status: data.Value === 'ON' };
        }
        return machine;
      });
      const updatedMachine = updatedMachines.find((m) => m.name === mappedMachineName);
      if (updatedMachine) {
        setUpdatedMachineId(updatedMachine.id);
        setTimeout(() => setUpdatedMachineId(null), 1000);
      }
      return updatedMachines;
    });
  }, []);

  useSignalR(handleMachineStatusChanged);

  useEffect(() => {
    const fetchPonds = async () => {
      try {
        callApi(
          [DashboardRequestApi.pondRequest.getPondRequestByFarmId(farmId)],
          (res) => {
            const pondData = res[0] || [];
            const formattedPonds = pondData.map((pond) => ({
              value: pond.pondId,
              label: pond.pondName,
            }));
            setPondsOptions(formattedPonds);
          },
          null,
          (err) => {
            console.error('Error fetching ponds:', err);
            toast.error('Không thể tải danh sách ao!');
          }
        );
      } catch (error) {
        console.error('Error fetching ponds:', error);
        toast.error('Không thể tải danh sách ao!');
      }
    };

    fetchPonds();
  }, [callApi, farmId]);
=======
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> parent of 348f3d2 (update machine pages)
=======
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> parent of 348f3d2 (update machine pages)

  // Lấy danh sách máy từ API khi component mount
  useEffect(() => {
    const fetchMachines = async () => {
      setIsLoading(true);
      try {
        callApi(
          [MachineRequestApi.machineRequest.getAllMachineByFarmId(farmId)],
          (res) => {
            const machineData = res[0] || [];
            console.log('Fetched machines:', machineData); // Debug dữ liệu
            // Chuyển đổi dữ liệu từ API thành định dạng phù hợp
            const formattedMachines = machineData.map((machine) => ({
              id: machine.machineId,
              name: machine.machineName,
              ponds: machine.pondIds.map((pond) => pond.pondId),
            }));
            setMachines(formattedMachines);
            setIsLoading(false);
          },
          null,
          (err) => {
            console.error('Error fetching machines:', err);
            toast.error('Không thể tải danh sách máy!');
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error fetching machines:', error);
        toast.error('Không thể tải danh sách máy!');
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, [callApi, farmId]);

  // Xử lý khi click vào một máy
  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setTempPonds(machine.ponds); // Khởi tạo tempPonds với danh sách ao hiện tại của máy
  };

  // Xử lý khi chọn ao trong modal (chỉ lưu tạm thời)
  const handlePondChange = (selectedOptions) => {
    const selectedPonds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setTempPonds(selectedPonds); // Cập nhật danh sách ao tạm thời
  };

  // Xử lý khi nhấn nút "Lưu" để áp dụng thay đổi
  const handleSave = () => {
    // Cập nhật danh sách máy trong state
    setMachines((prevMachines) =>
      prevMachines.map((machine) =>
        machine.id === selectedMachine.id ? { ...machine, ponds: tempPonds } : machine
      )
    );
<<<<<<< HEAD

    // Chuẩn bị payload để gửi lên API
    const payload = {
      farmId,
      machineName: selectedMachine.name,
      pondIds: tempPonds.map((pondId) => ({ pondId })),
    };
<<<<<<< HEAD
    setIsLoading(true);
    callApi(
      [MachineRequestApi.machineRequest.updateMachine(payload)],
      () => {
        setMachines((prevMachines) =>
          prevMachines.map((machine) =>
            machine.id === selectedMachine.id
              ? {
                  ...machine,
                  ponds: tempPonds,
                  pondNames: pondsOptions
                    .filter((pond) => tempPonds.includes(pond.value))
                    .map((pond) => pond.label),
                }
              : machine
          )
        );
        setIsLoading(false);
        toast.success(`Đã cập nhật ao cho ${selectedMachine.name}!`);
        setSelectedMachine(null);
=======

    // Gửi yêu cầu cập nhật lên API
    callApi(
      [MachineRequestApi.machineRequest.updateMachine(payload)],
      () => {
        toast.success(`Đã gắn ${tempPonds.join(', ')} cho ${selectedMachine.name}!`);
        setSelectedMachine(null); // Đóng modal sau khi lưu
>>>>>>> parent of 348f3d2 (update machine pages)
=======

    // Chuẩn bị payload để gửi lên API
    const payload = {
      farmId,
      machineName: selectedMachine.name,
      pondIds: tempPonds.map((pondId) => ({ pondId })),
    };

    // Gửi yêu cầu cập nhật lên API
    callApi(
      [MachineRequestApi.machineRequest.updateMachine(payload)],
      () => {
        toast.success(`Đã gắn ${tempPonds.join(', ')} cho ${selectedMachine.name}!`);
        setSelectedMachine(null); // Đóng modal sau khi lưu
>>>>>>> parent of 348f3d2 (update machine pages)
      },
      (err) => {
        
        toast.error('Lỗi khi cập nhật máy: ' + (err?.response?.data?.title || 'Thử lại sau!'));
      }
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F4F7]">
      <aside className="h-full">
        <Sidebar />
      </aside>
      <div className="grow mt-16 sm:mt-0 pt-5 overflow-y-auto">
        <main className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý máy móc ao tôm</h1>

          {/* Danh sách máy hiển thị dưới dạng hình khối */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {isLoading ? (
              <p className="text-gray-600">Đang tải danh sách máy...</p>
            ) : machines.length > 0 ? (
              machines.map((machine) => (
                <div
                  key={machine.id}
                  onClick={() => handleMachineClick(machine)}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col items-center justify-center h-64 w-full"
                >
                  <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-semibold text-lg">Máy</span>
                  </div>
<<<<<<< HEAD
<<<<<<< HEAD
                  <h3 className="text-2xl sm:text-xl font-semibold text-teal-800 text-center">
                    {machine.name}
                  </h3>
                  <motion.p
                    className="text-xl sm:text-lg mt-2 text-center px-2 py-1 rounded-md" // Tăng cỡ chữ từ text-sm lên text-base
                    animate={{
                      color: machine.status ? '#166534' : '#991B1B',
                      backgroundColor: machine.status ? '#DCFCE7' : '#FEE2E2',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    Trạng thái: {machine.status ? 'Bật' : 'Tắt'}
                  </motion.p>
                  <p className="text-lg font-semibold sm:text-lg text-teal-600 text-center"> {/* Tăng cỡ chữ từ text-sm lên text-base */}
                    Số ao: {machine.ponds.length}
                  </p>
                  <p className="text-sm font-semibold sm:text-sm text-black text-center"> {/* Tăng cỡ chữ từ text-sm lên text-base */}
                    Ao: {machine.pondNames.length > 0 ? machine.pondNames.join(', ') : 'Chưa gắn'}
                  </p>
                </motion.div>
=======
                  <h3 className="text-xl font-semibold text-gray-800 text-center">{machine.name}</h3>
                  <p className="text-base text-gray-600 mt-2 text-center">
                    Ao: {machine.ponds.length > 0 ? machine.ponds.join(', ') : 'Chưa gắn'}
                  </p>
                </div>
>>>>>>> parent of 348f3d2 (update machine pages)
=======
                  <h3 className="text-xl font-semibold text-gray-800 text-center">{machine.name}</h3>
                  <p className="text-base text-gray-600 mt-2 text-center">
                    Ao: {machine.ponds.length > 0 ? machine.ponds.join(', ') : 'Chưa gắn'}
                  </p>
                </div>
>>>>>>> parent of 348f3d2 (update machine pages)
              ))
            ) : (
              <p className="text-gray-600">Chưa có máy nào được tạo.</p>
            )}
          </div>

          {/* Modal chỉ hiển thị phần chọn ao */}
          {selectedMachine && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
<<<<<<< HEAD
<<<<<<< HEAD
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-11/12 max-w-lg flex flex-col h-[400px]">
                <h2 className="text-xl sm:text-2xl font-semibold text-teal-700 mb-4 sm:mb-6">
                  {isCreating ? 'Tạo máy mới' : `Gắn ao cho ${selectedMachine.name}`}
=======
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg flex flex-col h-[400px]">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Gắn ao cho {selectedMachine.name}
>>>>>>> parent of 348f3d2 (update machine pages)
=======
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg flex flex-col h-[400px]">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Gắn ao cho {selectedMachine.name}
>>>>>>> parent of 348f3d2 (update machine pages)
                </h2>
                <div className="flex-grow">
                  <Select
                    isMulti
                    options={pondsOptions}
                    value={pondsOptions.filter((pond) => tempPonds.includes(pond.value))}
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
      {isLoading && <Loading />} {/* Thêm Loading component */}
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