import React, { Fragment } from 'react'; // Import Fragment từ React
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import routes from './routes';
import useSignalR from './hooks/useSignalR'; // Import hook SignalR

function App() {
    // useSignalR(); // Kích hoạt SignalR toàn cục

    return (
        <>
            {/* Cấu hình ToastContainer để hiển thị thông báo */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
            />

            {/* Định tuyến cho ứng dụng */}
            <Routes>
                {routes.map((route) => {
                    const Component = route.component;

                    return (
                        <Fragment key={route.path}>
                            <Route path={route.path} element={<Component />} />
                        </Fragment>
                    );
                })}
            </Routes>
        </>
    );
}

export default App;
