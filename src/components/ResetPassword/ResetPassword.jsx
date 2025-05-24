import { useState, memo } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import cl from "classnames";
import useCallApi from "../../hooks/useCallApi";
import { DashboardRequestApi } from "../../services/api";

function ResetPassword({ setIsResetPassword }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [cacheKey, setCacheKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const callApi = useCallApi();

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    setErrorMessage("");
  };

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLengthValid = password.length >= 8 && password.length <= 64;
    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && isLengthValid;
  };

  const handleRequestReset = (e) => {
    e.preventDefault();

    if (!isEmailValid(email)) {
      setErrorMessage("Email không hợp lệ.");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setErrorMessage(
        "Mật khẩu cần ít nhất 8 ký tự, tối đa 64 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp.");
      return;
    }

    if (email.trim() && newPassword.trim()) {
      setIsLoading(true);
      setErrorMessage("");

      callApi(
        () => DashboardRequestApi.authRequest.requestPasswordReset(email.trim()),
        (res) => {
          setIsLoading(false);
          setShowOtpInput(true);
          setErrorMessage("Vui lòng kiểm tra email để lấy mã OTP (6 chữ số)!");
          setCacheKey(res.cacheKey);
        },
        (err) => {
          setIsLoading(false);
          const apiError = err?.response?.data?.[0];
          setErrorMessage(apiError?.description || "Không thể gửi yêu cầu đặt lại mật khẩu, vui lòng thử lại!");
          console.error("Error requesting password reset:", err);
        }
      );
    } else {
      setErrorMessage("Vui lòng điền đầy đủ thông tin!");
    }
  };

  const handleResendOtp = () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    callApi(
      () => DashboardRequestApi.authRequest.requestPasswordReset(email.trim()),
      (res) => {
        setIsLoading(false);
        setErrorMessage("OTP mới đã được gửi, vui lòng kiểm tra email!");
        setCacheKey(res.cacheKey);
        setOtp("");
      },
      (err) => {
        setIsLoading(false);
        const apiError = err?.response?.data?.[0];
        setErrorMessage(apiError?.description || "Không thể gửi lại OTP, vui lòng thử lại!");
        console.error("Error resending OTP:", err);
      }
    );
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMessage("Mã OTP phải là 6 chữ số!");
      return;
    }

    const resetData = {
      email: email.trim(),
      otpCode: otp.trim(),
      newPassword: newPassword.trim(),
      cacheKey: cacheKey
    };

    callApi(
      () => DashboardRequestApi.authRequest.resetPassword(resetData),
      () => {
        setIsResetPassword(false);
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setShowOtpInput(false);
        setErrorMessage("");
        alert("Mật khẩu đã được đặt lại thành công!");
      },
      "Đặt lại mật khẩu thành công!",
      (err) => {
        const apiError = err?.response?.data?.[0];
        setErrorMessage(apiError?.description || "Mã OTP không hợp lệ, vui lòng thử lại!");
        console.error("Error resetting password:", err);
      }
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat z-20"
      style={{
        backgroundImage: `url('https://lms.hcmut.edu.vn/pluginfile.php/3/theme_academi/slide2image/1743086606/slbktv.jpg')`,
      }}
    >
      <div className="relative bg-white bg-opacity-80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full mx-4 sm:mx-10 max-w-md border border-teal-300 transform transition-all duration-300 hover:shadow-3xl">
        {/* Close button */}
        <i
          className="absolute top-2 right-2 text-2xl p-2 cursor-pointer hover:bg-teal-100 rounded-full text-teal-700 transition-all duration-200"
          onClick={() => setIsResetPassword(false)}
        >
          <IoCloseSharp />
        </i>

        {/* Logo and title */}
        <div className="flex justify-center items-center mb-6">
          <img
            src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png"
            className="w-12 sm:w-16 transition-all duration-300"
            alt="Logo"
          />
          <div className="text-2xl sm:text-3xl mr-8 font-bold tracking-tight">
            <span className="text-teal-800">Đặt lại </span>
            <span className="text-teal-600">mật khẩu</span>
          </div>
        </div>

        {/* Form */}
        {!showOtpInput ? (
          <form onSubmit={handleRequestReset}>
            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-left font-semibold text-teal-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => handleInputChange(e, setEmail)}
                className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
              />
            </div>

            {/* New Password */}
            <div className="mb-5 relative">
              <label htmlFor="newPassword" className="block text-left font-semibold text-teal-900 mb-2">
                Mật khẩu mới
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => handleInputChange(e, setNewPassword)}
                className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
              />
              <span
                className="absolute top-2/3 right-3 transform -translate-y-1/2 text-teal-700 cursor-pointer text-xl sm:text-2xl"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="mb-6 relative">
              <label
                htmlFor="confirmPassword"
                className="block text-left font-semibold text-teal-900 mb-2"
              >
                Xác nhận mật khẩu mới
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => handleInputChange(e, setConfirmPassword)}
                className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
              />
              <span
                className="absolute top-2/3 right-3 transform -translate-y-1/2 text-teal-700 cursor-pointer text-xl sm:text-2xl"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            {/* Error or success message */}
            {errorMessage && (
              <p
                className={cl("text-center mb-4 text-sm", {
                  "text-red-600 font-medium": errorMessage.includes("lỗi") || errorMessage.includes("không hợp lệ"),
                  "text-teal-600 font-medium": errorMessage.includes("OTP"),
                })}
              >
                {errorMessage}
              </p>
            )}

            {/* Reset Password Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className={cl(
                  "w-full py-3 sm:py-4 text-white font-semibold rounded-lg shadow-lg transition-all duration-300",
                  {
                    "bg-teal-700 hover:bg-teal-800 hover:shadow-xl": email && newPassword && confirmPassword && !isLoading,
                    "bg-gray-400 cursor-not-allowed": !email || !newPassword || !confirmPassword || isLoading,
                  }
                )}
                disabled={!email || !newPassword || !confirmPassword || isLoading}
              >
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            {/* OTP Input */}
            <div className="mb-5">
              <label htmlFor="otp" className="block text-left font-semibold text-teal-900 mb-2">
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="Nhập mã OTP từ email"
                value={otp}
                onChange={(e) => handleInputChange(e, setOtp)}
                className="w-full p-3 sm:p-4 border-2 border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-teal-50 text-teal-900 placeholder-teal-500 text-sm sm:text-base transition-all duration-200"
                maxLength="6"
                inputMode="numeric"
              />
            </div>

            {/* Error or success message */}
            {errorMessage && (
              <p
                className={cl("text-center mb-4 text-sm", {
                  "text-red-600 font-medium": errorMessage.includes("lỗi") || errorMessage.includes("không hợp lệ"),
                  "text-teal-600 font-medium": errorMessage.includes("OTP"),
                })}
              >
                {errorMessage}
              </p>
            )}

            {/* Verify OTP Button */}
            <div className="flex justify-center mb-4">
              <button
                type="submit"
                className={cl(
                  "w-full py-3 sm:py-4 text-white font-semibold rounded-lg shadow-lg transition-all duration-300",
                  {
                    "bg-teal-700 hover:bg-teal-800 hover:shadow-xl": otp && !isLoading,
                    "bg-gray-400 cursor-not-allowed": !otp || isLoading,
                  }
                )}
                disabled={!otp || isLoading}
              >
                {isLoading ? "Đang xác thực..." : "Xác thực OTP"}
              </button>
            </div>

            {/* Resend OTP Button */}
            {errorMessage.includes("không hợp lệ") && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className={cl(
                    "w-full py-3 sm:py-4 text-white font-semibold rounded-lg shadow-lg transition-all duration-300",
                    {
                      "bg-teal-600 hover:bg-teal-700 hover:shadow-xl": !isLoading,
                      "bg-gray-400 cursor-not-allowed": isLoading,
                    }
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi lại OTP"}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Back to Login Link */}
        <p className="text-center text-teal-800 mt-4 text-sm sm:text-base">
          Đã có tài khoản?{" "}
          <span
            className="underline cursor-pointer hover:text-teal-900 font-semibold transition-colors duration-200"
            onClick={() => setIsResetPassword(false)}
          >
            Đăng nhập
          </span>
        </p>
      </div>
    </div>
  );
}

export default memo(ResetPassword);