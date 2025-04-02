import axiosClient from "./axiosClient"
const MachineRequestApi = {
    machineRequest: {
        getAllMachineByFarmId: async (farmId) => await axiosClient.get(`/Machine?farmId=${farmId}&pageSize=200&pageNumber=1`),
        getAllMachineByPondId: async (pondId) => await axiosClient.get(`/Machine/ByPondId?pondId=${pondId}&pageSize=200&pageNumber=1`),
        createMachine: async (data) => await axiosClient.post(`/Machine`, data),
        updateMachine: async (data) => await axiosClient.put(`/Machine`, data),
        deleteMachine: async (machineId) => await axiosClient.delete(`/Machine?machineId=${machineId}`),
    },
}
export default MachineRequestApi;