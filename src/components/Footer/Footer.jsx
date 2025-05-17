import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaTiktok } from 'react-icons/fa'; // Sử dụng react-icons để thêm biểu tượng mạng xã hội

const Footer = () => {
  return (
    <footer className="w-full bg-teal-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-start">
        {/* Phần thông tin liên hệ */}
        <div className="text-sm mb-4 sm:mb-0">
          <div className="flex items-center mb-2">
            <img
              src="https://hcmut.edu.vn/img/nhanDienThuongHieu/01_logobachkhoatoi.png" // Thay bằng đường dẫn đến logo của bạn
              alt="Logo"
              className="h-8 mr-2"
            />
            <h3 className="font-bold">
              FARM MANAGEMENT SYSTEM
            </h3>
          </div>
          <p className="mb-1">
            <span className="font-semibold">Head Office:</span> 123 Farm Street, District 1, Ho Chi Minh City (Closed)
          </p>
          <p className="mb-1">
            <span className="font-semibold">Branch:</span> 456 Green Road, Thu Duc City, Ho Chi Minh City (Closed)
          </p>
        </div>

        {/* Phần liên kết và thông tin bổ sung */}
        <div className="text-sm mb-4 sm:mb-0">
          <h4 className="font-bold mb-2">Contact Information & Support</h4>
          <p className="mb-1">
            <span className="font-semibold">Students:</span>{' '}
            <a href="https://myfarm.com" className="hover:text-teal-300 transition">
              MyFarm
            </a>
          </p>
          <p className="mb-1">
            <span className="font-semibold">Email:</span>{' '}
            <a href="mailto:support@farmmanagement.com" className="hover:text-teal-300 transition">
              support@farmmanagement.com
            </a>
          </p>
          <p className="mb-1">
            <span className="font-semibold">Sample Email Form:</span>{' '}
            <a href="/contact-form" className="hover:text-teal-300 transition">
              Contact Form
            </a>
          </p>
        </div>

        {/* Phần liên kết mạng xã hội */}
        <div className="flex space-x-4">
          <a href="https://facebook.com" className="hover:text-teal-300 transition">
            <FaFacebook size={24} />
          </a>
          <a href="https://instagram.com" className="hover:text-teal-300 transition">
            <FaInstagram size={24} />
          </a>
          <a href="https://youtube.com" className="hover:text-teal-300 transition">
            <FaYoutube size={24} />
          </a>
          <a href="https://linkedin.com" className="hover:text-teal-300 transition">
            <FaLinkedin size={24} />
          </a>
          <a href="https://tiktok.com" className="hover:text-teal-300 transition">
            <FaTiktok size={24} />
          </a>
        </div>
      </div>

      {/* Phần bản quyền và lượt truy cập */}
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center border-t border-teal-700 pt-2 mt-2 text-sm">
        <p>
          © {new Date().getFullYear()} Farm Management System – FMS. All rights reserved.
        </p>
       
      </div>
    </footer>
  );
};

export default Footer;