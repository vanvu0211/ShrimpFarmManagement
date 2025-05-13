import axiosClient from "./axiosClient"

const FarmRequestApi = {
    farmRequest: {
        getAllFarmByEmail: async (email) => await axiosClient.get(`/Farm?email=${email}&pageSize=200&pageNumber=1`),
        createFarm: async (data) => await axiosClient.post(`/Farm`, data),
        deleteFarm: async (farmId) => await axiosClient.delete(`/Farm?farmId=${farmId}`)
    },
}


export default FarmRequestApi;