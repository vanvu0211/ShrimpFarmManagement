import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer và toast
import 'react-toastify/dist/ReactToastify.css'; // Import CSS cho react-toastify
import Loading from '../../components/Loading';
import useCallApi from '../../hooks/useCallApi';
import { FarmRequestApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function Farm() {
    const [farms, setFarms] = useState([]); // Danh sách trang trại
    const [farmName, setFarmName] = useState(''); // Tên trang trại
    const [farmAddress, setFarmAddress] = useState(''); // Địa chỉ trang trại
    const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

    const callApi = useCallApi();
    const navigate = useNavigate();

    const username = localStorage.getItem('username');

    const handleDeleteFarm = useCallback(
        (farmId) => {
            if (!window.confirm('Bạn có chắc chắn muốn xóa trang trại này?')) {
                return;
            }

            setIsLoading(true);

            callApi(
                [FarmRequestApi.farmRequest.deleteFarm(farmId)],
                () => {
                    setIsLoading(false);
                    toast.success('Xóa trang trại thành công!');
                    setFarms(farms.filter((farm) => farm.farmId !== farmId));
                },
                (err) => {
                    setIsLoading(false);
                    if (err?.response?.data?.title === 'PondType is still exits in Farm') {
                        toast.error('Vẫn còn khối ao ở farm!'); // Thông báo lỗi cụ thể
                    } else {
                        toast.error('Có lỗi xảy ra khi xóa trang trại!');
                    }
                    console.error(err);
                }
            );
        },
        [callApi, farms]
    );



    const fetchFarms = useCallback(() => {
        if (!username) {
            toast.error('Không tìm thấy thông tin người dùng!');
            return;
        }

        callApi(
            [
                FarmRequestApi.farmRequest.getAllFarmByUserName(username),
            ],
            (res) => {
                setFarms(res[0].flat());
            },
            (err) => {
                toast.error('Không thể tải danh sách trang trại!');
                console.error(err);
            }
        );
    }, [callApi, username]);

    const handleAddFarm = useCallback(
        (e) => {
            e.preventDefault();

            if (!farmName.trim() || !farmAddress.trim()) {
                toast.error('Tên trang trại và địa chỉ không được để trống!');
                return;
            }

            const data = {
                farmName: farmName.trim(),
                address: farmAddress.trim(),
                username,
            };
            console.log(data)

            setIsLoading(true);

            callApi(
                [
                    FarmRequestApi.farmRequest.createFarm(data),
                ],
                (res) => {
                    setIsLoading(false);
                    toast.success('Thêm trang trại thành công!');
                    setFarms([...farms, res[0]]); // Thêm trang trại mới vào danh sách
                    setFarmName(''); // Reset tên trang trại
                    setFarmAddress(''); // Reset địa chỉ
                },
                (err) => {
                    setIsLoading(false);
                    toast.error('Có lỗi xảy ra khi thêm trang trại!');
                    console.error(err);
                }
            );
        },
        [farmName, farmAddress, farms, username, callApi]
    );

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    return (
        <div className="flex max-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
            {/* Sidebar */}
            <aside>
                <Sidebar />
            </aside>

            <main className="w-full mx-auto mt-16 sm:mt-0 max-w-2xl overflow-y-auto overflow-hidden no-scrollbar  p-4 sm:p-6 lg:p-8 transition-all duration-300">
                <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 sm:mb-8">
                    Thông tin trang trại
                </h1>

                {/* Form thêm trang trại */}
                <form onSubmit={handleAddFarm} className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
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

                {/* Danh sách trang trại */}
                <h2 className="text-lg sm:text-xl font-bold text-teal-700 mb-4 sm:mb-6">
                    Danh sách trang trại
                </h2>
                <ul className="space-y-4">
                    {farms.length === 0 ? (
                        <p className="text-gray-500 text-center">Chưa có trang trại nào.</p>
                    ) : (
                        farms.map((farm, index) => (
                            <li
                                key={index}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <div
                                    className="cursor-pointer text-teal-600 hover:text-teal-800 font-semibold hover:underline mb-2 sm:mb-0"
                                    onClick={() => {
                                        localStorage.setItem('farmName', farm.farmName);
                                        localStorage.setItem('farmId', String(farm.farmId)); // Lưu farmName vào localStorage
                                        navigate('/dashboard');
                                    }}
                                >
                                    <span className="block sm:inline">{farm.farmName}</span>
                                    <span className="block sm:inline sm:ml-2 text-gray-600 font-normal">
                                        - {farm.address}
                                    </span>
                                </div>
                                <button
                                    className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md hover:shadow-lg transition-all duration-300"
                                    onClick={() => handleDeleteFarm(farm.farmName)}
                                >
                                    Xóa
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </main>
            {/* Hiển thị loading */}
            {isLoading && <Loading />}

            {/* ToastContainer */}
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
