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
import { NavLink } from 'react-router-dom';

const menuItems = [
  { name: "Tổng quan", icon: <BsGrid />, lnk: "/dashboard" },
  { name: "Thông số môi trường", icon: <BsDroplet />, lnk: "/evista" },
  { name: "Thu hoạch", icon: <FaLeaf />, lnk: "/harvest" },
  { name: "Chuyển ao", icon: <FaExchangeAlt />, lnk: "/transfer" },
  { name: "Danh mục thực phẩm", icon: <FaTablets />, lnk: "/food" },
  { name: "Danh mục máy móc", icon: <PiFanDuotone />, lnk: "/machinesmanager" },
  { name: "Thông tin tôm", icon: <FaShrimp />, lnk: "/shrimpmanagement" },
  { name: "Thông tin ao", icon: <FaInfo />, lnk: "/info" },
  { name: "Truy xuất nguồn gốc", icon: <BsSearch />, lnk: "/access" },
  { name: "Thông báo và cảnh báo", icon: <MdReportProblem />, lnk: "/alarm" },
  { name: "Thông tin trang trại", icon: <BsFileText />, lnk: "/farm" },
];

const Sidebar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex flex-row items-center justify-around flex-wrap gap-4">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.lnk}
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition-colors ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;