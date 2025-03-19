import axiosClient from "./axiosClient"

const DashboardRequestApi = {
    pondTypeRequest: {
        getPondTypeRequestByFamrId: async (farmId) => await axiosClient.get(`/PondType?farmId=${farmId}&pageSize=200&pageNumber=1`),
        getPondTypeRequestByFarmName: async (farmName = "") => await axiosClient.get(`/PondType?farmName=${farmName}&pageSize=200&pageNumber=1`),

        createPondTypeRequest: async (data) => await axiosClient.post("/PondType", data),

        deletePondTypeRequest: async (pondTypeId) => await axiosClient.delete(`/PondType?pondTypeId=${pondTypeId}`),
        
    },
    pondRequest: {
        getPondRequest: async () => await axiosClient.get("/Pond?pageSize=200&pageNumber=1"),
        getPondRequestByFarmId: async (farmId) => await axiosClient.get( `Pond?farmId=${farmId}&pageSize=200&pageNumber=1`),
        getPondRequestByPondType: async (pondTypeName = "") => await axiosClient.get(`/Pond?pondTypeName=${pondTypeName}&pageSize=200&pageNumber=1`),
        getPondRequestByPondTypeIdAndFarmId: async (pondTypeId,farmId) => await axiosClient.get(`/Pond?farmId=${farmId}&pondTypeId=${pondTypeId}&pageSize=200&pageNumber=1`),
        getPondRequestById: async (id ="", pondTypeName = "") => await axiosClient.get(`/Pond?pondId=${id}&pondTypeName=${pondTypeName}&pageSize=200&pageNumber=1`),
        getPondRequestByStatus: async (farmId, status ="") => await axiosClient.get(`Pond?farmId=${farmId}&pondStatus=${status}&pageSize=200&pageNumber=1`),
        getPondRequestByUsernameAndFarmName: async (username, farmName) => await axiosClient.get(`/Pond/GetPondAd?userName=${username}&farmName=${farmName}`),
        
        createPondRequest: async (data) => await axiosClient.post("Pond/CreatePond", data),
        updatePondRequest: async (data) => await axiosClient.put("/Pond/ActivePond", data),
        deletePondRequest: async (id) => await axiosClient.delete(`Pond?PondId=${id}`),
        getHarvestTime: async (data) => await axiosClient.get(`/Pond/GetHarvestTime?pondId=${data}`),
    },
    timeRequest: {
        setTimeRequest: async (data) => await axiosClient.post("/TimeSetting", data),
        getTimeCleaning: async (farmId) => await axiosClient.get(`Pond/GetCleanTime?farmId=${farmId}`),
        postCleaningTime: async (data) => await axiosClient.post("Pond/CleanSensor", data)
    },
    setTimeRequest: {
        historySetTime: async (farmId) => await axiosClient.get(`/TimeSetting?farmId=${farmId}`)
    },
    authRequest : {
        register: async (data) => await axiosClient.post("/Account/Register", data),
        login: async (data) => await axiosClient.post("/Account/Login", data)
    }

}


export default DashboardRequestApi;