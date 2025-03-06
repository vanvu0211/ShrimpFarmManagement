import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer và toast
import 'react-toastify/dist/ReactToastify.css'; // Import CSS cho react-toastify
import Loading from '../../components/Loading';
import useCallApi from '../../hooks/useCallApi';
import { FarmRequestApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function Status() {
    const [farms, setFarms] = useState([]); // Danh sách trang trại
    const [farmName, setFarmName] = useState(''); // Tên trang trại
    const [farmAddress, setFarmAddress] = useState(''); // Địa chỉ trang trại
    const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

    const callApi = useCallApi();
    const navigate = useNavigate();

    const username = localStorage.getItem('username');

    const handleDeleteFarm = useCallback(
        (farmName) => {
            if (!window.confirm('Bạn có chắc chắn muốn xóa trang trại này?')) {
                return;
            }
    
            setIsLoading(true);
            console.log(farmName)

            callApi(
                [FarmRequestApi.farmRequest.deleteFarm(username ,farmName)],
                () => {
                    setIsLoading(false);
                    toast.success('Xóa trang trại thành công!');
                    setFarms(farms.filter((farm) => farm.farmName !== farmName));
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
        <div className="flex max-h-screen">
            {/* Sidebar */}
            {/* <aside>
                <Sidebar />
            </aside> */}

            <div className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-6">Thông tin trang trại</h1>

                {/* Form thêm trang trại */}
                <form onSubmit={handleAddFarm} className="mb-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="farmName">
                            Trang trại
                        </label>
                        <input
                            id="farmName"
                            type="text"
                            value={farmName}
                            onChange={(e) => setFarmName(e.target.value)}
                            placeholder="Tên trang trại"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="farmAddress">
                            Địa chỉ
                        </label>
                        <input
                            id="farmAddress"
                            type="text"
                            value={farmAddress}
                            onChange={(e) => setFarmAddress(e.target.value)}
                            placeholder="Địa chỉ trang trại"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
                    >
                        Thêm trang trại
                    </button>
                </form>

                <h2 className="text-lg font-bold mb-4">Danh sách trang trại</h2>
                <ul className="list-none space-y-4">
                    {farms.map((farm, index) => (
                        <li
                            key={index}
                            className="flex justify-between items-center p-4 bg-white shadow-md rounded-lg hover:shadow-lg"
                        >
                            <div
                                className="cursor-pointer text-blue-600 hover:underline"
                                onClick={() => {
                                    localStorage.setItem('farmName', farm.farmName); // Lưu farmName vào localStorage
                                    navigate('/dashboard');
                                }}
                            >
                                <span className="font-semibold">{farm.farmName}</span> - {farm.address}
                            </div>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
                                onClick={() => handleDeleteFarm(farm.farmName)}
                            >
                                Xóa
                            </button>
                        </li>
                    ))}
                </ul>


            </div>

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

export default Status;
