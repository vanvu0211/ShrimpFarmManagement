import React, { useState, useCallback, useEffect, memo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import PondSummary from '../../components/PondSummary/PondSummary';
import Modal from '../../components/Modal';
import DeleteModal from '../../components/DeleteModal';
import SetTime from '../../components/SetTime';
import { AiOutlineClockCircle } from 'react-icons/ai';
import useCallApi from '../../hooks/useCallApi';
import { useSelector } from 'react-redux';
import { IoMdAddCircle } from "react-icons/io";
import { DashboardRequestApi } from '../../services/api';
import CreateModal from '../../components/CreateModal';
import ImageModal from '../../components/ImageModal';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Loading from '../../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdAdd } from "react-icons/io";

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
  const [selectedPondTypeId, setselectedPondTypeId] = useState('');
  const [selectedPondTypeName, setselectedPondTypeName] = useState('');
  const [daysOperated, setDaysOperated] = useState(0);
  const [needsCleaning, setNeedsCleaning] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const farmName = localStorage.getItem('farmName') || '';
  const username = localStorage.getItem('username') || '';
  const farmId = Number(localStorage.getItem('farmId'));

  const fetchData = useCallback(() => {
    if (!farmName || farmName.trim() === '' || !username || username.trim() === '') {
      toast.error('Vui lòng chọn trang trại!');
      return;
    }

    callApi(
      [
        DashboardRequestApi.pondTypeRequest.getPondTypeRequestByFamrId(farmId),
        DashboardRequestApi.pondRequest.getPondRequestByFarmId(farmId),
        DashboardRequestApi.pondRequest.getPondRequestByStatus(farmId, 1),
        DashboardRequestApi.timeRequest.getTimeCleaning(farmId),
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
      },
      (err) => {
        toast.error('Không thể tải dữ liệu từ API!');
        console.error(err);
      }
    );
  }, [callApi, farmId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSelected = (pondTypeId, pondTypeName) => {
    setselectedPondTypeId(pondTypeId);
    setselectedPondTypeName(pondTypeName);
  };

  const handleCleanSensor = () => {
    const currentTime = new Date().toISOString();
    callApi(
      [
        DashboardRequestApi.timeRequest.postCleaningTime({
          cleanTime: currentTime,
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
        console.error("API Error:", err);
      }
    );
  };

  return (
    <div className="flex max-h-screen bg-gradient-to-br z-[100] from-teal-100 to-gray-100/40">
      <aside className="h-screen sticky top-0 sm:w-auto">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col mt-16 sm:mt-0 transition-all m-2 rounded-xl items-center w-full mr-2 overflow-hidden max-h-screen mb-2">
        {/* Container cho 3 card trên cùng */}
        <div className="w-[90%] h-auto rounded-xl flex flex-col sm:flex-row p-4 gap-y-3 gap-x-4">
          {/* Container cho Tổng số ao & Hoạt động trên mobile */}
          <div className="flex flex-row flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
            {/* Card 1: Tổng số ao */}
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl shadow-md bg-white p-4 min-w-0">
              <h1 className="uppercase min-w-96 text-lg font-bold text-teal-800 text-center">Tổng số ao</h1>
              <span className="text-5xl font-bold text-red-500">{ponds?.length || 0}</span>
            </div>

            {/* Card 2: Hoạt động */}
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl shadow-md bg-white p-4 min-w-0">
              <h1 className="uppercase min-w-96 text-lg font-bold text-teal-800 text-center">Hoạt động</h1>
              <span className="text-5xl font-bold text-red-500">{activePonds}</span>
            </div>
          </div>

          {/* Card 3: Farm Name & Icons */}
          <div className="flex flex-row justify-center items-center rounded-xl shadow-md bg-white p-4 gap-4 sm:gap-6 min-w-0 w-full sm:flex-1">
            <div className="flex-1 flex flex-col items-center justify-center bg-white min-w-0">
              <h1 className="uppercase text-lg font-bold font-sans text-gray-700 text-center">{farmName}</h1>
              <div className="text-center">
                <p className="text-xl font-medium text-gray-600">Số ngày vận hành: {daysOperated}</p>
                {needsCleaning ? (
                  <p className="text-red-500 font-semibold text-sm mt-1">Cần vệ sinh cảm biến</p>
                ) : (
                  <p className="text-green-500 font-semibold text-sm mt-1">Cảm biến: Tốt</p>
                )}
              </div>
            </div>
            <AiOutlineClockCircle onClick={() => setIsSetTime(true)} className="text-4xl cursor-pointer" />
            <FaMapMarkerAlt onClick={() => setShowImage(true)} className="text-red-500 text-4xl cursor-pointer" />
          </div>
        </div>

        {/* Container cho PondSummary */}
        <div className="w-[90%] max-h-[90%] flex-1 overflow-y-auto overflow-hidden no-scrollbar-700 rounded-lg p-4 gap-y-3">
          {pondTypes.map((pondType) => {
            const filteredPonds = ponds.filter(
              (pond) => pond.pondTypeName === pondType.pondTypeName
            );
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
          })}
        </div>

        <button className="h-10 w-10 right-4 items-center rounded-2xl -mr-3 bottom-5 fixed  flex justify-center">
          <IoMdAddCircle
            onClick={() => setIsModal(true)}
            className="h-12 text-4xl text-black "
          />
          {/* <div className="flex items-center justify-center text-black font-bold">
            <div
              className={`
                absolute right-full rounded-md px-2 py-1 ml-6 whitespace-nowrap
                bg-indigo-100 text-indigo-800
                invisible opacity-20 -translate-x-3 transition-all
                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-hover:z-50
              `}
            >
              Tạo khối
            </div>
          </div> */}
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