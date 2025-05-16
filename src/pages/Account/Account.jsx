import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Register from "../../components/Register";
import useCallApi from "../../hooks/useCallApi";
import { DashboardRequestApi } from "../../services/api";
import { IoEye, IoEyeOff } from "react-icons/io5";
import cl from "classnames";

function Account() {
  const navigate = useNavigate();
  const callApi = useCallApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoginEnabled = email.trim() !== "" && password.trim() !== "";

  const handleLogin = useCallback(() => {
    if (!isLoginEnabled) return;

    setIsLoading(true);
    setErrorMessage("");

    const loginData = {
      email: email.trim(),
      password: password.trim(),
    };

    callApi(
      [DashboardRequestApi.authRequest.login(loginData)],
      (res) => {
        if (res && res[0] && res[0].token) {
          localStorage.setItem("token", res[0].token);
          localStorage.setItem("email", loginData.email);
          localStorage.setItem("username", loginData.email);
          navigate("/status");
        } else {
          setErrorMessage("Email hoặc mật khẩu không đúng!");
        }
        setIsLoading(false);
      },
      (error) => {
        if (error.response?.status === 401) {
          setErrorMessage("Sai email hoặc mật khẩu!");
        } else {
          setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau!");
        }
        setIsLoading(false);
      }
    );
  }, [callApi, email, password, isLoginEnabled, navigate]);

  const handleRegisterSuccess = () => {
    alert("Tài khoản đã được tạo thành công!");
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://lms.hcmut.edu.vn/pluginfile.php/3/theme_academi/slide2image/1743086606/slbktv.jpg')`,
      }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full mx-4 sm:mx-10 max-w-md border border-teal-300 transform transition-all duration-300 hover:shadow-3xl">
        {/* Tiêu đề */}
        <div className="flex justify-center items-center mb-6">
          <img
            src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
            className="w-12 sm:w-16 transition-all duration-300"
            alt="Logo"
          />
          <div className="ml-3 text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="text-teal-800">Shrimp</span>
            <span className="text-teal-600">Pond</span>
          </div>
        </div>

        {/* Form đăng nhập */}
        <div className="mb-5">
          <label htmlFor="email" className="block text-left font-semibold text-teal-900 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
          />
        </div>

        <div className="mb-6 relative">
          <label htmlFor="password" className="block text-left font-semibold text-teal-900 mb-2">
            Mật khẩu
          </label>
          <input
            type={isPasswordVisible ? "text" : "password"}
            id="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
          />
          <span
            className="absolute top-2/3 right-3 transform -translate-y-1/2 text-teal-700 cursor-pointer text-xl sm:text-2xl"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? <IoEyeOff /> : <IoEye />}
          </span>
        </div>

        {/* Thông báo lỗi */}
        {errorMessage && (
          <p className="text-red-600 font-medium text-sm text-center mb-4">{errorMessage}</p>
        )}

        {/* Nút đăng nhập */}
        <button
          onClick={handleLogin}
          disabled={!isLoginEnabled || isLoading}
          className={cl(
            "w-full py-3 sm:py-4 text-white font-semibold rounded-lg shadow-lg transition-all duration-300",
            {
              "bg-teal-700 hover:bg-teal-800 hover:shadow-xl": isLoginEnabled && !isLoading,
              "bg-gray-400 cursor-not-allowed": !isLoginEnabled || isLoading,
            }
          )}
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        {/* Link đăng ký */}
        <p className="text-center text-teal-800 mt-4 text-sm sm:text-base">
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