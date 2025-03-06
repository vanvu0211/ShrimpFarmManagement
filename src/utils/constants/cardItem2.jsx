import { FaBox, FaExchangeAlt, FaTrash } from 'react-icons/fa';
// import { BsInfoCircle } from 'react-icons/bs';
import { FaShrimp } from "react-icons/fa6";
import { MdOutlineUpdate } from "react-icons/md";
import { BsBox } from 'react-icons/bs';



export const extraActions = [
    { id: 1, icon: <BsBox className="text-black text-xl m-1 shadow-md"  />, bgColor: 'bg-[#F2F2F2]' },
    { id: 2, icon: <FaExchangeAlt className="text-black text-xl m-1" />, bgColor: 'bg-[#F2F2F2]' },
    { id: 3, icon: <MdOutlineUpdate className="text-black text-3xl m-1" />, bgColor: 'bg-[#F2F2F2]' },
    // { id: 4, icon: <FaShrimp className="text-white text-xl m-1" />, bgColor: 'bg-red-600' },
    { id: 5, icon: <FaTrash className="text-black text-xl m-1" />, bgColor: 'bg-[#F2F2F2]' },
  ];