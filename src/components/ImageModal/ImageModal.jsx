import cl from 'classnames';
import { IoCloseSharp } from "react-icons/io5";
import shrimppond from '../../assets/image/shrimppond.jfif'

function ImageModal({ setShowImage }) {
    const handleCloseModal = (e) => {
        if (e.target === e.currentTarget) {
            setShowImage(false);
        }
    };

    return (
        <div 
            className={cl("fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-30 z-50")} 
            onClick={handleCloseModal} // Đóng modal khi click ra ngoài
        >
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[600px] min-h-[400px] border-black border-2">
                
                <i 
                    className="absolute top-0 right-0 text-2xl p-1 cursor-pointer hover:bg-gray-400 rounded-full"
                    onClick={() => setShowImage(false)} // Đóng modal khi nhấn vào nút đóng
                >
                    <IoCloseSharp />
                </i>
                {/* Hiển thị hình ảnh */}
                <img 
                    src={shrimppond}
                    alt="Sơ đồ ao tôm" 
                    className="w-full h-auto"
                />
            </div>
        </div>
    );
}

export default ImageModal;
