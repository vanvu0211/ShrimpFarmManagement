import axiosClient from "./axiosClient"

const ShrimpRequestApi = {
    ShrimpRequest: {
        feedingFood: async (data) => await axiosClient.post(`/Update/Food`, data),
        feedingMedicine: async (data) => await axiosClient.post(`/Update/Medicine`, data),
        updateLossShrimp: async() => await axiosClient.post('Update/LossShrimp', data),
        updateSizeShrimp: async() => await axiosClient.post('Update/SizeShrimp', data),

        getFeedingFood: async(pondId, date) => await axiosClient.get(`Update/FoodFeeding?PondId=${pondId}&date=${date}&pageSize=200&pageNumber=1`),
        getFeedingMedicine: async(pondId, date) => await axiosClient.get(`Update/MedicineFeeding?date=${date}&pondId=${pondId}&pageSize=200&pageNumber=1`),
        getLossShrimp: async(pondId, date) => await axiosClient.get(`Update/LossShrimp?PondId=${pondId}&date=${date}&pageSize=200&pageNumber=1`),
        getSizeShrimp: async(pondId, date) => await axiosClient.get(`Update/SizeShrimp?PondId=${pondId}&date=${date}&pageSize=200&pageNumber=1`)
    },
}


export default ShrimpRequestApi;