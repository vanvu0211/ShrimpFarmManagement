import { data } from "autoprefixer";
import axiosClient from "./axiosClient"

const ConfigRequestApi = {
    alarmRequest: {
        GetConfig: async (farmId) => await axiosClient.get(`/Configuration?farmId=${farmId}`),
        SetConfig: async (data) => await axiosClient.post(`/Configuration`,data),
    },
}


export default ConfigRequestApi;