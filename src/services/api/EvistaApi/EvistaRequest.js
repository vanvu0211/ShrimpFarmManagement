import axiosClient from "./axiosClient"

const EvistaRequestApi = {
    TemperatureRequest: {
        getTempRequest: async (id, name) => await axiosClient.get(`/Environment?pondId=${id}&name=${name}&startDate=2024-06-07&endDate=2024-09-25&pageSize=200&pageNumber=1`),
    }
}

export default EvistaRequestApi;