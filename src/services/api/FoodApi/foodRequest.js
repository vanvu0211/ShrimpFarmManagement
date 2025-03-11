import axiosClient from "./axiosClient"

const FoodRequestApi = {
    foodRequest: {
        getAllFood: async () => await axiosClient.get(`/Food?pageSize=200&pageNumber=1`),
        createFood: async (data) => await axiosClient.post(`/Food`, data),
        updateFood: async (data) => await axiosClient.put(`/Food`, data),
        deleteFood: async (foodname) => await axiosClient.delete(`/Food?FoodName=${foodname}`)
    },
}


export default FoodRequestApi;