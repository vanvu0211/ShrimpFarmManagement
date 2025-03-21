import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FeedingTab from '../../components/FeedingTab/FeedingTab';
import TreatmentTab from '../../components/TreatmentTab';
import Loading from '../../components/Loading';
import ShrimpTab from '../../components/ShrimpTab';

const ShrimpManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    {
      title: 'Cho ăn',
      content: <FeedingTab />,
    },
    {
      title: 'Điều trị',
      content: <TreatmentTab />,
    },
    {
      title: 'Thông tin tôm',
      content: <ShrimpTab />,
    },
  ];

  return (
    <div className="flex max-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <aside>
        <Sidebar />
      </aside>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <main className="p-4 mt-16 sm:mt-0 sm:p-6 lg:p-8">
          {/* <h1 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 sm:mb-8 mx-auto max-w-6xl">
            Quản lý tôm
          </h1> */}
          <div className="flex flex-row sm:flex-row border-b border-teal-300 max-w-6xl mx-auto bg-white rounded-t-xl shadow-md mb-6">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`flex-1 py-3 px-4 text-center font-medium text-base sm:text-lg transition-all duration-200 ${
                  activeTab === index
                    ? 'border-teal-500 text-teal-600 bg-teal-50 border-b-2'
                    : 'border-transparent text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.title}
              </button>
            ))}
          </div>
          {tabs[activeTab].content}
        </main>
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
    </div>
  );
};

export default ShrimpManagement;