import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Select from 'react-select';
import axios from 'axios';
import { FaPlus, FaTrash, FaExpand } from 'react-icons/fa';
import Chart from 'react-apexcharts';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { motion } from 'framer-motion';

function Evista() {
  const navigate = useNavigate();
  const [selectedPondType, setSelectedPondType] = useState(null);
  const [pondOptions, setPondOptions] = useState([]);
  const [pondTypes, setPondTypes] = useState([]);
  const [selectedPond, setSelectedPond] = useState(null);
  const [selectedPonds, setSelectedPonds] = useState([]);
  const [pondData, setPondData] = useState({});
  const [loading, setLoading] = useState(false);

  const [chartData] = useState({
    series: [],
    options: {
      chart: { 
        type: 'line', 
        height: '100%', // Sử dụng phần trăm để responsive
        zoom: { enabled: true, type: 'x' },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
        toolbar: { show: true }, // Hiển thị toolbar để zoom trên mobile
      },
      xaxis: { 
        type: 'datetime', 
        labels: { 
          rotate: -45, 
          rotateAlways: true,
          style: { colors: '#64748b', fontSize: '12px' }, // Giảm kích thước font cho mobile
          trim: true, // Cắt ngắn nhãn nếu quá dài
        },
      },
      yaxis: { 
        title: { text: '' },
        labels: { style: { colors: '#64748b', fontSize: '12px' } }, // Giảm kích thước font
      },
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
      stroke: { curve: 'smooth', width: 2 },
      grid: { borderColor: '#e2e8f0' },
      annotations: { yaxis: [] },
      tooltip: {
        theme: 'dark',
        x: { show: true },
      },
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [activePondName, setActivePondName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

  const parameterLimits = {
    Ph: { min: 7.5, max: 8.5 },
    O2: { min: 3.0, max: 7.0 },
    Temperature: { min: 25, max: 33 },
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

  const farmName = localStorage.getItem('farmName') || '';
  const username = localStorage.getItem('username') || '';

  const fetchPondTypes = async () => {
    const url = `https://shrimppond.runasp.net/api/PondType?farmName=${farmName}&pageSize=200&pageNumber=1`;
    try {
      const response = await axios.get(url);
      setPondTypes(
        response.data.map((type) => ({
          value: type.pondTypeId,
          label: type.pondTypeName,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch pond types:', error);
    }
  };

  const fetchPonds = async () => {
    const url = 'https://shrimppond.runasp.net/api/Pond?pageSize=200&pageNumber=1';
    try {
      const response = await axios.get(url);
      setPondOptions(
        response.data
          .filter((pond) => pond.pondTypeName === selectedPondType.label)
          .map((pond) => ({ value: pond.pondId, label: pond.pondId }))
      );
    } catch (error) {
      console.error('Failed to fetch ponds:', error);
    }
  };

  const fetchAllParameters = async (pond) => {
    setLoading(true);
    try {
      const phData = await fetchData('Ph', pond);
      const o2Data = await fetchData('O2', pond);
      const tempData = await fetchData('Temperature', pond);
  
      setPondData((prevData) => ({
        ...prevData,
        [pond]: { Ph: phData, O2: o2Data, Temperature: tempData },
      }));
      toast.success(`Dữ liệu ao ${pond} đã được cập nhật!`);
    } catch (error) {
      toast.error(`Không thể tải dữ liệu cho ao ${pond}.`);
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

  const handlePondTypeChange = (selectedOption) => setSelectedPondType(selectedOption);
  const handlePondChange = (selectedOption) => setSelectedPond(selectedOption.value);

  const addPond = () => {
    if (!selectedPond) {
      toast.warning("Vui lòng chọn một ao!");
      return;
    }
  
    const pondExists = selectedPonds.includes(selectedPond);
  
    if (!pondExists) {
      setSelectedPonds([...selectedPonds, selectedPond]);
    }
  
    fetchAllParameters(selectedPond);
  };  

  const deletePond = (pond) => {
    setSelectedPonds(selectedPonds.filter((p) => p !== pond));
    setPondData((prevData) => {
      const newData = { ...prevData };
      delete newData[pond];
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
          <div className="w-12 h-12 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="ml-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
        </motion.div>
      );
    }
    return selectedPonds.map((pond) => (
      <motion.div 
        key={pond}
        className="chart-container bg-white rounded-xl shadow-lg p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{pond}</h2>
          <button
            onClick={() => deletePond(pond)}
            className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
          >
            <FaTrash size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(pondData[pond] || {}).map((param) => {
            const data = pondData[pond][param].map((d) => ({
              x: `${new Date(d.timestamp).getDate().toString().padStart(2, '0')}/${(new Date(d.timestamp).getMonth() + 1).toString().padStart(2, '0')}-${new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`,
              y: parseFloat(d.value),
            }));

            const formattedParam = param === 'Ph' ? 'pH' : param;
            const unit = param === 'Temperature' ? '℃' : param === 'O2' ? 'mg/L' : '';

            return (
              <div key={param} className="parameter-chart w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-700">{formattedParam}</h3>
                  <button
                    onClick={() => {
                      setActiveChart({ param, data });
                      setActivePondName(pond);
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
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
                        style: { fontSize: '10px' }, // Font nhỏ hơn cho mobile
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
                  width="100%" // Responsive width
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    ));
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    setEndDate(nextDay);
  };

  const handle7DaysClick = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    setStartDate(sevenDaysAgo);
    setEndDate(today);
  };

  const handle1DayClick = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    setStartDate(today);
    setEndDate(tomorrow);
  };

  return (
    <div className="flex min-h-screen bg-[#F2F4F7] overflow-hidden">
      <aside className="h-screen sticky top-0">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-5">
          <div className="bg-gray-100 p-4">
            {/* Form nhập liệu */}
            <form className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Loại ao</label>
                  <Select
                    options={pondTypes}
                    onChange={handlePondTypeChange}
                    placeholder="Chọn loại ao"
                    value={selectedPondType}
                    className="mt-1"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Tên ao</label>
                  <Select
                    options={pondOptions}
                    onChange={handlePondChange}
                    placeholder="Chọn tên ao"
                    value={pondOptions.find((option) => option.value === selectedPond)}
                    className="mt-1"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <DatePicker 
                    selected={startDate} 
                    onChange={handleStartDateChange} 
                    dateFormat="yyyy-MM-dd" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <DatePicker 
                    selected={endDate} 
                    onChange={(date) => setEndDate(date)} 
                    dateFormat="yyyy-MM-dd" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={addPond} 
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 h-10 w-full md:w-auto px-6"
                  disabled={loading}
                >
                  {loading ? 'Đang tải...' : 'Xem dữ liệu'}
                </button>
              </div>
            </form>

            {/* Hiển thị các card ao */}
            <div className="space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
              {renderCharts()}
            </div>
           
            <Modal
              isOpen={isModalOpen}
              onRequestClose={() => setIsModalOpen(false)}
              style={{ 
                content: { 
                  width: '90%', // Giảm chiều rộng để vừa với mobile
                  maxWidth: '800px', 
                  height: '80vh', 
                  margin: 'auto',
                  borderRadius: '12px',
                  padding: '24px',
                },
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {activePondName} - {activeChart?.param}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <FaTrash size={16} />
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
                      style: { fontSize: '10px' }, // Font nhỏ hơn cho modal trên mobile
                      trim: true,
                    },
                  },
                  annotations: getAnnotations(activeChart?.param),
                  yaxis: {
                    title: {
                      text: activeChart?.param === 'Temperature' ? '℃' : activeChart?.param === 'O2' ? 'mg/L' : '',
                      style: { fontSize: '14px', fontWeight: 600, color: '#475569' },
                    },
                  },
                }}
                series={[{ name: activeChart?.param, data: activeChart?.data.map((d) => d.y) }]}
                type="line"
                height="90%"
                width="100%" // Responsive width cho modal
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