import axiosClient from "./axiosClient"

const EvistaRequestApi = {
    evistraRequest: {
        getTempRequest: async (pondId, name,startDate,endDate) => await axiosClient.get(`/Environment?pondId=${pondId}&name=${name}&startDate=${startDate}&endDate=${endDate}&pageSize=200&pageNumber=1`),
    }
}

export default EvistaRequestApi;