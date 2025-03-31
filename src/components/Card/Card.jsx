import React, { useState, useCallback, useEffect } from 'react';
import { FaEllipsisV, FaTrash, FaExchangeAlt, FaPlay, FaInfo, FaLeaf } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useCallApi from '../../hooks/useCallApi';
import { HarvestRequest, DashboardRequestApi, MachineRequestApi } from '../../services/api';
import DeleteCard from '../DeleteCard';
import ActiveCard from '../../components/ActiveCard';
import { FaShrimp } from "react-icons/fa6";
import { BsDroplet } from 'react-icons/bs';
import useSignalR from '../../hooks/useSignalR';

function Card({ pondId, pondName, pondTypeId, status, onDeleteCardSuccess, onPutSucces }) {
    const [isActiveModal, setIsActiveModal] = useState(false);
    const [isDeleteCard, setIsDeleteCard] = useState(false);
    const [harvestTime, setHarvestTime] = useState(0);
    const [daysSinceStart, setDaysSinceStart] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [machineData, setMachineData] = useState([]);
    const [updatedMachineId, setUpdatedMachineId] = useState(null);
    const farmId = Number(localStorage.getItem('farmId'));

    const navigate = useNavigate();
    const callApi = useCallApi();

    const machineNameMapping = {
        'Oxi': 'Máy quạt oxi',
        'Waste_separator': 'Máy lọc phân',
        'Fan1': 'Máy quạt 1',
        'Fan2': 'Máy quạt 2',
        'Fan3': 'Máy quạt 3'
    };

    const handleMachineStatusChanged = useCallback((data) => {
        setMachineData(prevData => {
            const updatedData = [...prevData];
            const machineIndex = updatedData.findIndex(m => 
                machineNameMapping[data.Name] === m.machineName || data.Name === m.machineName
            );
            
            if (machineIndex !== -1) {
                updatedData[machineIndex] = {
                    ...updatedData[machineIndex],
                    machineStatus: data.Value === 'ON'
                };
                setUpdatedMachineId(updatedData[machineIndex].machineId);
                setTimeout(() => setUpdatedMachineId(null), 1000);
            } else {
                console.warn(`Machine ${data.Name} not found in current data`);
            }
            return updatedData;
        });
    }, []);

    const { isConnected } = useSignalR(handleMachineStatusChanged);

    const harvestData = useCallback(() => {
        callApi(
            [HarvestRequest.HarvestRequestApi.getHarvestTime(pondId)],
            (res) => setHarvestTime(res[0].harvestTime),
            (err) => console.error('Error fetching harvest data:', err)
        );
    }, [callApi, pondId]);

    const fetchData = useCallback(() => {
        callApi(
            [DashboardRequestApi.pondRequest.getPondRequestById(pondId, farmId)],
            (res) => {
                const startDate = new Date(res[0][0].startDate);
                if (!isNaN(startDate)) {
                    const currentDate = new Date();
                    const daysDifference = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
                    setDaysSinceStart(daysDifference);
                } else {
                    setDaysSinceStart(0);
                }
            },
            (err) => console.error('Error fetching pond data:', err)
        );
    }, [callApi, pondId, farmId]);

    const fetchMachineData = useCallback(() => {
        callApi(
            [MachineRequestApi.machineRequest.getAllMachineByPondId(pondId)],
            (res) => {
                const mappedData = res[0].machineDatas.map(machine => ({
                    ...machine,
                    machineName: machineNameMapping[machine.machineName] || machine.machineName
                }));
                setMachineData(mappedData);
            },
            (err) => {
                console.error('Error fetching machine data:', err);
                setMachineData([]);
            }
        );
    }, [callApi, pondId]);

    useEffect(() => {
        harvestData();
        fetchData();
        fetchMachineData();
    }, [harvestData, fetchData, fetchMachineData]);

    useEffect(() => {
        console.log('SignalR connection status:', isConnected);
    }, [isConnected]);

    // Các hàm xử lý sự kiện giao diện (giữ nguyên)
    const handleHarvestClick = () => {
        navigate('/harvest', { state: { pondId } });
        setIsMenuOpen(false);
    };

    const handleTransferClick = () => {
        navigate('/transfer', { state: { pondId } });
        setIsMenuOpen(false);
    };

    const handleShrimpClick = () => {
        navigate('/shrimpmanagement', { state: { pondId, pondTypeId } });
        setIsMenuOpen(false);
    };

    const handleInfoClick = () => {
        navigate('/info', { state: { pondId, pondTypeId } });
        setIsMenuOpen(false);
    };

    const handleWaterClick = () => {
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
    };

    const renderMachineStatus = () => {
        const sortedMachines = [...machineData].sort((a, b) => {
            if (a.machineName === 'Máy lọc phân') return 1;
            if (b.machineName === 'Máy lọc phân') return -1;
            return 0;
        });

        const machinesToShow = sortedMachines.slice(0, 3);
        
        return (
            <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                    {machinesToShow.slice(0, 2).map((machine) => (
                        <motion.div
                            key={machine.machineId}
                            className="text-center py-2 text-sm font-medium rounded-md"
                            animate={{
                                backgroundColor: machine.machineStatus ? '#DCFCE7' : '#FEE2E2',
                                color: machine.machineStatus ? '#166534' : '#991B1B',
                                scale: updatedMachineId === machine.machineId ? [1, 1.05, 1] : 1
                            }}
                            transition={{ 
                                color: { duration: 0.3 },
                                backgroundColor: { duration: 0.3 },
                                scale: { duration: 0.5 }
                            }}
                        >
                            {machine.machineName}
                        </motion.div>
                    ))}
                    {machinesToShow.length < 2 && Array(2 - machinesToShow.length).fill().map((_, index) => (
                        <div
                            key={`placeholder-${index}`}
                            className="text-center py-2 text-sm font-medium bg-gray-200 text-gray-600 rounded-md"
                        >
                            N/A
                        </div>
                    ))}
                </div>
                {machinesToShow.length >= 3 && (
                    <motion.div
                        className="mt-2 text-center py-2 text-sm font-medium rounded-md"
                        animate={{
                            backgroundColor: machinesToShow[2].machineStatus ? '#DCFCE7' : '#FEE2E2',
                            color: machinesToShow[2].machineStatus ? '#166534' : '#991B1B',
                            scale: updatedMachineId === machinesToShow[2].machineId ? [1, 1.05, 1] : 1
                        }}
                        transition={{ 
                            color: { duration: 0.3 },
                            backgroundColor: { duration: 0.3 },
                            scale: { duration: 0.5 }
                        }}
                    >
                        {machinesToShow[2].machineName}
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            className="w-60 bg-white rounded-xl shadow-lg overflow-hidden m-4 transition-transform transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className={`flex justify-between items-center z-0 p-3 ${status ? 'bg-blue-500' : 'bg-gray-400'}`}>
                <h1 className="text-white text-xl font-bold">{pondName}</h1>
                <div className="text-white text-right">
                    <p className="text-lg font-semibold">{daysSinceStart} ngày</p>
                    <p className="text-sm">{harvestTime} vụ</p>
                </div>
            </div>

            {renderMachineStatus()}

            <div className="flex justify-between items-center p-3 border-t bg-gray-50">
                {status ? (
                    <div className="flex space-x-2 mx-auto">
                        <button
                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                            onClick={handleWaterClick}
                            data-tooltip-id={`harvest-${pondId}`}
                        >
                            <BsDroplet size={16} />
                        </button>
                        <button
                            className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                            onClick={handleInfoClick}
                            data-tooltip-id={`info-${pondId}`}
                        >
                            <FaInfo size={16} />
                        </button>
                        <button
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            onClick={() => setIsDeleteCard(true)}
                            data-tooltip-id={`delete-${pondId}`}
                        >
                            <FaTrash size={16} />
                        </button>
                        <div className="relative z-10">
                            <button
                                className="p-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                                onClick={toggleMenu}
                                data-tooltip-id={`more-${pondId}`}
                            >
                                <FaEllipsisV size={16} />
                            </button>
                            {isMenuOpen && (
                                <motion.div
                                    className="absolute right-0 bottom-14 mt-2 bg-white shadow-lg rounded-md p-2 z-0 border w-48"
                                    variants={menuVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <button
                                        className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                                        onClick={handleHarvestClick}
                                    >
                                        <FaLeaf className="mr-2" size={16} /> Thu hoạch
                                    </button>
                                    <button
                                        className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                                        onClick={handleTransferClick}
                                    >
                                        <FaExchangeAlt className="mr-2" size={16} /> Chuyển ao
                                    </button>
                                    <button
                                        className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                                        onClick={handleShrimpClick}
                                    >
                                        <FaShrimp className="mr-2" size={16} /> Thông tin tôm
                                    </button>
                                </motion.div>
                            )}
                        </div>
                        <ReactTooltip id={`info-${pondId}`} place="bottom" content="Thông tin ao" />
                        <ReactTooltip id={`harvest-${pondId}`} place="top" content="Thông số môi trường" />
                        <ReactTooltip id={`delete-${pondId}`} place="top" content="Xóa ao" />
                    </div>
                ) : (
                    <div className="flex space-x-2 w-full">
                        <button
                            className="flex-1 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-semibold"
                            onClick={() => setIsActiveModal(true)}
                        >
                            <FaPlay className="inline mr-1" /> Kích hoạt
                        </button>
                        <button
                            className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                            onClick={handleInfoClick}
                            data-tooltip-id={`info-${pondId}`}
                        >
                            <FaInfo size={16} />
                        </button>
                        <button
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            onClick={() => setIsDeleteCard(true)}
                            data-tooltip-id={`delete-${pondId}`}
                        >
                            <FaTrash size={16} />
                        </button>
                        <ReactTooltip id={`delete-${pondId}`} place="top" content="Xóa ao" />
                        <ReactTooltip id={`info-${pondId}`} place="bottom" content="Thông tin ao" />
                    </div>
                )}
            </div>

            {isDeleteCard && (
                <DeleteCard
                    pondId={pondId}
                    pondName={pondName}
                    setIsDeleteCard={setIsDeleteCard}
                    onDeleteCardSuccess={onDeleteCardSuccess}
                />
            )}
            {isActiveModal && (
                <ActiveCard
                    setIsActiveModal={setIsActiveModal}
                    onDeleteCardSuccess={onPutSucces}
                    pondId={pondId}
                />
            )}
        </motion.div>
    );
}

export default Card;