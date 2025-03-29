import axiosClient from "./axiosClient"

const AlarmRequestApi = {
    alarmRequest: {
        getAllAlarmByFarmId: async (farmId, startDate, endDate,pageSize, currentPage) => await axiosClient.get(`/Alarm?farmId=${farmId}&startDate=${startDate}&endDate=${endDate}&pageSize=${pageSize}&pageNumber=${currentPage}`),
        // createFarm: async (data) => await axiosClient.post(`/Farm`, data),
        // deleteFarm: async (farmId) => await axiosClient.delete(`/Farm?farmId=${farmId}`)
    },
}


export default AlarmRequestApi;