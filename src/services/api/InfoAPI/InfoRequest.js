import axiosClient from "./axiosClient"

const infoRequestApi = {
    foodRequest: {
        createFoodRequest: async (data) => await axiosClient.post("/Update/Food", data),
        createNewFoodRequest: async (data) => await axiosClient.post("/Food", data),
        getFoodRequest: async () => await axiosClient.get("/Food?pageSize=200&pageNumber=1"),
        getFoodRequestByName: async (name) => await axiosClient.get(`/Food?search=${name}&pageSize=200&pageNumber=1`),
        deleteFoodRequest: async (food) => await axiosClient.delete(`/Food?FoodName=${food}`)
    },
    medicineRequest: {
        createMedicineRequest: async (data) => await axiosClient.post("/Update/Medicine", data),
        createNewMedicineRequest: async (data) => await axiosClient.post("Medicine", data),
        getMedicineRequest: async () => await axiosClient.get("/Medicine?pageSize=200&pageNumber=1"),
        getMedicineRequestByName: async (name) => await axiosClient.get(`Medicine?search=${name}&pageSize=200&pageNumber=1`),
        deleteMedicineRequest: async (medicine) => await axiosClient.delete(`/Medicine?MedicineName=${medicine}`)
    },
    shrimpSizeRequest: {
        createShrimpSizeRequest: async (data) => await axiosClient.post("/Update/Medicine", data),
        createShrimpLossRequest: async (data) => await axiosClient.post("/Update/Medicine", data)
    }
}


export default infoRequestApi;