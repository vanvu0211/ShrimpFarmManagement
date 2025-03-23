import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';
import { FaPlus, FaTrash, FaExpand } from 'react-icons/fa';
import Chart from 'react-apexcharts';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { DashboardRequestApi } from '../../services/api';
import useCallApi from '../../hooks/useCallApi';
import { IoCloseSharp } from "react-icons/io5";

function Evista() {
  const navigate = useNavigate();
  const [selectedPondType, setSelectedPondType] = useState(null);
  const [pondOptions, setPondOptions] = useState([]);
  const [pondTypes, setPondTypes] = useState([]);
  const [selectedPond, setSelectedPond] = useState(null);
  const [selectedPonds, setSelectedPonds] = useState([]);
  const [pondData, setPondData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const callApi = useCallApi();
  const farmId = Number(localStorage.getItem('farmId'));
  const dateInputRef = useRef(null);

  const [chartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'line',
        height: '100%',
        zoom: { enabled: true, type: 'x' },
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        toolbar: { show: true },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: { colors: '#64748b', fontSize: '12px' },
          trim: true,
        },
      },
      yaxis: {
        title: { text: '' },
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
      },
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
      stroke: { curve: 'smooth', width: 2 },
      grid: { borderColor: '#e2e8f0' },
      annotations: { yaxis: [] },
      tooltip: { theme: 'dark', x: { show: true } },
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [activePondName, setActivePondName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (e) => {
    setStartDate(new Date(e.target.value));
  };

  const handleEndDateChange = (e) => {
    setEndDate(new Date(e.target.value));
  };

  const parameterLimits = {
    Ph: { min: 7.5, max: 8.5 },
    O2: { min: 3.0, max: 7.0 },
    Temperature: { min: 25, max: 33 },
    NH3: { min: 0, max: 0.1 },
    NO2: { min: 0, max: 1.0 },
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = '.apexcharts-toolbar { z-index: 0 !important; }';
    document.head.appendChild(style);

    Modal.setAppElement('#root');
    fetchPondTypes();
  }, []);

  useEffect(() => {
    if (selectedPondType) fetchPonds();
  }, [selectedPondType]);

  const fetchPondTypes = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondTypeRequest.getPondTypeRequestByFamrId(farmId)],
      (res) => {
        const pondTypes = res[0];
        const options = pondTypes.map((pondType) => ({
          value: pondType.pondTypeId,
          label: pondType.pondTypeName,
        }));
        setPondTypes([...options]);
      },
      null,
      (err) => console.error('Failed to fetch pondTypes:', err)
    );
  }, [callApi, farmId]);

  const fetchPonds = useCallback(() => {
    callApi(
      [DashboardRequestApi.pondRequest.getPondRequestByPondTypeIdAndFarmId(selectedPondType.value, farmId)],
      (res) => {
        const ponds = res[0];
        const options = ponds
          .filter((pond) => pond.pondTypeId === selectedPondType.value)
          .map((pond) => ({
            value: pond.pondId,
            label: pond.pondName,
          }));
        setPondOptions([...options]);
      },
      null,
      (err) => console.error('Failed to fetch ponds:', err)
    );
  }, [callApi, selectedPondType, farmId]);

  const fetchAllParameters = async (pondId, pondName) => {
    setLoading(true);
    try {
      const phData = await fetchData('Ph', pondId);
      const o2Data = await fetchData('O2', pondId);
      const tempData = await fetchData('Temperature', pondId);

      setPondData((prevData) => ({
        ...prevData,
        [pondId]: { Ph: phData, O2: o2Data, Temperature: tempData },
      }));
      toast.success(`Dữ liệu ao ${pondName} đã được cập nhật!`);
    } catch (error) {
      toast.error(`Không thể tải dữ liệu cho ao ${pondId}.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchNH3NO2Data = async (pondId, pondName) => {
    setLoading(true);
    try {
      const nh3Data = await fetchData('NH3', pondId);
      const no2Data = await fetchData('NO2', pondId);

      setPondData((prevData) => ({
        ...prevData,
        [pondId]: {
          ...prevData[pondId],
          NH3: nh3Data,
          NO2: no2Data,
        },
      }));
      toast.success(`Dữ liệu NH3, NO2 cho ao ${pondName} đã được cập nhật!`);
    } catch (error) {
      toast.error(`Không thể tải dữ liệu NH3, NO2 cho ao ${pondId}.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (parameter, pond) => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    const url = `https://shrimppond.runasp.net/api/Environment?pondId=${pond}&name=${parameter}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&pageSize=200&pageNumber=1`;
    try {
      const response = await axios.get(url);
      return response.data.reverse();
    } catch (error) {
      console.error(`Failed to fetch data for ${parameter}:`, error);
      return [];
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handlePondTypeChange = (e) => {
    const value = e.target.value;
    const selectedOption = pondTypes.find((option) => option.value === value) || null;
    setSelectedPondType(selectedOption);
    setSelectedPond(null);
  };

  const handlePondChange = (e) => {
    const value = e.target.value;
    const selectedOption = pondOptions.find((option) => option.value === value) || null;
    setSelectedPond(selectedOption);
  };

  const addPond = (e) => {
    e.preventDefault();
    if (!selectedPond) {
      toast.warning('Vui lòng chọn một ao!');
      return;
    }

    const pondExists = selectedPonds.some((p) => p.value === selectedPond.value);
    if (!pondExists) {
      setSelectedPonds([...selectedPonds, selectedPond]);
    }

    fetchAllParameters(selectedPond.value, selectedPond.label);
  };

  const handleUpdateNH3NO2 = (e) => {
    e.preventDefault();
    if (!selectedPond) {
      toast.warning('Vui lòng chọn một ao!');
      return;
    }
    fetchNH3NO2Data(selectedPond.value, selectedPond.label);
  };

  const deletePond = (pond) => {
    setSelectedPonds(selectedPonds.filter((p) => p.value !== pond.value));
    setPondData((prevData) => {
      const newData = { ...prevData };
      delete newData[pond.value];
      return newData;
    });
  };

  const getAnnotations = (parameter) => {
    const limits = parameterLimits[parameter];
    return limits
      ? {
          yaxis: [
            { y: limits.min, borderColor: '#ef4444', label: { text: `Min: ${limits.min}`, style: { color: '#fff', background: '#ef4444' } } },
            { y: limits.max, borderColor: '#10b981', label: { text: `Max: ${limits.max}`, style: { color: '#fff', background: '#10b981' } } },
          ],
        }
      : {};
  };

  const renderCharts = () => {
    if (loading) {
      return (
        <motion.div
          className="flex justify-center items-center py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
          <p className="ml-4 text-lg text-teal-700">Đang tải dữ liệu...</p>
        </motion.div>
      );
    }
    return selectedPonds.map((pond) => (
      <motion.div
        key={pond.value}
        className="chart-container bg-white rounded-xl shadow-lg p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-teal-700">{pond.label}</h2>
          <button
            onClick={() => deletePond(pond)}
            className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
          >
            <FaTrash size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(pondData[pond.value] || {}).map((param) => {
            const data = pondData[pond.value][param].map((d) => ({
              x: `${new Date(d.timestamp).getDate().toString().padStart(2, '0')}/${(new Date(d.timestamp).getMonth() + 1).toString().padStart(2, '0')}-${new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`,
              y: parseFloat(d.value),
            }));

            const formattedParam = param === 'Ph' ? 'pH' : param;
            const unit = param === 'Temperature' ? '℃' : (param === 'O2' || param === 'NH3' || param === 'NO2') ? 'mg/L' : '';

            return (
              <div key={param} className="parameter-chart w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-teal-800">{formattedParam}</h3>
                  <button
                    onClick={() => {
                      setActiveChart({ param, data });
                      setActivePondName(pond.label);
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-teal-500 hover:text-teal-700 transition-colors"
                  >
                    <FaExpand size={14} />
                  </button>
                </div>
                <Chart
                  options={{
                    ...chartData.options,
                    xaxis: {
                      categories: data.map((d) => d.x),
                      labels: {
                        rotate: -45,
                        rotateAlways: true,
                        style: { fontSize: '10px' },
                        trim: true,
                      },
                    },
                    annotations: getAnnotations(param),
                    yaxis: {
                      title: {
                        text: unit,
                        style: { fontSize: '14px', fontWeight: 600, color: '#475569' },
                      },
                    },
                  }}
                  series={[{ name: formattedParam, data: data.map((d) => d.y) }]}
                  type="line"
                  height={250}
                  width="100%"
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    ));
  };

  const handleMobileMenuToggle = (isOpen) => {
    setIsMobileMenuOpen(isOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <aside className="h-screen sticky top-0 sm:w-auto">
        <Sidebar onMobileMenuToggle={handleMobileMenuToggle} className="z-[1000]" />
      </aside>

      <div className="flex-1 mt-16 sm:mt-0 max-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 sm:mb-8 mx-auto max-w-6xl">
            Thông số môi trường
          </h1>
          <div className="max-w-8xl mx-auto z-10">
            <form
              onSubmit={addPond}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-0 hover:shadow-lg transition-all duration-300"
            >
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                {/* Combobox 1 */}
                <div className="sm:col-span-1">
                  <label className="block text-teal-800 font-semibold mb-2" htmlFor="pondTypeId">
                    Chọn loại ao
                  </label>
                  <select
                    id="pondTypeId"
                    value={selectedPondType?.value || ''}
                    onChange={handlePondTypeChange}
                    required
                    className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm transition-all duration-200 z-20"
                  >
                    <option value="">Chọn loại ao</option>
                    {pondTypes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Combobox 2 */}
                <div className="sm:col-span-1">
                  <label className="block text-teal-800 font-semibold mb-2" htmlFor="pondId">
                    Tên ao
                  </label>
                  <select
                    id="pondId"
                    value={selectedPond?.value || ''}
                    onChange={handlePondChange}
                    required
                    className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm transition-all duration-200 z-20"
                  >
                    <option value="">Chọn ao</option>
                    {pondOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Datepicker 1 */}
                <div className="sm:col-span-1">
                  <label className="block text-teal-800 font-semibold mb-2" htmlFor="startDate">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formatDateForInput(startDate)}
                    onChange={handleStartDateChange}
                    required
                    className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm transition-all duration-200 z-20"
                  />
                </div>

                {/* Datepicker 2 */}
                <div className="sm:col-span-1">
                  <label className="block text-teal-800 font-semibold mb-2" htmlFor="endDate">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formatDateForInput(endDate)}
                    onChange={handleEndDateChange}
                    required
                    className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm transition-all duration-200 z-20"
                  />
                </div>

                {/* Nút submit */}
                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition-all duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Đang tải...' : 'Xem dữ liệu'}
                  </button>
                </div>

                {/* Nút cập nhật NH3, NO2 */}
                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleUpdateNH3NO2}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Đang tải...' : 'Cập nhật NH3, NO2'}
                  </button>
                </div>
              </div>
            </form>
            <div
              className="space-y-6 mt-6 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 31vh)' }}
            >
              {renderCharts()}
            </div>
            <Modal
              isOpen={isModalOpen}
              onRequestClose={() => setIsModalOpen(false)}
              style={{
                content: {
                  width: '90%',
                  height: '80vh',
                  maxWidth: '800px',
                  margin: "auto",
                  borderRadius: '12px',
                  padding: '10px',
                  zIndex: 10,
                },
                overlay: { zIndex: 90 },
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-teal-700">
                  {activePondName} - {activeChart?.param}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-teal-500 hover:text-teal-700 transition-colors"
                >
                  <IoCloseSharp size={26} />
                </button>
              </div>
              <Chart
                options={{
                  ...chartData.options,
                  xaxis: {
                    categories: activeChart?.data.map((d) => d.x),
                    labels: {
                      rotate: -45,
                      rotateAlways: true,
                      style: { fontSize: '10px' },
                      trim: true,
                    },
                  },
                  annotations: getAnnotations(activeChart?.param),
                  yaxis: {
                    title: {
                      text: activeChart?.param === 'Temperature' ? '℃' : (activeChart?.param === 'O2' || activeChart?.param === 'NH3' || activeChart?.param === 'NO2') ? 'mg/L' : '',
                      style: { fontSize: '14px', fontWeight: 600, color: '#475569' },
                    },
                  },
                }}
                series={[{ name: activeChart?.param, data: activeChart?.data.map((d) => d.y) }]}
                type="line"
                height="90%"
                width="100%"
              />
            </Modal>
          </div>
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default Evista;