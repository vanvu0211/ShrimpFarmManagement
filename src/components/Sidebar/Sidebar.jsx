import React, { useLayoutEffect, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TfiAlignJustify } from 'react-icons/tfi';
import { FiLogOut } from 'react-icons/fi';
import { BsGrid, BsDroplet, BsSearch, BsFileText } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../store/sidebarSlice';
import { FaExchangeAlt, FaLeaf, FaInfo } from 'react-icons/fa';
import { FaShrimp, FaTablets } from "react-icons/fa6";
import { PiFanDuotone } from "react-icons/pi";
import { MdReportProblem } from "react-icons/md";

function Sidebar({ onMobileMenuToggle }) {
  const menuItems = [
    { name: "Dashboard", icon: <BsGrid />, lnk: "/dashboard" },
    { name: "Thông số môi trường", icon: <BsDroplet />, lnk: "/evista" },
    { name: "Thu hoạch", icon: <FaLeaf />, lnk: "/harvest" },
    { name: "Chuyển ao", icon: <FaExchangeAlt />, lnk: "/transfer" },
    { name: "Danh mục thực phẩm", icon: <FaTablets />, lnk: "/food" },
    { name: "Danh mục máy móc", icon: <PiFanDuotone />, lnk: "/machinesmanager" },
    { name: "Thông tin tôm", icon: <FaShrimp />, lnk: "/shrimpmanagement" },
    { name: "Thông tin ao", icon: <FaInfo />, lnk: "/info" },
    { name: "Truy xuất nguồn gốc", icon: <BsSearch />, lnk: "/access" },
    { name: "Thông báo và cảnh báo", icon: <MdReportProblem />, lnk: "/alarm" },
    { name: "Thông tin trang trại", icon: <BsFileText  />, lnk: "/farm" },
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const expanded = useSelector((state) => state.sidebar.expanded);
  const dispatch = useDispatch();

  const [active, setActive] = useState("Dashboard");
  const [username, setUsername] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (!token || !storedUsername) {
      navigate("/");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  useLayoutEffect(() => {
    if (location.pathname === "/") {
      document.title = "Dashboard";
    }
  }, [location.pathname]);

  useLayoutEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.lnk === currentPath);
    if (activeItem) {
      setActive(activeItem.name);
      document.title = activeItem.name;
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMobileMenuToggle) {
      onMobileMenuToggle(!isMobileMenuOpen);
    }
  };

  return (
    <>
      {/* Sidebar trên desktop */}
      <aside className={`hidden sm:block h-screen ${expanded ? "w-64" : "w-20"} transition-all duration-300 ease-in-out shadow-lg z-70`}>
        <nav className="h-full flex flex-col bg-gradient-to-b from-teal-600 to-teal-800 border-r">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
                className={`transition-all duration-300 ${expanded ? "w-16" : "w-0"}`}
                alt="Logo"
              />
              {expanded && (
                <div className="ml-2 flex items-center text-xl font-semibold text-white">
                  <span>Shrimp</span>
                  <span className="text-black">Pond</span>
                </div>
              )}
            </div>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 text-white hover:bg-teal-700 rounded-full transition-colors"
            >
              <TfiAlignJustify size={20} />
            </button>
          </div>

          <ul className="flex-1 px-3 space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.name}
                onClick={() => {
                  setActive(item.name);
                  navigate(item.lnk);
                  document.title = item.name;
                }}
                className={`flex items-center relative py-3 px-2 my-1 rounded-lg cursor-pointer transition-all duration-200 group 
                  ${active === item.name
                    ? "bg-teal-100 text-teal-900 shadow-md"
                    : "hover:bg-teal-500 text-white hover:shadow-md"}`}
              >
                <div className={`${expanded ? "flex items-center w-full" : "flex justify-center w-full"}`}>
                  <span className={`text-2xl ${expanded ? "mr-3" : ""} transition-colors group-hover:text-white`}>
                    {item.icon}
                  </span>
                  {expanded && (
                    <span className="font-medium whitespace-nowrap transition-opacity duration-200">
                      {item.name}
                    </span>
                  )}
                  {!expanded && (
                    <div className="absolute left-full rounded-md px-3 py-1 ml-6 bg-teal-100 text-teal-800 text-sm font-medium invisible opacity-0 translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-80">
                      {item.name}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-teal-500 p-4">
            <div className={`${expanded ? "flex items-center justify-between" : "flex flex-col items-center space-y-2"}`}>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-teal-300 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all duration-300 hover:scale-105">
                  {username ? username[0].toUpperCase() : "A"}
                </div>
                {expanded && (
                  <span className="text-white text-sm font-medium truncate ml-3 max-w-[120px]">
                    {username || "Admin"}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className={`flex items-center text-white bg-teal-700 rounded-lg hover:bg-teal-900 transition-all duration-200 shadow-md 
                  ${expanded ? "py-2 px-3" : "p-2 w-10 h-10 justify-center"}`}
              >
                <FiLogOut size={20} />
                {expanded && <span className="ml-2 font-medium">Log out</span>}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Sidebar trên mobile */}
      <div className="sm:hidden fixed top-0 left-0 w-full bg-gradient-to-b from-teal-600 to-teal-800 z-[2000] shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-1">
            <img
              src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
              className="w-12"
              alt="Logo"
            />
            {expanded && (
              <div className="flex items-center text-2xl font-semibold tracking-wide">
                <span className="text-white">Shrimp</span>
                <span className="text-black font-sans">Pond</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleMobileMenu}
            className="text-white hover:bg-teal-700 p-2 rounded-full transition-colors"
          >
            <TfiAlignJustify size={24} />
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed w-full bg-teal-700 shadow-lg rounded-b-lg z-[2000]">
            <ul className="px-4 py-2 space-y-2">
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  onClick={() => {
                    setActive(item.name);
                    navigate(item.lnk);
                    document.title = item.name;
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center py-2 px-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    active === item.name
                      ? "bg-teal-100 text-teal-900"
                      : "text-white hover:bg-teal-500"
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-teal-500 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-teal-300 rounded-full mr-2 flex items-center justify-center text-white text-lg font-bold">
                  {username ? username[0].toUpperCase() : "A"}
                </div>
                <span className="text-white text-sm font-medium truncate max-w-[150px]">
                  {username || "Admin"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-white bg-teal-700 py-1 px-2 rounded-lg hover:bg-teal-900 transition-all duration-200"
              >
                <FiLogOut size={18} className="mr-1" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;