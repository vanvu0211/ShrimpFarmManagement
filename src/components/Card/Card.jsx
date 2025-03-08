import React, { useState, useCallback, useEffect } from 'react';
import { FaEllipsisV, FaTrash, FaPlay, FaLeaf } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useCallApi from '../../hooks/useCallApi';
import { HarvestRequest, DashboardRequestApi } from '../../services/api';
import DeleteCard from '../DeleteCard';
import ActiveCard from '../../components/ActiveCard';

function Card({ pondId, status, onDeleteCardSuccess, onPutSucces }) {
  const [isActiveModal, setIsActiveModal] = useState(false);
  const [isDeleteCard, setIsDeleteCard] = useState(false);
  const [harvestTime, setHarvestTime] = useState(0);
  const [daysSinceStart, setDaysSinceStart] = useState(0);

  const navigate = useNavigate();
  const callApi = useCallApi();

  const harvestData = useCallback(() => {
    callApi(
      [HarvestRequest.HarvestRequestApi.getHarvestTime(pondId)],
      (res) => {
        setHarvestTime(res[0].harvestTime);
      },
    );
  }, [callApi, pondId]);

  const fetchData = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestById(pondId)],
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
        console.error('Error fetching pond data:', err.response?.data?.title || 'Unknown error');
      }
    );
  }, [callApi, pondId]);

  useEffect(() => {
    harvestData();
    fetchData();
  }, [harvestData, fetchData]);

  const handleHarvestClick = () => {
    navigate('/harvest', { state: { pondId } });
  };

  return (
    <motion.div
      className="w-60 bg-white rounded-xl shadow-lg overflow-hidden m-4 transition-transform transform hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center p-3 ${
          status ? 'bg-blue-500' : 'bg-gray-400'
        }`}
      >
        <h1 className="text-white text-xl font-bold">{pondId}</h1>
        <div className="text-white text-right">
          <p className="text-lg font-semibold">{daysSinceStart} days</p>
          <p className="text-sm">{harvestTime} crop</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`text-center py-2 text-sm font-medium ${
              status ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-600'
            } rounded-md`}
          >
            L2
          </div>
          <div
            className={`text-center py-2 text-sm font-medium ${
              status ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-600'
            } rounded-md`}
          >
            QB2
          </div>
        </div>
        <div className="mt-2">
          <div
            className={`text-center py-2 text-sm font-medium ${
              status ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
            } rounded-md`}
          >
            L2
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-3 border-t bg-gray-50">
        {status ? (
          <div className="flex space-x-2">
            <button
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              onClick={handleHarvestClick}
              data-tooltip-id={`harvest-${pondId}`}
            >
              <FaLeaf size={16} />
            </button>
            <button
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              onClick={() => setIsDeleteCard(true)}
              data-tooltip-id={`delete-${pondId}`}
            >
              <FaTrash size={16} />
            </button>
            <ReactTooltip id={`harvest-${pondId}`} content="Thu hoạch" />
            <ReactTooltip id={`delete-${pondId}`} content="Xóa ao" />
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
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              onClick={() => setIsDeleteCard(true)}
              data-tooltip-id={`delete-${pondId}`}
            >
              <FaTrash size={16} />
            </button>
            <ReactTooltip id={`delete-${pondId}`} content="Xóa ao" />
          </div>
        )}
      </div>

      {/* Modals */}
      {isDeleteCard && (
        <DeleteCard
          pondId={pondId}
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