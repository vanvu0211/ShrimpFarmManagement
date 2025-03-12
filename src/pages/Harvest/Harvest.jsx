import 'react-datepicker/dist/react-datepicker.css';
import HarvestForm from '../../components/HarvestForm';
import Loading from '../../components/Loading';
import { ToastContainer, toast } from "react-toastify";
import Sidebar from '../../components/Sidebar';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react';
import TransferForm from '../../components/TransferForm';

function Harvest() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Thêm state cho sidebar

    return (
        <div className="flex h-screen overflow-hidden bg-[#F2F4F7] ">
        <aside className="h-full">
            <Sidebar />
        </aside>
        <div className="flex-1 overflow-y-auto">
            
            <main className="scroll-y  p-5">
               <  HarvestForm 
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