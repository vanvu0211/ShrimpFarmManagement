import React, { useState, useCallback, useEffect, memo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import PondSummary from '../../components/PondSummary/PondSummary';
import Modal from '../../components/Modal';
import DeleteModal from '../../components/DeleteModal';
import SetTime from '../../components/SetTime';
import { AiOutlineClockCircle } from 'react-icons/ai';
import useCallApi from '../../hooks/useCallApi';
import useSignalR from '../../hooks/useSignalR';
import { useSelector } from 'react-redux';
import { IoMdAddCircle } from "react-icons/io";
import { DashboardRequestApi } from '../../services/api';
import CreateModal from '../../components/CreateModal';
import ImageModal from '../../components/ImageModal';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Loading from '../../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { AlarmRequestApi } from '../../services/api';

function Dashboard() {
  const callApi = useCallApi();
  const expanded = useSelector((state) => state.sidebar.expanded);
  const [isModal, setIsModal] = useState(false);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isSetTime, setIsSetTime] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [activePonds, setActivePonds] = useState(0);
  const [pondTypes, setPondTypes] = useState([]);
  const [ponds, setPonds] = useState([]);
  const [selectedPondTypeId, setSelectedPondTypeId] = useState('');
  const [selectedPondTypeName, setSelectedPondTypeName] = useState('');
  const [daysOperated, setDaysOperated] = useState(0);
  const [needsCleaning, setNeedsCleaning] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cabinData, setCabinData] = useState([
    { name: 'Tủ điện 1', status: 'Tắt', updated: false },
    { name: 'Tủ điện 2', status: 'Tắt', updated: false }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const farmName = localStorage.getItem('farmName') || '';
  const farmId = Number(localStorage.getItem('farmId'));

  const cabinStatusMapping = {
    'Tủ điện 1': {
      'GOOD': 'Bật',
      'BAD': 'Tắt',
      'Measuring': 'Đang đo'
    },
    'Tủ điện 2': {
      'GOOD': 'Bật',
      'BAD': 'Tắt'
    }
  };

  const handleCabinStatusChanged = useCallback((data) => {
    setCabinData(prevData => {
      const updatedData = [...prevData];
      // Map "Cabin 1" to "Tủ điện 1" and "Cabin 2" to "Tủ điện 2"
      const displayName = data.Name === 'Cabin 1' ? 'Tủ điện 1' : data.Name === 'Cabin 2' ? 'Tủ điện 2' : null;
      if (!displayName) return updatedData; // Skip if no valid displayName

      const cabinIndex = updatedData.findIndex(c => c.name === displayName);
      if (cabinIndex !== -1) {
        const mappedStatus = cabinStatusMapping[displayName]?.[data.Value] || 'Tắt';
        updatedData[cabinIndex] = {
          ...updatedData[cabinIndex],
          status: mappedStatus,
          updated: true
        };
        setTimeout(() => {
          setCabinData(current => {
            const resetData = [...current];
            resetData[cabinIndex] = { ...resetData[cabinIndex], updated: false };
            return resetData;
          });
        }, 1000);
      }
      return updatedData;
    });
  }, []);

  useSignalR(handleCabinStatusChanged);

  const fetchData = useCallback(() => {
    if (!farmName || farmName.trim() === '') {
      setIsLoading(false);
      toast.error('Vui lòng chọn một trang trại!');
      return;
    }

    setIsLoading(true);

    callApi(
      [
        DashboardRequestApi.pondTypeRequest.getPondTypeRequestByFamrId(farmId),
        DashboardRequestApi.pondRequest.getPondRequestByFarmId(farmId),
        DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 1),
        DashboardRequestApi.timeRequest.getTimeCleaning(farmId),
        AlarmRequestApi.alarmRequest.getStatusCabin(farmId, 'Tình trạng kết nối ESP tủ điện 1'),
        AlarmRequestApi.alarmRequest.getStatusCabin(farmId, 'Tình trạng kết nối ESP tủ điện 2')
      ],
      (res) => {
        setPondTypes(res[0] || []);
        setPonds(res[1] || []);
        setActivePonds(res[2]?.length || 0);

        const lastCleaningTime = new Date(res[3].cleanTime);
        const currentTime = new Date();
        const days = Math.floor((currentTime - lastCleaningTime) / (1000 * 60 * 60 * 24));
        setDaysOperated(days);

        if (days >= 60) {
          setNeedsCleaning(true);
        } else {
          setNeedsCleaning(false);
        }

        setCabinData(prevData => {
          const updatedData = [...prevData];
          const cabin1Status = cabinStatusMapping['Tủ điện 1'][res[4].status] || 'Tắt';
          updatedData[0] = { ...updatedData[0], status: cabin1Status };
          const cabin2Status = cabinStatusMapping['Tủ điện 2'][res[5].status] || 'Tắt';
          updatedData[1] = { ...updatedData[1], status: cabin2Status };
          return updatedData;
        });

        setIsLoading(false);
      },
      (err) => {
        toast.error('Không thể tải dữ liệu từ API!');
        console.error("Lỗi", err);
        setIsLoading(false);
      }
    );
  }, [callApi, farmId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelected = (pondTypeId, pondTypeName) => {
    setSelectedPondTypeId(pondTypeId);
    setSelectedPondTypeName(pondTypeName);
  };

  const handleCleanSensor = () => {
    const currentTime = new Date().toISOString();
    callApi(
      [
        DashboardRequestApi.timeRequest.postCleaningTime({
          cleanTime: currentTime,
          farmId: farmId
        }),
      ],
      (res) => {
        toast.success("Vệ sinh cảm biến thành công!");
        setDaysOperated(0);
        setNeedsCleaning(false);
        setIsConfirmModalOpen(false);
      },
      (err) => {
        toast.error("Không thể cập nhật thời gian vệ sinh!");
      }
    );
  };

  const renderCabinStatus = () => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center rounded-xl shadow-md bg-white p-4 min-w-0">
        <h2 className="text-xl font-bold text-teal-800 mb-3">Trạng thái tủ điện</h2>
        <div className="grid grid-cols-1 gap-2">
          {cabinData.map((cabin, index) => (
            <motion.div
              key={cabin.name}
              className="text-center py-2 p-10 text-sm font-medium rounded-md"
              animate={{
                backgroundColor: cabin.status === 'Bật' ? '#DCFCE7' : cabin.status === 'Đang đo' ? '#FFEDD5' : '#FEE2E2',
                color: cabin.status === 'Bật' ? '#166534' : cabin.status === 'Đang đo' ? '#C2410C' : '#991B1B',
                scale: cabin.updated ? [1, 1.05, 1] : 1
              }}
              transition={{
                color: { duration: 0.3 },
                backgroundColor: { duration: 0.3 },
                scale: { duration: 0.5 }
              }}
            >
              {cabin.name}: {cabin.status}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex max-h-screen bg-gradient-to-br z-[100] from-teal-100 to-gray-100/40">
      <aside className="h-screen sticky top-0 sm:w-auto">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col mt-16 sm:mt-0 transition-all m-2 rounded-xl items-center w-full mr-2 overflow-y-auto overflow-hidden max-h-screen mb-2">
        <div className="w-[90%] h-auto rounded-xl flex flex-col sm:flex-row p-4 gap-y-3 gap-x-4">
          <div className="flex flex-row flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl shadow-md bg-white p-4 min-w-0">
              <h1 className="uppercase min-w-96 sm:text-3xl font-sans text-xl font-bold text-teal-800 text-center">Tổng số ao</h1>
              <span className="text-5xl font-mono font-bold text-red-500">{ponds?.length || 0}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl shadow-md bg-white p-4 min-w-0">
              <h1 className="uppercase min-w-96 sm:text-3xl font-sans text-xl font-bold text-teal-800 text-center">Hoạt động</h1>
              <span className="text-5xl font-mono font-bold text-red-500">{activePonds}</span>
            </div>  
          </div>
          <div className="grid grid-cols-3 items-center rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:flex-1">
            <div className="col-span-2 flex flex-col items-center justify-center gap-2">
              <h1 className="text-xl font-bold font-helvetica bg-gradient-to-r from-teal-600 to-teal-500 text-transparent bg-clip-text">
                Trang trại: {farmName}
              </h1>
              <div className="text-gray-700 space-y-1 text-center">
                <p className="text-base font-helvetica">Thời gian hiện tại: {currentTime.toLocaleTimeString()}</p>
                <p className="text-base font-helvetica">Số ngày vận hành: {daysOperated}</p>
                {needsCleaning ? (
                  <span
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full cursor-pointer hover:bg-red-200 transition"
                  >
                    Cần vệ sinh cảm biến
                  </span>
                ) : (
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Cảm biến: Tốt
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <AiOutlineClockCircle
                onClick={() => setIsSetTime(true)}
                className="text-5xl text-gray-600 cursor-pointer hover:text-teal-500 hover:scale-110 transition-transform duration-200"
              />
              <FaMapMarkerAlt
                onClick={() => setShowImage(true)}
                className="text-5xl text-red-500 cursor-pointer hover:text-red-600 hover:scale-110 transition-transform duration-200"
              />
            </div>
          </div>
           {renderCabinStatus()}
        </div>
       
        <div className="w-[90%] max-h-[90%] flex-1 sm:overflow-y-auto rounded-lg p-4 gap-y-3">
          {pondTypes.length === 0 ? (
            <p className="text-teal-600 text-center">
              Không có loại ao nào
            </p>
          ) : (
            pondTypes.map((pondType) => {
              const filteredPonds = ponds.filter(
                (pond) => pond.pondTypeName === pondType.pondTypeName
              );
              console.log('Rendering PondSummary for', pondType.pondTypeName, 'with ponds:', filteredPonds);
              return (
                <PondSummary
                  onPutSucces={fetchData}
                  key={pondType.pondTypeId}
                  pondTypeName={pondType.pondTypeName}
                  pondTypeId={pondType.pondTypeId}
                  ponds={filteredPonds}
                  setIsDeleteModal={setIsDeleteModal}
                  setIsCreateModal={setIsCreateModal}
                  onSelected={handleSelected}
                  onDeleteCardSuccess={fetchData}
                />
              );
            })
          )}
        </div>
        <button className="h-10 w-10 right-4 items-center rounded-2xl -mr-3 bottom-5 fixed flex justify-center">
          <IoMdAddCircle
            onClick={() => setIsModal(true)}
            className="h-12 text-4xl text-black"
          />
        </button>
        {isSetTime && (
          <SetTime
            setIsSetTime={setIsSetTime}
            onPostSuccess={fetchData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        {isModal && <Modal setIsModal={setIsModal} onPostSuccess={fetchData} />}
        {isDeleteModal && (
          <DeleteModal
            setIsDeleteModal={setIsDeleteModal}
            pondTypeId={selectedPondTypeId}
            pondTypeName={selectedPondTypeName}
            onDeleteSuccess={fetchData}
          />
        )}
        {isCreateModal && (
          <CreateModal
            setIsCreateModal={setIsCreateModal}
            onPostSuccess={fetchData}
            pondTypeId={selectedPondTypeId}
          />
        )}
        {showImage && <ImageModal setShowImage={setShowImage} />}
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
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-medium mb-4">Bạn có chắc chắn muốn vệ sinh cảm biến?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={handleCleanSensor}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Dashboard);