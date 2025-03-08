import React, { useState, useCallback, useEffect, memo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import PondSummary from '../../components/PondSummary/PondSummary';
import Modal from '../../components/Modal';
import DeleteModal from '../../components/DeleteModal';
import SetTime from '../../components/SetTime';
import { AiOutlineClockCircle } from 'react-icons/ai';
import useCallApi from '../../hooks/useCallApi';
import { useSelector } from 'react-redux';
import { DashboardRequestApi } from '../../services/api';
import CreateModal from '../../components/CreateModal';
import ImageModal from '../../components/ImageModal';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { CiCirclePlus } from 'react-icons/ci';
import Loading from '../../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdAdd } from "react-icons/io";

function Dashboard() {
  const callApi = useCallApi();
  const expanded = useSelector((state) => state.sidebar.expanded);
  
  // State quản lý modal và loading
  const [isModal, setIsModal] = useState(false);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isSetTime, setIsSetTime] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State quản lý dữ liệu
  const [showImage, setShowImage] = useState(false);
  const [activePonds, setActivePonds] = useState(0);
  const [pondTypes, setPondTypes] = useState([]);
  const [ponds, setPonds] = useState([]);
  const [selectedPondTypeName, setSelectedPondTypeName] = useState('');
  const [daysOperated, setDaysOperated] = useState(0);
  const [needsCleaning, setNeedsCleaning] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Lấy farmName và username từ localStorage
  const farmName = localStorage.getItem('farmName') || '';
  const username = localStorage.getItem('username') || '';
  
  const fetchData = useCallback(() => {
    // Kiểm tra nếu farmName hoặc username không tồn tại
    if (!farmName || farmName.trim() === '' || !username || username.trim() === '') {
        toast.error('Vui lòng chọn trang trại!');
        return; // Không gọi API nếu thiếu thông tin
    }

    callApi(
        [
            DashboardRequestApi.pondTypeRequest.getPondTypeRequestByFarmName(farmName),
            DashboardRequestApi.pondRequest.getPondRequestByUsernameAndFarmName(username, farmName),
            DashboardRequestApi.pondRequest.getPondRequestByStatus(username, farmName, 1),
            DashboardRequestApi.timeRequest.getTimeCleaning(),
        ],
        (res) => {
            setPondTypes(res[0]); // Loại hình ao
            setPonds(res[1]);
            setActivePonds(res[2]?.length || 0);

            const lastCleaningTime = new Date(res[3].cleanTime);
            const currentTime = new Date();

            const days = Math.floor(
                (currentTime - lastCleaningTime) / (1000 * 60 * 60 * 24)
            );
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
}, [callApi, farmName, username]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleSelected = (pondTypeName) => {
    setSelectedPondTypeName(pondTypeName); 
  };

  const handleCleanSensor = () => {
    const currentTime = new Date().toISOString(); // Lấy thời gian hiện tại
  
    callApi(
      [
        DashboardRequestApi.timeRequest.postCleaningTime({
          cleanTime: currentTime, // Đúng theo cấu trúc yêu cầu
        }),
      ],
      (res) => {
        toast.success("Vệ sinh cảm biến thành công!");
        setDaysOperated(0); // Reset số ngày vận hành
        setNeedsCleaning(false); // Cập nhật trạng thái không cần vệ sinh
        setIsConfirmModalOpen(false); // Đóng modal xác nhận
      },
      (err) => {
        toast.error("Không thể cập nhật thời gian vệ sinh!");
        console.error("API Error:", err);
      }
    );
  };  

  return (
    <div className="flex max-h-screen bg-[#F2F4F7]">
      <aside>
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col transition-all m-2 rounded-xl items-center w-full mr-2 overflow-hidden max-h-screen mb-2">
        <div className="flex w-[90%] h-32 rounded-xl gap-3 justify-around mt-3">
          <div className="flex flex-col items-center justify-center w-[18%] h-full max-w-[90%] max-h-[90%] rounded-lg  shadow-md   bg-white">
            <h1 className="uppercase text-xl font-semibold  font-sans">Total</h1>
            <span className="font-bold text-5xl">{ponds?.length || 0}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-[20%] h-full max-w-[90%] max-h-[90%] rounded-lg  shadow-md bg-white">
            <h1 className="uppercase text-xl font-semibold font-sans md:text-xl">Active</h1>
            <span className="font-bold text-5xl text-green-600/[.86]">{activePonds}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-[20%] h-full max-w-[90%] max-h-[90%] rounded-lg shadow-md bg-white">
          <div className="text-sm text-gray-700">
            <p className="font-semibold font-sans ">Operating Days: {daysOperated}</p>
            {needsCleaning ? (
              <>
                <p className="text-red-500 font-bold">Cần vệ sinh cảm biến</p>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  onClick={() => setIsConfirmModalOpen(true)}
                ></button>
              </>
            ) : (
                <p className="text-green-500 text-xl font-sans font-semibold">The sensor is operating well</p>            
            )}
          </div>

          </div>
        </div>

        <div className="w-[90%] max-h-[80%] overflow-hidden overflow-y-scroll no-scrollbar rounded-lg p-4 gap-y-3">
          {pondTypes.map((pondType) => {
            const filteredPonds = ponds.filter(
              (pond) => pond.pondTypeName === pondType.pondTypeName
            );

            return (
              <PondSummary
                onPutSucces={fetchData}
                key={pondType.pondTypeId}
                pondTypeName={pondType.pondTypeName}
                ponds={filteredPonds}
                setIsDeleteModal={setIsDeleteModal}
                setIsCreateModal={setIsCreateModal}
                onSelected={handleSelected}
                onDeleteCardSuccess={fetchData}
              />
            );
          })}
        </div>

        <button className="h-10 w-10 right-4 items-center rounded-2xl bottom-5 fixed bg-[#61CBF4]/[.90] flex justify-center">
          <IoMdAdd
            onClick={() => {
              setIsModal(true);
            }}
            className="h-12 text-3xl text-black shadow-lg"
          />
          <div className="flex items-center justify-center text-black font-bold">
            <div
              className={`
                      absolute right-full rounded-md -px-2 -py-1 ml-6 whitespace-nowrap
                      bg-indigo-100 text-indigo-800
                      invisible opacity-20 -translate-x-3 transition-all
                      group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-hover:z-50
                    `}
            >
              Tạo khối
            </div>
          </div>
        </button>

        {isSetTime && (
          <SetTime
            setIsSetTime={setIsSetTime}
            onPostSuccess={fetchData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {isModal && (
          <Modal setIsModal={setIsModal} onPostSuccess={fetchData} />
        )}
        {isDeleteModal && (
          <DeleteModal
            setIsDeleteModal={setIsDeleteModal}
            pondTypeName={selectedPondTypeName}
            onDeleteSuccess={fetchData}
          />
        )}

        {isCreateModal && (
          <CreateModal
            setIsCreateModal={setIsCreateModal}
            onPostSuccess={fetchData}
            pondTypeName={selectedPondTypeName}
          />
        )}

        {showImage && <ImageModal setShowImage={setShowImage} />}

        <div className="fixed top-5 right-5 text-4xl flex gap-x-2">
          <AiOutlineClockCircle
            onClick={() => setIsSetTime(true)}
            className=""
          />
          <FaMapMarkerAlt
            onClick={() => setShowImage(true)}
            className=" text-red-500"
          ></FaMapMarkerAlt>
        </div>
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
            <p className="text-lg font-medium mb-4">
              Bạn có chắc chắn muốn vệ sinh cảm biến?
            </p>
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