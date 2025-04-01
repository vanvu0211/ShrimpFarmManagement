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
        machineNameMapping[data.Name] === m.machineName
      );

      if (machineIndex !== -1) {
        updatedData[machineIndex] = {
          ...updatedData[machineIndex],
          machineStatus: data.Value === 'ON'
        };
        setUpdatedMachineId(updatedData[machineIndex].machineId);
        setTimeout(() => setUpdatedMachineId(null), 1000);
      }
      return updatedData;
    });
  }, []);

  useSignalR(handleMachineStatusChanged);

  const harvestData = useCallback(() => {
    callApi(
      [HarvestRequest.HarvestRequestApi.getHarvestTime(pondId)],
      (res) => {
        setHarvestTime(res[0].harvestTime);
      },
    );
  }, [callApi, pondId]);

  const fetchData = useCallback(() => {
    callApi([
      DashboardRequestApi.pondRequest.getPondRequestById(pondId, farmId),
    ],
      (res) => {
        const startDate = new Date(res[0][0].startDate);
        if (!isNaN(startDate)) {
          const currentDate = new Date();
          const timeDifference = currentDate - startDate;
          const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          setDaysSinceStart(daysDifference);
        } else {
          setDaysSinceStart(0);
        }
      },
      (err) => {
        console.error(err);
      });
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
    navigate('/evista', { state: { pondId, pondTypeId } });
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
          {machinesToShow.slice(0, 2).map((machine, index) => (
            <motion.div
              key={machine.machineId}
              className="text-center py-2 text-sm font-medium rounded-md"
              animate={{
                backgroundColor: machine.machineStatus
                  ? '#DCFCE7'
                  : '#FEE2E2',
                color: machine.machineStatus
                  ? '#166534'
                  : '#991B1B',
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
          {machinesToShow.length < 3 && Array(3 - machinesToShow.length).fill().map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="text-center py-2 text-sm personally font-medium bg-gray-200 text-gray-600 rounded-md"
            >
              N/A
            </div>
          ))}
        </div>
        {machinesToShow.length >= 3 && (
          <motion.div
            className="mt-2 text-center py-2 text-sm font-medium rounded-md"
            animate={{
              backgroundColor: machinesToShow[2].machineStatus
                ? '#DCFCE7'
                : '#FEE2E2',
              color: machinesToShow[2].machineStatus
                ? '#166534'
                : '#991B1B',
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
          <div className="flex space-x-1 mx-auto">
            <button
              className="p-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors flex items-center justify-center"
              onClick={handleWaterClick}
              data-tooltip-id={`envir-${pondId}`}
            >
              <BsDroplet size={16} />
            </button>
            <button
              className="p-2 bg-green-400 text-white rounded-md hover:bg-green-500 transition-colors flex items-center justify-center"
              onClick={handleHarvestClick}
              data-tooltip-id={`harvest-${pondId}`}
            >
              <FaLeaf size={16} />
            </button>
            <button
              className="p-2 bg-purple-400 text-white rounded-md hover:bg-purple-500 transition-colors flex items-center justify-center"
              onClick={handleTransferClick}
              data-tooltip-id={`transfer-${pondId}`}
            >
              <FaExchangeAlt size={16} />
            </button>
              <button
              className="p-2 bg-teal-400 text-white rounded-md hover:bg-teal-500 transition-colors flex items-center justify-center"
              onClick={handleShrimpClick}
              data-tooltip-id={`shrimp-${pondId}`}
            >
              <FaShrimp size={16} />
            </button>

            <button
              className="p-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors flex items-center justify-center"
              onClick={handleInfoClick}
              data-tooltip-id={`info-${pondId}`}
            >
              <FaInfo size={16} />
            </button>
            <button
              className="p-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors flex items-center justify-center"
              onClick={() => setIsDeleteCard(true)}
              data-tooltip-id={`delete-${pondId}`}
            >
              <FaTrash size={16} />
            </button>
            <ReactTooltip id={`envir-${pondId}`} place="top" content="Thông số môi trường" />
      <ReactTooltip id={`info-${pondId}`} place="top" content="Thông tin ao" />
      <ReactTooltip id={`delete-${pondId}`} place="top" content="Xóa ao" />
      <ReactTooltip id={`harvest-${pondId}`} place="top" content="Thu hoạch" />
      <ReactTooltip id={`transfer-${pondId}`} place="top" content="Chuyển ao" />
      <ReactTooltip id={`shrimp-${pondId}`} place="top" content="Thông tin tôm" />
          </div>


        ) : (
          <div className="flex space-x-1 w-full">
            <button
              className="flex-1  bg-green-400 text-white rounded-md hover:bg-green-500 transition-colors text-sm font-semibold"
              onClick={() => setIsActiveModal(true)}
            >
              <FaPlay className="inline " /> Kích hoạt
            </button>
            <button
            className="p-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors flex items-center justify-center"
              onClick={handleInfoClick}
              data-tooltip-id={`info-${pondId}`}
            >
              <FaInfo size={16} />
            </button>
            <button
              className="p-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors flex items-center justify-center"
              onClick={() => setIsDeleteCard(true)}
              data-tooltip-id={`delete-${pondId}`}
            >
              <FaTrash size={16} />
            </button>
            <ReactTooltip id={`delete-${pondId}`} place="top" content="Xóa ao" />
            <ReactTooltip id={`info-${pondId}`} place="top" content="Thông tin ao" />
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