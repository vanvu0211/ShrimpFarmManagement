
const URLDomain = {
    baseURL: "https://shrimppond.runasp.net" + "/api",
    // baseURL: "http://103.170.122.142:81" + "/api",
    headers: {
        "Content-Type": "application/json",
    },
    validateStatus: (status) => status < 400,
}

export {
    URLDomain,
}
