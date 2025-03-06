import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Register from "../../components/Register";
import useCallApi from "../../hooks/useCallApi"; // Hook gọi API
import { DashboardRequestApi } from "../../services/api"; // Dịch vụ API
import { IoEye, IoEyeOff } from "react-icons/io5"; // Icon con mắt

function Account() {
  const navigate = useNavigate();
  const callApi = useCallApi(); // Hook API
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Trạng thái hiển thị mật khẩu
  const [errorMessage, setErrorMessage] = useState(""); // Thông báo lỗi

  const isLoginEnabled = username.trim() !== "" && password.trim() !== "";

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Hàm đăng nhập
  const handleLogin = useCallback(() => {
    if (!isLoginEnabled) return;

    setIsLoading(true);
    setErrorMessage(""); 

    const loginData = {
      username: username.trim(),
      password: password.trim(),
    };

    // Gọi API thông qua hook callApi
    callApi(
      [DashboardRequestApi.authRequest.login(loginData)], // Gửi request login
      (res) => {
        console.log(">>> Response từ API:", res);

        if (res && res[0] && res[0].token) {
          // Lưu token và username vào localStorage
          localStorage.setItem("token", res[0].token);
          localStorage.setItem("username", loginData.username);

          // Chuyển hướng sang dashboard
          navigate("/status");
        } else {
          setErrorMessage("Tài khoản hoặc mật khẩu không đúng!"); // Thông báo lỗi
        }
        setIsLoading(false); // Thoát trạng thái loading
      },
      (error) => {
        // Xử lý lỗi
        if (error.response?.status === 401) {
          setErrorMessage("Sai tên đăng nhập hoặc mật khẩu!");
        } else {
          setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau!");
        }
        setIsLoading(false); // Thoát trạng thái loading khi thất bại
      }
    );
  }, [callApi, username, password, isLoginEnabled, navigate]);

  // Hàm được gọi khi đăng ký thành công
  const handleRegisterSuccess = () => {
    alert("Tài khoản đã được tạo thành công!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Log in</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="relative">
            <input
              type={isPasswordVisible ? "text" : "password"} // Hiển thị hoặc ẩn mật khẩu
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={!isLoginEnabled || isLoading}
          className={`w-full py-2 text-white font-semibold rounded-md ${
            isLoginEnabled
              ? "bg-red-500 hover:bg-red-600 cursor-pointer"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Login"}
        </button>
        {/* Hiển thị thông báo lỗi bên dưới nút Login */}
        {errorMessage && (
          <p className="text-red-500 text-sm text-center mt-2">{errorMessage}</p>
        )}
        <div
          onClick={() => setIsRegisterOpen(true)}
          className="mt-4 text-sm text-blue-500 hover:text-blue-700 cursor-pointer text-center font-semibold"
        >
          Đăng ký tài khoản
        </div>
      </div>

      {/* Component Register */}
      {isRegisterOpen && (
        <Register
          setIsRegister={setIsRegisterOpen}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}

export default Account;
