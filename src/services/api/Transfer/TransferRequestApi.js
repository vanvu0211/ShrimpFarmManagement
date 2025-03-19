import axiosClient from "./axiosClient"

const TransferRequest = {
    TransferRequestApi: {
        postTransfer: async (data) => await axiosClient.put('/Pond/TransferPond', data),
    }
}


export default TransferRequest;