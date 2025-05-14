import axiosClient from "./axiosClient"

const FarmRequestApi = {
    farmRequest: {
        getAllFarmByEmail: async (email) => await axiosClient.get(`/Farm?email=${email}&pageSize=200&pageNumber=1`),
        getMember: async (farmId) => await axiosClient.get(`/Farm/GetMember?farmId=${farmId}`),
        createFarm: async (data) => await axiosClient.post(`/Farm`, data),
        deleteFarm: async (farmId,email) => await axiosClient.delete(`/Farm?farmId=${farmId}&email=${email}`),
        invite: async (data) => await axiosClient.put(`/Farm/InviteMember`,data),
        remove: async (data) => await axiosClient.put(`/Farm/RemoveMember`,data),
        updateRole: async (data) => await axiosClient.put(`/Farm/UpdateMember`,data),
    },
}


export default FarmRequestApi;