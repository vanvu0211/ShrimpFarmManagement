import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Register from "../../components/Register";
import useCallApi from "../../hooks/useCallApi";
import { DashboardRequestApi } from "../../services/api";
import { IoEye, IoEyeOff } from "react-icons/io5";
import cl from "classnames";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Account() {
  const navigate = useNavigate();
  const callApi = useCallApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isOtpFormOpen, setIsOtpFormOpen] = useState(false); // Added missing state
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Forgot password form states
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [cacheKey, setCacheKey] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

   const isPasswordValid = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLengthValid = password.length >= 8 && password.length <= 64;
    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isLengthValid;
  };

  const isLoginEnabled = email.trim() !== "" && password.trim() !== "";
  const isResetEnabled =
    resetEmail.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    newPassword === confirmPassword &&
    isPasswordValid(newPassword); // Use isPasswordValid
  const isOtpEnabled = otp.trim() !== "";

 

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

  const handleRequestPasswordReset = useCallback(() => {
    if (!isResetEnabled) {
      setResetError(
        isPasswordValid(newPassword)
          ? "Vui lòng điền đầy đủ thông tin và kiểm tra mật khẩu!"
          : "Mật khẩu cần ít nhất 8 ký tự, tối đa 64 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return;
    }

    setIsLoading(true);
    setResetError("");
    setResetSuccess("");

    callApi(
      [DashboardRequestApi.authRequest.requestPasswordReset(resetEmail)],
      (res) => {
        if (res && res[0] && res[0].cacheKey) {
          setCacheKey(res[0].cacheKey);
          setResetSuccess(res[0].message || "Mã OTP đã được gửi đến email của bạn!");
          setIsOtpFormOpen(true);
        } else {
          setResetError("Không nhận được phản hồi hợp lệ từ server!");
        }
        setIsLoading(false);
      },
      (error) => {
        setResetError("Không thể gửi yêu cầu. Vui lòng kiểm tra email và thử lại!");
        setIsLoading(false);
      }
    );
  }, [callApi, resetEmail, isResetEnabled]);

  const handleResetPassword = useCallback(() => {
    if (!isOtpEnabled) {
      setResetError("Vui lòng nhập mã OTP!");
      return;
    }

    setIsLoading(true);
    setResetError("");
    setResetSuccess("");

    const resetData = {
      email: resetEmail.trim(),
      otpCode: otp.trim(),
      newPassword: newPassword.trim(),
      cacheKey: cacheKey,
    };

    callApi(
      [DashboardRequestApi.authRequest.resetPassword(resetData)],
      (res) => {
        setResetSuccess("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        toast.success("Đặt lại mật khẩu thành công!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        setIsForgotPasswordOpen(false);
        setIsOtpFormOpen(false);
        setResetEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setCacheKey("");
        setIsLoading(false);
      },
      (error) => {
        setResetError("Mã OTP không hợp lệ hoặc có lỗi xảy ra!");
        setIsLoading(false);
      }
    );
  }, [callApi, resetEmail, otp, newPassword, cacheKey, isOtpEnabled]);

  const handleRegisterSuccess = () => {
    toast.success("Tài khoản đã được tạo thành công!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://lms.hcmut.edu.vn/pluginfile.php/3/theme_academi/slide2image/1743086606/slbktv.jpg')`,
      }}
    >
      <div className="relative bg-white bg-opacity-80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl w-full mx-4 sm:mx-10 max-w-md border border-teal-300 transform transition-all duration-300 hover:shadow-3xl">
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

        {!isForgotPasswordOpen ? (
          <>
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

            {/* Link quên mật khẩu và đăng ký */}
            <div className="text-center text-teal-800 mt-4 text-sm sm:text-base">
              <p>
                <span
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="underline cursor-pointer hover:text-teal-900 font-semibold transition-colors duration-200"
                >
                  Quên mật khẩu?
                </span>
              </p>
              <p className="mt-2">
                Chưa có tài khoản?{" "}
                <span
                  onClick={() => setIsRegisterOpen(true)}
                  className="underline cursor-pointer hover:text-teal-900 font-semibold transition-colors duration-200"
                >
                  Đăng ký ngay
                </span>
              </p>
            </div>
          </>
        ) : (
          <>
            {!isOtpFormOpen ? (
              <>
                {/* Form nhập email và mật khẩu mới */}
                <div className="mb-5">
                  <label htmlFor="resetEmail" className="block text-left font-semibold text-teal-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="resetEmail"
                    placeholder="Nhập email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
                  />
                </div>

                <div className="mb-5 relative">
                  <label htmlFor="newPassword" className="block text-left font-semibold text-teal-900 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type={isNewPasswordVisible ? "text" : "password"}
                    id="newPassword"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
                  />
                  <span
                    className="absolute top-2/3 right-3 transform -translate-y-1/2 text-teal-700 cursor-pointer text-xl sm:text-2xl"
                    onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  >
                    {isNewPasswordVisible ? <IoEyeOff /> : <IoEye />}
                  </span>
                </div>

                <div className="mb-6 relative">
                  <label htmlFor="confirmPassword" className="block text-left font-semibold text-teal-900 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
                  />
                  <span
                    className="absolute top-2/3 right-3 transform -translate-y-1/2 text-teal-700 cursor-pointer text-xl sm:text-2xl"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  >
                    {isConfirmPasswordVisible ? <IoEyeOff /> : <IoEye />}
                  </span>
                </div>

                {/* Thông báo lỗi và thành công */}
                {resetError && (
                  <p className="text-red-600 font-medium text-sm text-center mb-4">{resetError}</p>
                )}
                {resetSuccess && (
                  <p className="text-green-600 font-medium text-sm text-center mb-4">{resetSuccess}</p>
                )}

                {/* Nút đặt lại mật khẩu */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleRequestPasswordReset}
                    disabled={ isLoading}
                    className={cl(
                      "w-full py-3 sm:py-4 text-white font-semibold rounded-lg shadow-lg transition-all duration-300",
                      {
                        "bg-teal-700 hover:bg-teal-800 hover:shadow-xl":  !isLoading,
                        "bg-gray-400 cursor-not-allowed":  isLoading,
                      }
                    )}
                  >
                    {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                  </button>
                  <button
                    onClick={() => {
                      setIsForgotPasswordOpen(false);
                      setResetEmail("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setOtp("");
                      setCacheKey("");
                      setResetError("");
                      setResetSuccess("");
                    }}
                    className="text-teal-800 underline cursor-pointer hover:text-teal-900 font-semibold transition-colors duration-200 text-center"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Form nhập OTP */}
                <div className="mb-5">
                  <label htmlFor="otp" className="block text-left font-semibold text-teal-900 mb-2">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
                  />
                </div>

                {/* Thông báo lỗi và thành công */}
                {resetError && (
                  <p className="text-red-600 font-medium text-sm text-center mb-4">{resetError}</p>
                )}
                {resetSuccess && (
                  <p className="text-green-600 font-medium text-sm text-center mb-4">{resetSuccess}</p>
                )}

                {/* Nút xác thực */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleResetPassword}
                    disabled={!isOtpEnabled || isLoading}
                    className={cl(
                      "w-full py-3 sm:py-4 text-white font-semibold rounded-lg shadow-lg transition-all duration-300",
                      {
                        "bg-teal-700 hover:bg-teal-800 hover:shadow-xl": isOtpEnabled && !isLoading,
                        "bg-gray-400 cursor-not-allowed": !isOtpEnabled || isLoading,
                      }
                    )}
                  >
                    {isLoading ? "Đang xử lý..." : "Xác thực"}
                  </button>
                  <button
                    onClick={() => {
                      setIsOtpFormOpen(false);
                      setOtp("");
                      setResetError("");
                      setResetSuccess("");
                    }}
                    className="text-teal-800 underline cursor-pointer hover:text-teal-900 font-semibold transition-colors duration-200 text-center"
                  >
                    Quay lại
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Component Register */}
        {isRegisterOpen && (
          <Register setIsRegister={setIsRegisterOpen} onRegisterSuccess={handleRegisterSuccess} />
        )}

        {/* ToastContainer */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
      </div>
    </div>
  );
}

export default Account;