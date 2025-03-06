import React from 'react';

function LogoutButton({ setIsLogin }) {
  const handleLogout = () => {
    setIsLogin(false); // Đặt trạng thái đăng xuất
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
    >
      Đăng xuất
    </button>
  );
}

export default LogoutButton;
