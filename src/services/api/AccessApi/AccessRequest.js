import axiosClient from "./axiosClient"

const AccessRequestApi = {
    AccessRequest: {
        getAccessRequestBySeedId: async (seedId="",harvestTime, famrId ) => await axiosClient.get(`/Traceability?farmId=${famrId}&seedId=${seedId}&harvestTime=${harvestTime}&pageSize=200&pageNumber=1`),
        getSeedIdList: async (famrId) => await axiosClient.get(`/Traceability/GetSeedId?farmId=${famrId}&pageSize=200&pageNumber=1`),
        getTimeHarvestList: async (famrId) => await axiosClient.get(`/Traceability/GetTimeHarvest?farmId=${famrId}&pageSize=200&pageNumber=1`),
    }
}

export default AccessRequestApi;