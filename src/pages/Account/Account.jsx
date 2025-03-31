import React, { useState, useCallback } from "react"; // Xóa useEffect
import { useNavigate } from "react-router-dom";
import Register from "../../components/Register";
import useCallApi from "../../hooks/useCallApi";
import { DashboardRequestApi } from "../../services/api";
import { IoEye, IoEyeOff } from "react-icons/io5";
import cl from 'classnames';

function Account() {
  const navigate = useNavigate();
  const callApi = useCallApi();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoginEnabled = username.trim() !== "" && password.trim() !== "";



  const handleLogin = useCallback(() => {
    if (!isLoginEnabled) return;

    setIsLoading(true);
    setErrorMessage("");

    const loginData = {
      username: username.trim(),
      password: password.trim(),
    };

    callApi(
      [DashboardRequestApi.authRequest.login(loginData)],
      (res) => {
        if (res && res[0] && res[0].token) {
          localStorage.setItem("token", res[0].token);
          localStorage.setItem("username", loginData.username);
          navigate("/status");
        } else {
          setErrorMessage("Tài khoản hoặc mật khẩu không đúng!");
        }
        setIsLoading(false);
      },
      (error) => {
        if (error.response?.status === 401) {
          setErrorMessage("Sai tên đăng nhập hoặc mật khẩu!");
        } else {
          setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau!");
        }
        setIsLoading(false);
      }
    );
  }, [callApi, username, password, isLoginEnabled, navigate]);

  const handleRegisterSuccess = () => {
    alert("Tài khoản đã được tạo thành công!");
  };

  return (
    // Giữ nguyên phần JSX
    <div className="flex justify-center items-center  min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full mx-10 max-w-md border border-teal-200 transform transition-all duration-300 hover:shadow-2xl">
        {/* Tiêu đề */}
        <div className="flex justify-center items-center mb-6">
          <img
            src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
            className="w-12 sm:w-16 transition-all duration-300"
            alt="Logo"
          />
          <div className="ml-3 text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-teal-700">Shrimp</span>
            <span className="text-teal-600">Pond</span>
          </div>
        </div>

        {/* Form đăng nhập */}
        <div className=" mb-5">
          <label htmlFor="username" className="block text-left font-medium text-teal-800 mb-2">
            Tên đăng nhập
          </label>
          <input
            type="text"
            id="username"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
          />
        </div>

        <div className="mb-6 relative">
          <label htmlFor="password" className="block text-left font-medium text-teal-800 mb-2">
            Mật khẩu
          </label>
          <input
            type={isPasswordVisible ? "text" : "password"}
            id="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 sm:p-4 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 text-sm sm:text-base transition-all duration-200"
          />
          <span
            className="absolute top-2/3 right-3 transform -translate-y-1/2 text-teal-600 cursor-pointer text-xl sm:text-2xl"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <IoEyeOff /> : <IoEye />}
          </span>
        </div>

        {/* Thông báo lỗi */}
        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
        )}

        {/* Nút đăng nhập */}
        <button
          onClick={handleLogin}
          disabled={!isLoginEnabled || isLoading}
          className={cl(
            "w-full py-3 sm:py-4 text-white font-semibold rounded-lg shadow-md transition-all duration-300",
            {
              "bg-teal-600 hover:bg-teal-700 hover:shadow-lg": isLoginEnabled && !isLoading,
              "bg-gray-300 cursor-not-allowed": !isLoginEnabled || isLoading,
            }
          )}
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        {/* Link đăng ký */}
        <p className="text-center text-teal-700 mt-4 text-sm sm:text-base">
          Chưa có tài khoản?{" "}
          <span
            onClick={() => setIsRegisterOpen(true)}
            className="underline cursor-pointer hover:text-teal-900 font-semibold transition-colors duration-200"
          >
            Đăng ký ngay
          </span>
        </p>
      </div>

      {/* Component Register */}
      {isRegisterOpen && (
        <Register setIsRegister={setIsRegisterOpen} onRegisterSuccess={handleRegisterSuccess} />
      )}
    </div>
  );
}

export default Account;