import axiosClient from "./axiosClient"

const MedicineRequestApi = {
    medicineRequest: {
        getAllMedicineByFarmId: async (farmId) => await axiosClient.get(`/Medicine?farmId=${farmId}&pageSize=200&pageNumber=1`),
        createMedicine: async (data) => await axiosClient.post(`/Medicine`, data),
        updateMedicine: async (data) => await axiosClient.put(`/Medicine`, data),
        deleteMedicine: async (medicineId) => await axiosClient.delete(`/Medicine?medicineId=${medicineId}`)
    },
}


export default MedicineRequestApi;