import { useState, memo } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Icon hiển thị/ẩn mật khẩu
import cl from 'classnames';
import useCallApi from '../../hooks/useCallApi'; // Hook đã có sẵn
import { DashboardRequestApi } from '../../services/api'; // API service đã có sẵn

function Register({ setIsRegister, onRegisterSuccess }) { 
    const [username, setUsername] = useState(''); // State lưu tài khoản
    const [email, setEmail] = useState(''); // State lưu email
    const [password, setPassword] = useState(''); // State lưu mật khẩu
    const [confirmPassword, setConfirmPassword] = useState(''); // State lưu mật khẩu nhập lại
    const [showPassword, setShowPassword] = useState(false); // Hiển thị/ẩn mật khẩu
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Hiển thị/ẩn mật khẩu nhập lại
    const [errorMessage, setErrorMessage] = useState(''); // Lưu lỗi
    const [isLoading, setIsLoading] = useState(false); // Xử lý trạng thái đang tải
    const callApi = useCallApi(); // Hook gọi API

    // Đóng modal khi click ra ngoài
    const handleCloseModal = (e) => {
        if (e.target === e.currentTarget) {
            setIsRegister(false);
        }
    };

    // Xử lý khi người dùng nhập
    const handleInputChange = (e, setter) => {
        setter(e.target.value);
        setErrorMessage('');
    };

    // Kiểm tra email hợp lệ
    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Kiểm tra mật khẩu hợp lệ
    const isPasswordValid = (password) => {
        const hasUppercase = /[A-Z]/.test(password); // Chứa ít nhất một chữ cái in hoa
        const hasNumber = /\d/.test(password); // Chứa ít nhất một chữ số
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Chứa ít nhất một ký tự đặc biệt
        return hasUppercase && hasNumber && hasSpecialChar;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (!isEmailValid(email)) {
            setErrorMessage('Email không hợp lệ.');
            return;
        }
    
        if (!isPasswordValid(password)) {
            setErrorMessage('Mật khẩu phải chứa ít nhất 1 chữ cái in hoa, 1 số và 1 ký tự đặc biệt.');
            return;
        }
    
        if (password !== confirmPassword) {
            setErrorMessage('Mật khẩu nhập lại không khớp.');
            return;
        }
    
        if (username.trim() && email.trim() && password.trim()) {
            const data = {
                username: username.trim(),
                email: email.trim(),
                password: password.trim(),
            };
    
            setIsLoading(true);
    
            // Gọi API đăng ký
            callApi(
                () => DashboardRequestApi.authRequest.register(data),
                (res) => {
                    setIsLoading(false);
                    onRegisterSuccess(); // Thông báo thành công
                    setIsRegister(false); // Đóng modal
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                },
                'Đăng ký thành công!',
                (err) => {
                    setIsLoading(false);
    
                    // Kiểm tra lỗi từ server
                    if (err?.response?.data && Array.isArray(err.response.data)) {
                        const apiError = err.response.data[0]; // Lấy lỗi đầu tiên
                        setErrorMessage(apiError.description || 'Đã có lỗi xảy ra!');
                    } else {
                        setErrorMessage('Đã có lỗi xảy ra, vui lòng thử lại!');
                    }
    
                    console.error('Error:', err);
                }
            );
        } else {
            setErrorMessage('Tài khoản, email và mật khẩu không được để trống!');
        }
    };
    

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-30 z-20"
            onClick={handleCloseModal}
        >
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[400px] min-h-[500px] border-2 border-black">
                {/* Nút đóng */}
                <i 
                    className="absolute top-0 right-0 text-2xl p-3 cursor-pointer hover:bg-gray-400 rounded-full"
                    onClick={() => setIsRegister(false)}
                >
                    <IoCloseSharp />
                </i>

                {/* Tiêu đề */}
                <header className="text-xl font-bold text-center uppercase mb-4">Đăng ký tài khoản</header>

                {/* Form đăng ký */}
                <form onSubmit={handleSubmit}>
                    {/* Tài khoản */}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-left font-semibold mb-2">Tài khoản:</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Nhập tài khoản"
                            value={username}
                            onChange={(e) => handleInputChange(e, setUsername)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-left font-semibold mb-2">Email:</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => handleInputChange(e, setEmail)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-left font-semibold mb-2">Mật khẩu:</label>
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="password" 
                            name="password" 
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => handleInputChange(e, setPassword)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
                        />
                        {/* Nút hiện/ẩn mật khẩu */}
                        <span
                            className="absolute top-8 right-3 text-gray-500 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    {/* Nhập lại mật khẩu */}
                    <div className="mb-6 relative">
                        <label htmlFor="confirmPassword" className="block text-left font-semibold mb-2">Nhập lại mật khẩu:</label>
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword" 
                            name="confirmPassword" 
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => handleInputChange(e, setConfirmPassword)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
                        />
                        {/* Nút hiện/ẩn mật khẩu nhập lại */}
                        <span
                            className="absolute top-8 right-3 text-gray-500 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    {/* Hiển thị lỗi */}
                    {errorMessage && (
                        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
                    )}

                    {/* Nút đăng ký */}
                    <div className="flex justify-center">
                        <button 
                            type="submit" 
                            className={cl("bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-md w-40", {
                                'opacity-50 cursor-not-allowed': (!username || !email || !password || !confirmPassword) || isLoading
                            })}
                            disabled={!username || !email || !password || !confirmPassword || isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default memo(Register);
