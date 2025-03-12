import 'react-datepicker/dist/react-datepicker.css'; // Import CSS cho DatePicker
// import useCallApi from '../../hooks/useCallApi';
import Sidebar from '../../components/Sidebar';
import HarvestForm from '../../components/TransferForm'
import Loading from '../../components/Loading';
import { ToastContainer, toast } from "react-toastify"; // Import thêm toast
import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react';
import TransferForm from '../../components/TransferForm';



function Transfer() {
    // const callApi = useCallApi();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F2F4F7] ">
            <aside className="h-full">
                <Sidebar />
            </aside>
            <div className="flex-1 overflow-y-auto">
                
                <main className="scroll-y h-[calc(100vh-50px)] p-5">
                   <  TransferForm 
                   />
                </main>
            </div>
            
                <ToastContainer 
                        position="top-right" 
                        autoClose={3000} 
                        hideProgressBar={false} 
                        newestOnTop={false} 
                        closeOnClick 
                        pauseOnHover 
                    />
        </div>
    );
}

export default Transfer;
