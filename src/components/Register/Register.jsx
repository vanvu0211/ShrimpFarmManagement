import { useState, memo } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi';
import { DashboardRequestApi } from '../../services/api';

function Register({ setIsRegister, onRegisterSuccess }) { 
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const callApi = useCallApi();

    const handleCloseModal = (e) => {
        if (e.target === e.currentTarget) {
            setIsRegister(false);
        }
    };

    const handleInputChange = (e, setter) => {
        setter(e.target.value);
        setErrorMessage('');
    };

    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isPasswordValid = (password) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUppercase && hasNumber && hasSpecialChar;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (!isEmailValid(email)) {
            setErrorMessage('Email không hợp lệ.');
            return;
        }
    
        if (!isPasswordValid(password)) {
            setErrorMessage('Mật khẩu cần chữ cái in hoa, số và ký tự đặc biệt.');
            return;
        }
    
        if (password !== confirmPassword) {
            setErrorMessage('Mật khẩu nhập lại không khớp.');
            return;
        }
    
        if (username.trim() && email.trim() && password.trim()) {
            const data = { username: username.trim(), email: email.trim(), password: password.trim() };
            setIsLoading(true);

            callApi(
                () => DashboardRequestApi.authRequest.register(data),
                (res) => {
                    setIsLoading(false);
                    onRegisterSuccess();
                    setIsRegister(false);
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                },
                'Đăng ký thành công!',
                (err) => {
                    setIsLoading(false);
                    const apiError = err?.response?.data?.[0];
                    setErrorMessage(apiError?.description || 'Có lỗi xảy ra, thử lại sau!');
                    console.error('Error:', err);
                }
            );
        } else {
            setErrorMessage('Vui lòng điền đầy đủ thông tin!');
        }
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100 z-20"
            onClick={handleCloseModal}
        >
            <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full mx-10 max-w-md border-2 border-teal-200">
                {/* Nút đóng */}
                <i 
                    className="absolute top-2 right-2 text-2xl p-2 cursor-pointer hover:bg-teal-100 rounded-full text-teal-600"
                    onClick={() => setIsRegister(false)}
                >
                    <IoCloseSharp />
                </i>

                {/* Logo hoặc tiêu đề */}
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

                {/* Form đăng ký */}
                <form onSubmit={handleSubmit}>
                    {/* Tài khoản */}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-left font-medium text-teal-800 mb-1">Tài khoản</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Nhập tài khoản"
                            value={username}
                            onChange={(e) => handleInputChange(e, setUsername)}
                            className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50" 
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-left font-medium text-teal-800 mb-1">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => handleInputChange(e, setEmail)}
                            className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50" 
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-left font-medium text-teal-800 mb-1">Mật khẩu</label>
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="password" 
                            name="password" 
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => handleInputChange(e, setPassword)}
                            className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50" 
                        />
                        <span
                            className="absolute top-10 right-3 text-teal-600 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    {/* Nhập lại mật khẩu */}
                    <div className="mb-6 relative">
                        <label htmlFor="confirmPassword" className="block text-left font-medium text-teal-800 mb-1">Xác nhận mật khẩu</label>
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword" 
                            name="confirmPassword" 
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => handleInputChange(e, setConfirmPassword)}
                            className="w-full p-3 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50" 
                        />
                        <span
                            className="absolute top-10 right-3 text-teal-600 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    {/* Hiển thị lỗi */}
                    {errorMessage && (
                        <p className="text-red-500 text-center mb-4 text-sm">{errorMessage}</p>
                    )}

                    {/* Nút đăng ký */}
                    <div className="flex justify-center">
                        <button 
                            type="submit" 
                            className={cl("bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg shadow-md w-full transition duration-200", {
                                'opacity-50 cursor-not-allowed': (!username || !email || !password || !confirmPassword) || isLoading
                            })}
                            disabled={!username || !email || !password || !confirmPassword || isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                        </button>
                    </div>
                </form>

                {/* Link chuyển sang đăng nhập */}
                <p className="text-center text-teal-700 mt-4">
                    Đã có tài khoản?{" "}
                    <span 
                        className="underline cursor-pointer hover:text-teal-900"
                        onClick={() => setIsRegister(false)} // Giả sử có một hàm chuyển sang login
                    >
                        Đăng nhập
                    </span>
                </p>
            </div>
        </div>
    );
}

export default memo(Register);