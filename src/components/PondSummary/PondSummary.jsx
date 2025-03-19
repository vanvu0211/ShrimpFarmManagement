import React, { useRef, useState, useEffect, memo } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { CiCirclePlus } from "react-icons/ci";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import Card from '../Card/Card'; 
import { IoMdAdd } from "react-icons/io";
import { useSelector } from 'react-redux';

const PondSummary = ({ ponds, pondTypeName, pondTypeId, setIsDeleteModal, setIsCreateModal, onSelected, onDeleteCardSuccess, onPutSucces }) => {  // Nhận thêm pondTypeName từ props
  const expanded = useSelector((state) => state.sidebar.expanded);
  const [dragging, setDragging] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const tabsBoxRef = useRef(null);

  const handleMouseMove = (e) => {
    const tabsBox = tabsBoxRef.current;
    if (tabsBox && dragging) {
      tabsBox.scrollLeft -= e.movementX;
    }
  };

  const handleScroll = () => {
    const tabsBox = tabsBoxRef.current;
    if (tabsBox) {
      const scrollWidth = tabsBox.scrollWidth - tabsBox.clientWidth;
      setShowLeftArrow(tabsBox.scrollLeft > 0);
      setShowRightArrow(tabsBox.scrollLeft < scrollWidth);
    }
  };

  const handleLeftArrowClick = () => {
    const tabsBox = tabsBoxRef.current;
    if (tabsBox) {
      tabsBox.scrollLeft -= 350;
    }
  };

  const handleRightArrowClick = () => {
    const tabsBox = tabsBoxRef.current;
    if (tabsBox) {
      tabsBox.scrollLeft += 350;
    }
  };

  useEffect(() => {
    const tabsBox = tabsBoxRef.current;
    if (tabsBox) {
      tabsBox.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (tabsBox) {
        tabsBox.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col w-full bg-white rounded-xl pb-1 border mt-4 ">
      <div className="flex text-xl font-semibold font-sans   mb-1 justify-between p-1">
        
        <h1 className ="px-4 mb-4 font-semibold text-teal-800  ">{pondTypeName}</h1>  
        <span className=" flex gap-x-3 pr-5">
          <FaTrashAlt 
            className = "mt-2 cursor-pointer"
            onClick={() => { setIsDeleteModal(true);
              onSelected(pondTypeId, pondTypeName) // Gọi hàm onSelected khi nhấn nút xóa
            }}  
          />
          <IoMdAdd 
            className=" mt-1 text-3xl cursor-pointer"
            onClick={() => { setIsCreateModal(true);
              onSelected(pondTypeId, pondTypeName) // Gọi hàm onSelected khi nhấn nút xóa
            }}   
          />
        </span>
      </div>

      <div className={`overflow-hidden no-scrollbar px-5 h-full relative w-[calc(100% - 50px)]`}>
        {showLeftArrow && (
          <div className="absolute top-0 w-24 h-full flex items-center left-0 z-10"
            style={{ background: 'linear-gradient(90deg, #fff 70%, transparent)' }}
            onClick={handleLeftArrowClick}
          >
            <FaAngleLeft className="w-9 h-9 p-1 bg-[#D8D5F2] text-center rounded-[50%] cursor-pointer ml-3 hover:bg-[#efedfb]" />
          </div>
        )}
        
        <div
          ref={tabsBoxRef}
          className={`tabs-box flex gap-x-1 h-full overflow-x-hidden no-scrollbar ${dragging ? "scroll-auto cursor-grab" : "scroll-smooth"}`}
          onMouseMove={handleMouseMove}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
        >
          <div className="flex gap-x-3 h-full last:mr-5">
          {ponds.map((res) => (
            <Card
              onPutSucces = {onPutSucces} 
              pondId={res.pondId} 
              pondTypeId={res.pondTypeId}
              pondName={res.pondName} 
              status={res.status} 
              key={res.pondId}
              onDeleteCardSuccess={onDeleteCardSuccess} // Truyền hàm xuống component Card
            />
          ))}


          </div>
        </div>

        {showRightArrow && (
          <div className="absolute top-0 h-full w-24 flex items-center right-0 justify-end"
            style={{ background: 'linear-gradient(-90deg, #fff 70%, transparent)' }}
            onClick={handleRightArrowClick}
          >
            <FaAngleRight className="w-9 h-9 p-1 bg-[#D8D5F2] text-center rounded-[50%] cursor-pointer mr-3" />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PondSummary);