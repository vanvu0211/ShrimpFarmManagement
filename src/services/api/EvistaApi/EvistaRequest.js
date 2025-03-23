import axiosClient from "./axiosClient"

const EvistaRequestApi = {
    TemperatureRequest: {
        getTempRequest: async (pondId, name,startDate,endDate) => await axiosClient.get(`/Environment?pondId=${pondId}&name=${name}&startDate=${startDate}&endDate=${startDate}&pageSize=200&pageNumber=1`),
        createRequest: async (data) => await axiosClient.post(`https://localhost:7220/api/Environment`, data)
    }
}

export default EvistaRequestApi;