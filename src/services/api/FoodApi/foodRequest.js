import axiosClient from "./axiosClient"

const FoodRequestApi = {
    foodRequest: {
        getAllFoodByFarmId: async (farmId) => await axiosClient.get(`/Food?farmId=${farmId}&pageSize=200&pageNumber=1`),
        createFood: async (data) => await axiosClient.post(`/Food`, data),
        updateFood: async (data) => await axiosClient.put(`/Food`, data),
        deleteFood: async (foodId) => await axiosClient.delete(`/Food?foodId=${foodId}`)
    },
}


export default FoodRequestApi;