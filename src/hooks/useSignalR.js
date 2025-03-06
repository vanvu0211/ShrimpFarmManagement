import { useEffect } from 'react';
import { toast } from 'react-toastify';
import hubConnection from '../services/signalr/productionProgress/hubConnection'; // Đường dẫn chính xác đến SignalR hub

const useSignalR = () => {
    useEffect(() => {
        let connection;

        const connectSignalR = async () => {
            try {
                connection = await hubConnection.start(); // Khởi động SignalR
                console.log('SignalR connected successfully');

                // Lắng nghe sự kiện "ErrorNotification"
                connection.on('ErrorNotification', (data) => {
                    try {
                        const parsedData = JSON.parse(data); // Parse JSON từ backend
                        toast.error(`Lỗi: ${parsedData.name || 'Không xác định'}, status: ${parsedData.status || 'Không rõ'}`); // Hiển thị thông báo lỗi
                    } catch (error) {
                        console.error('Failed to parse ErrorNotification data:', error);
                        toast.error('Không thể xử lý thông báo lỗi.');
                    }
                });
            } catch (error) {
                console.error('SignalR connection error:', error);
                toast.error('Không thể kết nối tới máy chủ thông báo.');
            }
        };

        connectSignalR();

        return () => {
            // Cleanup khi unmount
            if (connection) {
                connection.stop();
                console.log('SignalR connection stopped');
            }
        };
    }, []);
};

export default useSignalR;
