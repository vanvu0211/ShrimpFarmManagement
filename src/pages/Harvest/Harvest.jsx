import 'react-datepicker/dist/react-datepicker.css'; // Import CSS cho DatePicker
// import useCallApi from '../../hooks/useCallApi';
import HarvestForm from '../../components/HarvestForm'
import Loading from '../../components/Loading';
import { ToastContainer, toast } from "react-toastify"; // Import thêm toast
import Sidebar from '../../components/Sidebar';

import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react';



function Harvest() {
    // const callApi = useCallApi();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F2F4F7] ">
            <aside className="h-full">
                <Sidebar />
            </aside>
            <div className="grow pt-5">
                
                <main className="scroll-y h-[calc(100vh-50px)] p-5">
                   <HarvestForm   
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

export default Harvest;
