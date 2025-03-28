import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Select from 'react-select';
import { components } from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MachineRequestApi, DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import useSignalR from '../../hooks/useSignalR';
import { motion } from 'framer-motion';
import cl from 'classnames'; // Thêm classnames để xử lý class động

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
  const farmId = Number(localStorage.getItem('farmId'));
  const callApi = useCallApi();
  const [updatedMachineId, setUpdatedMachineId] = useState(null);

  const [machines, setMachines] = useState([]);
  const [pondsOptions, setPondsOptions] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [tempPonds, setTempPonds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    const fetchMachines = async () => {
      setIsLoading(true);
      try {
        callApi(
          [MachineRequestApi.machineRequest.getAllMachineByFarmId(farmId)],
          (res) => {
            const machineData = res[0] || [];
            const formattedMachines = machineData.map((machine) => ({
              id: machine.machineId,
              name: machine.machineName,
              status: machine.status,
              ponds: machine.pondIds.map((pond) => pond.pondId),
              pondNames: machine.pondIds.map((pond) => pond.pondName),
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

  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
    setTempPonds(machine.ponds);
    setIsCreating(false);
  };

  const handlePondChange = (selectedOptions) => {
    const selectedPonds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setTempPonds(selectedPonds);
  };

  const handleSave = () => {
    const payload = {
      machineId: selectedMachine.id,
      pondIds: tempPonds.map((pondId) => ({
        pondId: pondId,
        pondName: pondsOptions.find((pond) => pond.value === pondId)?.label || '',
      })),
    };

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
        toast.success(`Đã cập nhật ao cho ${selectedMachine.name}!`);
        setSelectedMachine(null);
      },
      (err) => {
        toast.error('Lỗi khi cập nhật máy: ' + (err?.response?.data?.title || 'Thử lại sau!'));
      }
    );
  };

  const handleCreateMachine = () => {
    if (!newMachineName.trim()) {
      toast.error('Vui lòng nhập tên máy!');
      return;
    }

    const payload = {
      farmId,
      machineName: newMachineName,
      pondIds: tempPonds.map((pondId) => ({ pondId })),
    };

    callApi(
      [MachineRequestApi.machineRequest.createMachine(payload)],
      (res) => {
        const newMachine = {
          id: res.data?.machineId || Date.now(),
          name: newMachineName,
          status: false,
          ponds: tempPonds,
          pondNames: pondsOptions
            .filter((pond) => tempPonds.includes(pond.value))
            .map((pond) => pond.label),
        };
        setMachines((prev) => [...prev, newMachine]);
        toast.success(`Đã tạo máy ${newMachineName}!`);
        setIsCreating(false);
        setNewMachineName('');
        setTempPonds([]);
        setSelectedMachine(null);
      },
      (err) => {
        toast.error('Lỗi khi tạo máy: ' + (err?.response?.data?.title || 'Thử lại sau!'));
      }
    );
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setSelectedMachine(null);
    setTempPonds([]);
    setNewMachineName('');
  };

  return (
    <div className="flex max-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <aside>
        <Sidebar />
      </aside>
      <div className="w-full mt-16 sm:mt-0 mx-auto max-w-6xl overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300">
        <main>
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-700">
              Quản lý máy móc ao tôm
            </h1>
            <button
              onClick={openCreateModal}
              className="px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 hover:shadow-lg transition-all duration-300"
            >
              Tạo máy mới
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {isLoading ? (
              <p className="text-teal-700 text-center text-sm sm:text-base">
                Đang tải danh sách máy...
              </p>
            ) : machines.length > 0 ? (
              machines.map((machine) => (
                <motion.div
                  key={machine.id}
                  onClick={() => handleMachineClick(machine)}
                  className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-64 w-full"
                  animate={{
                    scale: updatedMachineId === machine.id ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-teal-600 font-semibold text-lg">Máy</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-teal-800 text-center">
                    {machine.name}
                  </h3>
                  <motion.p
                    className="text-sm sm:text-base mt-2 text-center px-2 py-1 rounded-md"
                    animate={{
                      color: machine.status ? '#166534' : '#991B1B',
                      backgroundColor: machine.status ? '#DCFCE7' : '#FEE2E2',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    Trạng thái: {machine.status ? 'Bật' : 'Tắt'}
                  </motion.p>
                  <p className="text-sm sm:text-base text-teal-600 text-center">
                    Số ao: {machine.ponds.length}
                  </p>
                  <p className="text-sm sm:text-base text-teal-600 text-center">
                    Ao: {machine.pondNames.length > 0 ? machine.pondNames.join(', ') : 'Chưa gắn'}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-teal-700 text-center text-sm sm:text-base">
                Chưa có máy nào được tạo.
              </p>
            )}
          </div>

          {(selectedMachine || isCreating) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-4/5 max-w-lg flex flex-col h-[400px]">
                <h2 className="text-xl sm:text-2xl font-semibold text-teal-700 mb-4 sm:mb-6">
                  {isCreating ? 'Tạo máy mới' : `Gắn ao cho ${selectedMachine.name}`}
                </h2>
                {isCreating && (
                  <input
                    type="text"
                    value={newMachineName}
                    onChange={(e) => setNewMachineName(e.target.value)}
                    placeholder="Nhập tên máy..."
                    className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200 mb-4 sm:mb-6"
                  />
                )}
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
                    className="mb-4 sm:mb-6"
                  />
                </div>
                <div className="pt-4 border-t border-teal-200 flex justify-end gap-4">
                  <button
                    onClick={isCreating ? handleCreateMachine : handleSave}
                    className="px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 hover:shadow-lg transition-all duration-300"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMachine(null);
                      setIsCreating(false);
                    }}
                    className="px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 hover:shadow-lg transition-all duration-300"
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