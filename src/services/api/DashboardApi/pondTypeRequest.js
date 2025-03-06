import axiosClient from "./axiosClient"

const DashboardRequestApi = {
    pondTypeRequest: {
        getPondTypeRequest: async () => await axiosClient.get("/PondType?pageSize=200&pageNumber=1"),
        getPondTypeRequestByFarmName: async (farmName = "") => await axiosClient.get(`/PondType?farmName=${farmName}&pageSize=200&pageNumber=1`),

        createPondTypeRequest: async (data) => await axiosClient.post("/PondType", data),

        deletePondTypeRequest: async (name) => await axiosClient.delete(`/PondType?PondTypeName=${name}`),
        
    },
    pondRequest: {
        getPondRequest: async () => await axiosClient.get("/Pond?pageSize=200&pageNumber=1"),
        getPondRequestById: async (id ="", pondName = "") => await axiosClient.get(`/Pond?pondId=${id}&pondTypeName=${pondName}&pageSize=200&pageNumber=1`),
        getPondRequestByStatus: async (username, farmName, status ="") => await axiosClient.get(`/Pond/GetPondAd?userName=${username}&farmName=${farmName}&pondStatus=${status}`),
        getPondRequestByUsernameAndFarmName: async (username, farmName) => await axiosClient.get(`/Pond/GetPondAd?userName=${username}&farmName=${farmName}`),

        createPondRequest: async (data) => await axiosClient.post("Pond/CreatePond", data),
        updatePondRequest: async (data) => await axiosClient.put("/Pond/ActivePond", data),
        deletePondRequest: async (id) => await axiosClient.delete(`Pond?PondId=${id}`),
        getHarvestTime: async (data) => await axiosClient.get(`/Pond/GetHarvestTime?pondId=${data}`),
    },
    timeRequest: {
        setTimeRequest: async (data) => await axiosClient.post("/TimeSetting", data),
        getTimeCleaning: async () => await axiosClient.get("/Pond/GetCleanTime"),
        postCleaningTime: async (data) => await axiosClient.post("Pond/CleanSensor", data)
    },
    setTimeRequest: {
        historySetTime: async () => await axiosClient.get("/TimeSetting")
    },
    authRequest : {
        register: async (data) => await axiosClient.post("/Account/Register", data),
        login: async (data) => await axiosClient.post("/Account/Login", data)
    }

}


export default DashboardRequestApi;