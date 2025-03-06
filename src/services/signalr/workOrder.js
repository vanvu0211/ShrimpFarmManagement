import connection from "./connection"

const handleGetWorkOrderProgress = (resolve, reject) => {
    connection
        .start()
        .then((conn) => {
            conn.on("UpdateWorkOrderProgress", resolve)
        })
        .catch(reject)

    return connection
}

const handleWorkOrderCompleted = (resolve, reject) => {
    connection
        .start()
        .then((conn) => {
            conn.on("WorkOrderCompleted", resolve)
        })
        .catch(reject)

    return connection
}
const handleWorkOrderProgressUpdated = (resolve, reject) => {
    connection
        .start()
        .then((conn) => {
            conn.on("WorkOrderProgressUpdated", resolve)
        })
        .catch(reject)

    return connection
}

// Hàm lắng nghe sự kiện ErrorNotification
const handleErrorNotification = (resolve, reject) => {
    connection
        .start() // Khởi động kết nối SignalR
        .then((conn) => {
            // Đăng ký lắng nghe sự kiện `ErrorNotification`
            conn.on("ErrorNotification", (data) => {
                console.log("Received ErrorNotification:", data); // Log dữ liệu nhận được
                resolve(data); // Trả dữ liệu qua callback resolve
            });
        })
        .catch((error) => {
            console.error("SignalR connection error:", error); // Xử lý lỗi kết nối
            reject(error); // Trả lỗi qua callback reject
        });

    return connection; // Trả về đối tượng kết nối
};

export { handleGetWorkOrderProgress, handleWorkOrderCompleted, handleWorkOrderProgressUpdated, handleErrorNotification }
