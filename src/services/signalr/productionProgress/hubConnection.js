import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';

const connection = new HubConnectionBuilder() //Lớp tạo một kết nối tới một SignalR Hub
    .withUrl('http://103.170.122.142:5000/machineHub', {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000]) // Tùy chỉnh thời gian thử kết nối lại
    .build();

const hubConnection = {
    connection,
    start: async () => {
        try {
            if (connection.state === 'Disconnected') {
                await connection.start();
                console.log('Connected to WebSocket server:', connection.state);

                // Lắng nghe sự kiện MachineStatusChanged
                connection.on('MachineStatusChanged', (data) => {
                    console.log('Received MachineStatusChanged event:', data);
                    console.log('Machine Name:', data.Name);
                    console.log('Status:', data.Value);
                    console.log('Timestamp:', data.TimeStamp);

                    // Xử lý dữ liệu theo nhu cầu
                    if (data.Value === 'ON') {
                        console.log(`${data.Name} is turned ON at ${data.TimeStamp}`);
                    } else {
                        console.log(`${data.Name} is turned OFF at ${data.TimeStamp}`);
                    }
                });

                // Xử lý khi kết nối đóng
                connection.onclose((err) => {
                    console.log('Connection closed:', err ? err.message : 'No error');
                });

                return connection;
            } else {
                console.log('Connection already in state:', connection.state);
                return connection;
            }
        } catch (error) {
            console.error('Failed to start SignalR connection:', error);
            throw error; // Ném lỗi để hook xử lý
        }
    },
    stop: async () => {
        try {
            if (connection.state === 'Connected') {
                await connection.stop();
                console.log('SignalR connection stopped');
            }
        } catch (error) {
            console.error('Failed to stop SignalR connection:', error);
        }
    },
};

export default hubConnection;