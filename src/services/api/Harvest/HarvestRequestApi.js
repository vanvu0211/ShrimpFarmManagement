import axiosClient from "./axiosClient"

const HarvestRequest = {
    HarvestRequestApi: {
        getHarvestTime: async (data) => await axiosClient.get(`/Pond/GetHarvestTime?pondId=${data}`),
        postHarvest: async (data) => await axiosClient.post('/Pond/HarvestPond', data),
    }
}


export default HarvestRequest;