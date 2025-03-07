import React, { useLayoutEffect, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TfiAlignJustify } from 'react-icons/tfi';
import { FiLogOut } from 'react-icons/fi';
import { BsGrid, BsDroplet, BsBox, BsSearch, BsFileText } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../store/sidebarSlice';
import { FaBox, FaExchangeAlt, FaTrash } from 'react-icons/fa';
import { FaShrimp, FaTablets } from "react-icons/fa6";
import { PiFanDuotone } from "react-icons/pi";
function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: <BsGrid />, lnk: "/dashboard" },
    { name: "Thông số môi trường", icon: <BsDroplet />, lnk: "/evista" },
    { name: "Thu hoạch", icon: <BsBox />, lnk: "/harvest" },
    { name: "Chuyển ao", icon: <FaExchangeAlt />, lnk: "/transfer" },
    { name: "Thông tin tôm", icon: <FaShrimp />, lnk: "/shrimpmanagement" },
    { name: "Danh mục thực phẩm", icon: <FaTablets />, lnk: "/food" },
    { name: "Danh mục máy móc", icon: <PiFanDuotone />, lnk: "/machinesmanager" },
    { name: "Truy xuất nguồn gốc", icon: <BsSearch />, lnk: "/access" },
    { name: "Thông tin trang trại", icon: <BsFileText />, lnk: "/farm" },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const expanded = useSelector((state) => state.sidebar.expanded);
  const dispatch = useDispatch();

  const [active, setActive] = React.useState("Dashboard");
  const [showDelayed, setShowDelayed] = React.useState(false);

  const [username, setUsername] = React.useState(null);

  // Kiểm tra localStorage và điều hướng nếu không có token hoặc username
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!token || !storedUsername) {
      navigate("/"); // Điều hướng về trang đăng nhập
    } else {
      setUsername(storedUsername); // Lưu username vào state
    }
  }, [navigate]);

  useEffect(() => {
    if (expanded) {
      const timeout = setTimeout(() => {
        setShowDelayed(true);
      }, 150);
      return () => clearTimeout(timeout); 
    } else {
      setShowDelayed(false);
    }
  }, [expanded]);

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
  }, [location.pathname, menuItems]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    navigate("/"); // Điều hướng về trang đăng nhập
  };

  return (
    <aside className={`h-screen ${expanded ? "w-64" : "w-[86px]"} transition-width duration-300`}>
      <nav className="h-full flex flex-col bg-[#1396c2] border-r shadow-sm">
        <div className="p-3 pl-0 flex justify-between items-center">
          <img
            src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
            className={`transition-all duration-300 ${expanded ? "w-16" : "w-10"}`}
            alt=""
          />
          {expanded && (
            <div className="text-white font-bold flex items-center text-2xl transition-all duration-300 ml-[-30px]">
              <span className="font-bold text-white">Shrimp</span>
              <span className="font-bold text-black">Pond</span>
            </div>
          )}
          <button onClick={() => dispatch(toggleSidebar())} className="rounded-lg text-xl">
            <TfiAlignJustify />
          </button>
        </div>

        <ul className="flex-1 px-3 space-y-3">
          {menuItems.map((item) => (
            <li
              key={item.name}
              onClick={() => {
                setActive(item.name);
                navigate(item.lnk);
                document.title = item.name;
              }}
              className={`flex items-center relative py-2 px-3 my-1  font-medium rounded-md cursor-pointer transition-colors group ${
                active === item.name
                  ? "bg-gradient-to-tr from-indigo-100 to-indigo-100 text-white"
                  : "hover:bg-indigo-50 text-white"
              }`}
            >
              <div className="flex items-center justify-center text-black font-bold">
                <span className="mr-4 text-2xl items-center justify-center pl-[5px]">{item.icon}</span>
                {expanded 
                  ? (
                      <span
                        className={`transition-all duration-300 whitespace-nowrap ${
                          showDelayed ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {item.name}
                      </span>
                    )
                  : (
                      <div
                        className={`absolute left-full rounded-md px-2 py-1 ml-6 whitespace-nowrap bg-indigo-100 text-indigo-800 invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-hover:z-50`}
                      >
                        {item.name}
                      </div>
                    )}

                              </div>
                            </li>
                          ))}
                        </ul>

        {/* Nút Logout */}
        <div className="border-t p-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-400 rounded-full mr-2"></div>
            {expanded && <span className="text-white">{username || "Admin"}</span>}
          </div>
          <button
            onClick={handleLogout}
            className={expanded 
              ? "flex items-center text-white bg-gray-600 py-1 rounded-lg hover:bg-gray-700 px-3" 
              : "flex items-center text-white bg-gray-600 py-1 rounded-lg hover:bg-gray-700 pl-[1px]"}
          >
            <FiLogOut className="mr-2" /> {expanded && "Log out"}
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
