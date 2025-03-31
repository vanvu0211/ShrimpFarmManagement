import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import hubConnection from '/src/services/signalr/productionProgress/hubConnection.js';

const useSignalR = (onMachineStatusChanged) => {
    const connectionRef = useRef(null);
    const isMountedRef = useRef(true);

    const handleMachineStatusChanged = useCallback((data) => {
        console.log('Handling MachineStatusChanged:', data);
        if (typeof onMachineStatusChanged === 'function') {
            onMachineStatusChanged(data); // Gửi dữ liệu thô, không cần parse JSON vì server đã gửi object
        }
    }, [onMachineStatusChanged]);

    const connectSignalR = useCallback(async () => {
        if (!hubConnection || typeof hubConnection.start !== 'function') {
            console.error('Invalid hubConnection:', hubConnection);
            toast.error('Lỗi cấu hình SignalR.');
            return;
        }

        if (connectionRef.current?.state === 'Connected') {
            console.log('SignalR already connected');
            return;
        }

        try {
            const connection = await hubConnection.start();
            if (isMountedRef.current) {
                connectionRef.current = connection;
                console.log('SignalR connected successfully');

                // Lắng nghe các sự kiện từ server
                connection.on('ErrorNotification', (data) => {
                    console.log('ErrorNotification:', data);
                    toast.error(`Lỗi: ${data.name || 'Không xác định'}, trạng thái: ${data.status || 'Không rõ'}`);
                });


                connection.on('MachineStatusChanged', (data) => {
                    try {
                        const parsedData = JSON.parse(data);
                        // Kiểm tra xem onMachineStatusChanged có phải là hàm trước khi gọi
                        if (typeof onMachineStatusChanged === 'function') {
                            onMachineStatusChanged(parsedData);
                        } else {
                            console.warn('onMachineStatusChanged is not a function, skipping callback.');
                        }
                    } catch (error) {
                        console.error('Failed to parse MachineStatusChanged data:', error);

                    }
                });
            }
        } catch (error) {
            if (isMountedRef.current) {
                console.error('SignalR connection error:', error);
                toast.error('Không thể kết nối tới máy chủ SignalR.');
                setTimeout(connectSignalR, 2000); // Thử lại sau 2 giây
            }
        }
    }, [handleMachineStatusChanged]);

    useEffect(() => {
        connectSignalR();

        return () => {
            isMountedRef.current = false;
            if (connectionRef.current?.state === 'Connected') {
                hubConnection.stop()
                    .then(() => console.log('SignalR connection stopped'))
                    .catch((err) => console.error('Error stopping SignalR:', err));
            }
            connectionRef.current = null;
        };
    }, [connectSignalR]);

    return {
        isConnected: connectionRef.current?.state === 'Connected',
        connection: connectionRef.current,
    };
};

export default useSignalR;