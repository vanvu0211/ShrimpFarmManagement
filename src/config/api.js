
const URLDomain = {
    // baseURL: "https://shrimppond.runasp.net" + "/api",
    baseURL: "https://103.170.122.142:443" + "/api",
    headers: {
        "Content-Type": "application/json",
    },
    validateStatus: (status) => status < 400,
}

export {
    URLDomain,
}
