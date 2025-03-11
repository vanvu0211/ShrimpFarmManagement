import axiosClient from "./axiosClient"

const MedicineRequestApi = {
    medicineRequest: {
        getAllMedicine: async () => await axiosClient.get(`/Medicine?pageSize=200&pageNumber=1`),
        createMedicine: async (data) => await axiosClient.post(`/Medicine`, data),
        updateMedicine: async (data) => await axiosClient.put(`/Medicine`, data),
        deleteMedicine: async (medicinename) => await axiosClient.delete(`/Medicine?MedicineName=${medicinename}`)
    },
}


export default MedicineRequestApi;