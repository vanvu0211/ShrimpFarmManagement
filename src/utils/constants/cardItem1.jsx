import { FaOdnoklassniki, FaFilter, FaFan, FaTint } from 'react-icons/fa';
import oxy from '../../assets/image/oxy.png'

export const pondActions = [
  { id: 1, icon: <img src={oxy} className =""></img>, bgColor: 'bg-red-600' },
  { id: 2, icon: <FaFilter className="text-white text-xl" />, bgColor: 'bg-red-600' },
  { id: 3, icon: <FaFan className="text-white text-xl" />, bgColor: 'bg-green-600' },
  { id: 4, icon: <FaTint className="text-white text-xl" />, bgColor: 'bg-red-600' },
]