import { useEffect } from 'react';
import { toast } from 'react-toastify';
import hubConnection from '../services/signalr/productionProgress/hubConnection';

const useSignalR = (onMachineStatusChanged) => {
    useEffect(() => {
        let connection;

        const connectSignalR = async () => {
            try {
                connection = await hubConnection.start();
                console.log('SignalR connected successfully');

                connection.on('ErrorNotification', (data) => {
                    try {
                        const parsedData = JSON.parse(data);
                        toast.error(`Lỗi: ${parsedData.name || 'Không xác định'}, status: ${parsedData.status || 'Không rõ'}`);
                    } catch (error) {
                        console.error('Failed to parse ErrorNotification data:', error);
                        toast.error('Không thể xử lý thông báo lỗi.');
                    }
                });

                connection.on('MachineStatusChanged', (data) => {
                    try {
                        const parsedData = JSON.parse(data);
                        // Kiểm tra xem onMachineStatusChanged có phải là hàm trước khi gọi
                        if (typeof onMachineStatusChanged === 'function') {
                            onMachineStatusChanged(parsedData);
                        } else {
                            // console.warn('onMachineStatusChanged is not a function, skipping callback.');
                        }
                    } catch (error) {
                        console.error('Failed to parse MachineStatusChanged data:', error);
                    }
                });

            } catch (error) {
                console.error('SignalR connection error:', error);
                toast.error('Không thể kết nối tới máy chủ thông báo.');
            }
        };

        connectSignalR();

        return () => {
            if (connection) {
                connection.stop();
                console.log('SignalR connection stopped');
            }
        };
    }, [onMachineStatusChanged]);

    return null;
};

export default useSignalR;