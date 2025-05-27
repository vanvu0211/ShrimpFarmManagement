import React, { useState, useCallback, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../components/Loading";
import useCallApi from "../../hooks/useCallApi";
import { FarmRequestApi } from "../../services/api";
import { DashboardRequestApi } from "../../services/api";
import { useNavigate } from "react-router-dom";
import MemberModal from "../../components/MemberModal";
import { Users, Trash2, Edit2 } from "lucide-react";
import Modal from "react-modal";

Modal.setAppElement("#root");

function Farm() {
  const [farms, setFarms] = useState([]);
  const [farmName, setFarmName] = useState("");
  const [farmAddress, setFarmAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentFarmId, setCurrentFarmId] = useState(localStorage.getItem("farmId"));
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [members, setMembers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFarm, setEditFarm] = useState({ farmId: null, farmName: "", address: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  const callApi = useCallApi();
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  // Check if user is admin
  const checkAdminStatus = useCallback(() => {
    setIsLoading(true);
    callApi(
      [DashboardRequestApi.authRequest.isAdmin()],
      (res) => {
        setIsAdmin(res[0]?.isAdmin || false);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error checking admin status:", err);
        toast.error("Không thể kiểm tra quyền Admin!");
        setIsAdmin(false);
        setIsLoading(false);
      }
    );
  }, [callApi]);

  const fetchMembers = useCallback(
    (farmId) => {
      setIsLoading(true);
      callApi(
        [FarmRequestApi.farmRequest.getMember(farmId)],
        (res) => {
          setMembers(res[0] || []);
          setIsLoading(false);
        },
        (err) => {
          toast.error("Không thể tải danh sách thành viên!");
          setIsLoading(false);
        }
      );
    },
    [callApi]
  );

  const handleOpenMemberModal = useCallback(
    (farm) => {
      setSelectedFarm(farm);
      fetchMembers(farm.farmId);
      setIsMemberModalOpen(true);
    },
    [fetchMembers]
  );

  const handleCloseMemberModal = useCallback(
    (refresh = false) => {
      setIsMemberModalOpen(false);
      setSelectedFarm(null);
      setMembers([]);
      if (refresh) {
        fetchMembers(selectedFarm?.farmId);
      }
    },
    [selectedFarm, fetchMembers]
  );

  const handleOpenEditModal = useCallback((farm) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền sửa trang trại!");
      return;
    }
    setEditFarm({
      farmId: farm.farmId,
      farmName: farm.farmName,
      address: farm.address,
    });
    setIsEditModalOpen(true);
  }, [isAdmin]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditFarm({ farmId: null, farmName: "", address: "" });
  }, []);

  const handleUpdateFarm = useCallback(
    (e) => {
      e.preventDefault();
      if (!editFarm.farmName.trim() || !editFarm.address.trim()) {
        toast.error("Tên trang trại và địa chỉ không được để trống!");
        return;
      }
      const data = {
        farmId: editFarm.farmId,
        farmName: editFarm.farmName.trim(),
        address: editFarm.address.trim(),
      };
      setIsLoading(true);
      callApi(
        [FarmRequestApi.farmRequest.updateFarm(data)],
        (res) => {
          setIsLoading(false);
          toast.success("Cập nhật trang trại thành công!");
          const updatedFarms = farms.map((farm) =>
            farm.farmId === editFarm.farmId
              ? { ...farm, farmName: editFarm.farmName, address: editFarm.address }
              : farm
          );
          setFarms(updatedFarms);
          if (String(editFarm.farmId) === currentFarmId) {
            localStorage.setItem("farmName", editFarm.farmName);
          }
          handleCloseEditModal();
        },
        (err) => {
          setIsLoading(false);
          let errorMessage = "Có lỗi xảy ra khi cập nhật trang trại!";
          if (err.response) {
            const { status, data } = err.response;
            if (status === 400) {
              errorMessage = data.title || data.message || "Yêu cầu không hợp lệ!";
            } else if (status === 401) {
              errorMessage = "Bạn không có quyền cập nhật trang trại này!";
            } else if (status === 404) {
              errorMessage = "Không tìm thấy trang trại!";
            } else {
              errorMessage = "Lỗi máy chủ, vui lòng thử lại sau!";
            }
          } else if (err.message) {
            errorMessage = err.message;
          }
          toast.error(errorMessage);
          console.error("Lỗi khi cập nhật trang trại:", err);
        }
      );
    },
    [callApi, editFarm, farms, currentFarmId, handleCloseEditModal]
  );

  const handleDeleteFarm = useCallback(
    (farmId) => {
      if (!isAdmin) {
        toast.error("Bạn không có quyền xóa trang trại!");
        return;
      }
      if (!window.confirm("Bạn có chắc chắn muốn xóa trang trại này?")) {
        return;
      }
      setIsLoading(true);
      callApi(
        [FarmRequestApi.farmRequest.deleteFarm(farmId, email)],
        (res) => {
          setIsLoading(false);
          if (res[0] && res[0].success === false) {
            return;
          }
          toast.success("Xóa trang trại thành công!");
          const updatedFarms = farms.filter((farm) => farm.farmId !== farmId);
          setFarms(updatedFarms);
          if (updatedFarms.length > 0) {
            if (String(farmId) === currentFarmId) {
              const firstFarm = updatedFarms[0];
              localStorage.setItem("farmId", String(firstFarm.farmId));
              localStorage.setItem("farmName", firstFarm.farmName);
              setCurrentFarmId(String(firstFarm.farmId));
            }
          } else {
            localStorage.removeItem("farmId");
            localStorage.removeItem("farmName");
            setCurrentFarmId(null);
            toast.info("Không còn trang trại nào, chuyển về trang đăng nhập.");
            navigate("/");
          }
        },
        (err) => {
          setIsLoading(false);
          let errorMessage = "Có lỗi xảy ra khi xóa trang trại!";
          if (err.response) {
            const { status, data } = err.response;
            if (status === 400) {
              errorMessage = data.title || data.message || "Yêu cầu không hợp lệ!";
            } else if (status === 401) {
              errorMessage = "Bạn không có quyền xóa trang trại này!";
            } else if (status === 404) {
              errorMessage = "Không tìm thấy trang trại!";
            } else {
              errorMessage = "Lỗi máy chủ, vui lòng thử lại sau!";
            }
          } else if (err.message) {
            errorMessage = err.message;
          }
          console.error("Lỗi khi xóa trang trại:", err);
          toast.error(errorMessage);
        }
      );
    },
    [callApi, farms, email, currentFarmId, navigate, isAdmin]
  );

  const fetchFarms = useCallback(() => {
    if (!email) {
      toast.error("Không tìm thấy thông tin người dùng!");
      return;
    }
    setIsLoading(true);
    callApi(
      [FarmRequestApi.farmRequest.getAllFarmByEmail(email)],
      (res) => {
        const farmData = res[0] && Array.isArray(res[0]) ? res[0].flat() : [];
        setFarms(farmData);
        setIsLoading(false);
        if (!currentFarmId && farmData.length > 0) {
          const firstFarm = farmData[0];
          localStorage.setItem("farmId", String(firstFarm.farmId));
          localStorage.setItem("farmName", firstFarm.farmName);
          setCurrentFarmId(String(firstFarm.farmId));
        }
      },
      (err) => {
        toast.error("Không thể tải danh sách trang trại!");
        console.error(err);
        setIsLoading(false);
      }
    );
  }, [callApi, email, currentFarmId]);

  const handleAddFarm = useCallback(
    (e) => {
      e.preventDefault();
      if (!isAdmin) {
        toast.error("Bạn không có quyền tạo trang trại!");
        return;
      }
      if (!farmName.trim() || !farmAddress.trim()) {
        toast.error("Tên trang trại và địa chỉ không được để trống!");
        return;
      }
      const data = {
        farmName: farmName.trim(),
        address: farmAddress.trim(),
        email,
      };
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setIsLoading(false);
        toast.error("Yêu cầu tạo trang trại mất quá nhiều thời gian!");
        console.error("useCallApi timeout for createFarm");
      }, 5000);
      callApi(
        [FarmRequestApi.farmRequest.createFarm(data)],
        (res) => {
          clearTimeout(timeout);
          setIsLoading(false);
          if (res[0] && res[0].success === false) {
            toast.error(res[0].message || "Thêm trang trại không thành công!");
            return;
          }
          const newFarm = res[0];
          if (!newFarm.farmId) {
            fetchFarms();
            return;
          }
          toast.success("Thêm trang trại thành công!");
          setFarms([...farms, newFarm]);
          setFarmName("");
          setFarmAddress("");
          localStorage.setItem("farmId", String(newFarm.farmId));
          localStorage.setItem("farmName", newFarm.farmName);
          setCurrentFarmId(String(newFarm.farmId));
        },
        (err) => {
          clearTimeout(timeout);
          setIsLoading(false);
          const errorMsg = err?.responseData?.title || err?.responseData?.message || "Có lỗi xảy ra khi thêm trang trại!";
          toast.error(errorMsg);
          console.error(err);
        }
      );
    },
    [farmName, farmAddress, farms, email, callApi, fetchFarms, isAdmin]
  );

  useEffect(() => {
    fetchFarms();
    checkAdminStatus();
  }, [fetchFarms, checkAdminStatus]);

  return (
    <div className="flex max-h-screen bg-gradient-to-br  from-teal-100 to-gray-100/40">
      <aside>
        <Sidebar />
      </aside>

      <main className="w-full mx-auto mt-16 sm:mt-0 max-w-4xl overflow-y-auto overflow-hidden no-scrollbar p-4 sm:p-6 lg:p-8 transition-all duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 sm:mb-8">
          Thông tin trang trại
        </h1>

        {isAdmin ? (
          <form
            onSubmit={handleAddFarm}
            className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="mb-4 sm:mb-6">
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="farmName">
                Trang trại
              </label>
              <input
                id="farmName"
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="Tên trang trại"
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-teal-800 font-semibold mb-2" htmlFor="farmAddress">
                Địa chỉ
              </label>
              <input
                id="farmAddress"
                type="text"
                value={farmAddress}
                onChange={(e) => setFarmAddress(e.target.value)}
                placeholder="Địa chỉ trang trại"
                className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Thêm trang trại
            </button>
          </form>
        ) : (
          <p className="text-red-500 mb-6 sm:mb-8">
            Chỉ Admin mới có quyền tạo trang trại.
          </p>
        )}

        <h2 className="text-lg sm:text-xl font-bold text-teal-700 mb-4 sm:mb-6">
          Danh sách trang trại
        </h2>
        <ul className="space-y-4">
          {farms.length === 0 && !isLoading ? (
            <p className="text-gray-500 text-center">Chưa có trang trại nào.</p>
          ) : (
            farms.map((farm, index) => (
              <li
                key={farm.farmId || index}
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${
                  String(farm.farmId) === currentFarmId
                    ? "border-2 border-teal-500 bg-teal-100"
                    : "bg-white"
                }`}
              >
                <div
                  className="cursor-pointer text-teal-600 hover:text-teal-800 font-semibold hover:underline mb-2 sm:mb-0 flex-grow mr-4"
                  onClick={() => {
                    if (!farm.farmId) {
                      toast.error("Trang trại không có farmId hợp lệ!");
                      return;
                    }
                    localStorage.setItem("farmName", farm.farmName);
                    localStorage.setItem("farmId", String(farm.farmId));
                    setCurrentFarmId(String(farm.farmId));
                    navigate("/dashboard");
                  }}
                >
                  <span className="block sm:inline">{farm.farmName}</span>
                  <span className="block sm:inline sm:ml-2 text-gray-600 font-normal">
                    - {farm.address}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenMemberModal(farm)}
                    className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    title="Xem thành viên"
                  >
                    <Users size={20} />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(farm)}
                    className={`p-2 rounded-lg ${
                      isAdmin
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title="Sửa trang trại"
                    disabled={!isAdmin}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteFarm(farm.farmId)}
                    className={`p-2 rounded-lg sm:px-4 sm:py-2 ${
                      isAdmin
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title="Xóa trang trại"
                    disabled={!isAdmin}
                  >
                    <Trash2 size={20} className="sm:hidden" />
                    <span className="hidden sm:inline">Xóa</span>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </main>

      {isLoading && <Loading />}

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={handleCloseMemberModal}
        members={members}
        farmId={selectedFarm?.farmId}
        callApi={callApi}
        FarmRequestApi={FarmRequestApi}
        isAdmin={isAdmin} // Pass isAdmin to MemberModal
      />

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={handleCloseEditModal}
        className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold text-teal-700 mb-4">Sửa thông tin trang trại</h2>
        <form onSubmit={handleUpdateFarm}>
          <div className="mb-4">
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="editFarmName">
              Tên trang trại
            </label>
            <input
              id="editFarmName"
              type="text"
              value={editFarm.farmName}
              onChange={(e) => setEditFarm({ ...editFarm, farmName: e.target.value })}
              placeholder="Tên trang trại"
              className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-teal-800 font-semibold mb-2" htmlFor="editFarmAddress">
              Địa chỉ
            </label>
            <input
              id="editFarmAddress"
              type="text"
              value={editFarm.address}
              onChange={(e) => setEditFarm({ ...editFarm, address: e.target.value })}
              placeholder="Địa chỉ trang trại"
              className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseEditModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </Modal>

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
}

export default Farm;