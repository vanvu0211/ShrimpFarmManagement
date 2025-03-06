import axiosClient from "./axiosClient"

const FarmRequestApi = {
    farmRequest: {
        getAllFarmByUserName: async (username) => await axiosClient.get(`/Farm?userName=${username}&pageSize=200&pageNumber=1`),
        createFarm: async (data) => await axiosClient.post(`/Farm`, data),
        deleteFarm: async (username, farmName) => await axiosClient.delete(`/Farm?farmName=${farmName}&userName=${username}`)
    },
}


export default FarmRequestApi;