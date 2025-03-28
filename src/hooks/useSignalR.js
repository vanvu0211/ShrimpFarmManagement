import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import hubConnection from '../services/signalr/productionProgress/hubConnection';

const useSignalR = (onMachineStatusChanged) => {
    const connectionRef = useRef(null); // Lưu trữ connection để sử dụng xuyên suốt

    useEffect(() => {
        let isMounted = true; // Đánh dấu component còn tồn tại

        const connectSignalR = async () => {
            if (connectionRef.current?.state === 'Connected') {
                console.log('SignalR already connected');
                return; // Không khởi tạo lại nếu đã kết nối
            }

            try {
                const connection = await hubConnection.start();
                if (isMounted) {
                    connectionRef.current = connection;
                    console.log('SignalR connected successfully');

                    // Đăng ký sự kiện ErrorNotification
                    connection.on('ErrorNotification', (data) => {
                        try {
                            const parsedData = JSON.parse(data);
                            toast.error(`Lỗi: ${parsedData.name || 'Không xác định'}, status: ${parsedData.status || 'Không rõ'}`);
                        } catch (error) {
                            console.error('Failed to parse ErrorNotification data:', error);
                            toast.error('Không thể xử lý thông báo lỗi.');
                        }
                    });

                    // Đăng ký sự kiện MachineStatusChanged
                    connection.on('MachineStatusChanged', (data) => {
                        try {
                            const parsedData = JSON.parse(data);
                            if (typeof onMachineStatusChanged === 'function') {
                                onMachineStatusChanged(parsedData);
                            }
                        } catch (error) {
                            console.error('Failed to parse MachineStatusChanged data:', error);
                        }
                    });

                    // Xử lý khi mất kết nối
                    connection.onclose((error) => {
                        if (isMounted) {
                            console.log('SignalR disconnected:', error);
                            // toast.warn('Mất kết nối SignalR, đang thử kết nối lại...');
                            setTimeout(connectSignalR, 2000); // Thử kết nối lại sau 2 giây
                        }
                    });
                }
            } catch (error) {
                if (isMounted) {
                    console.error('SignalR connection error:', error);
                    toast.error('Không thể kết nối tới máy chủ thông báo.');
                    setTimeout(connectSignalR, 2000); // Thử lại sau 2 giây nếu thất bại
                }
            }
        };

        connectSignalR();

        // Cleanup khi component unmount
        return () => {
            isMounted = false;
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
                console.log('SignalR connection stopped');
            }
        };
    }, [onMachineStatusChanged]); // Dependency array giữ nguyên

    return null;
};

export default useSignalR;